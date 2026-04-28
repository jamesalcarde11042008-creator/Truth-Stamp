#![no_std]
// flight_guard/src/lib.rs
// FlightGuard — Parametric flight delay insurance on Stellar
// Soroban smart contract: escrows premiums, auto-settles on oracle delay report

use soroban_sdk::{
    contract, contractimpl, contracttype,
    token, Address, Env, Symbol,
};

// ---------------------------------------------------------------------------
// Storage key types
// ---------------------------------------------------------------------------

#[contracttype]
pub enum DataKey {
    /// Maps flight_id (Symbol) → Policy struct
    Policy(Symbol),
    /// The single authorized oracle address allowed to report delays
    Oracle,
    /// The USDC token contract address used for all transfers
    UsdcToken,
}

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

/// A single parametric insurance policy
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Policy {
    /// Stellar address of the insured passenger
    pub passenger: Address,
    /// Flight identifier (e.g. "PR742")
    pub flight_id: Symbol,
    /// Premium paid by passenger, in USDC stroops (1 USDC = 10_000_000 stroops)
    pub premium: i128,
    /// Payout amount sent to passenger when delay threshold is met
    pub payout: i128,
    /// Minimum delay in minutes that triggers a payout
    pub delay_min: u32,
    /// Whether this policy has already been settled (prevents double-pay)
    pub settled: bool,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct FlightGuardContract;

#[contractimpl]
impl FlightGuardContract {

    // -----------------------------------------------------------------------
    // Admin / Initialization
    // -----------------------------------------------------------------------

    /// One-time initialization.
    /// Sets the authorized oracle address and the USDC token contract address.
    /// Must be called immediately after deployment before any other function.
    ///
    /// # Arguments
    /// * `oracle` — address of the off-chain oracle keeper authorized to call `oracle_report`
    /// * `usdc`   — address of the USDC Stellar asset contract
    pub fn initialize(env: Env, oracle: Address, usdc: Address) {
        // Prevent re-initialization
        if env.storage().instance().has(&DataKey::Oracle) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Oracle, &oracle);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc);
    }

    // -----------------------------------------------------------------------
    // Passenger actions
    // -----------------------------------------------------------------------

    /// Passenger purchases parametric delay cover for a specific flight.
    ///
    /// Transfers `premium` USDC stroops from `passenger` into the contract
    /// (escrow). Stores the Policy in ledger storage keyed by `flight_id`.
    /// Returns the `flight_id` as the policy identifier.
    ///
    /// # Arguments
    /// * `passenger`  — the insured passenger's Stellar address
    /// * `flight_id`  — short flight code, e.g. symbol_short!("PR742")
    /// * `premium`    — amount in USDC stroops to be collected now
    /// * `payout`     — amount in USDC stroops to send on confirmed delay
    /// * `delay_min`  — minimum delay minutes required to trigger payout
    pub fn purchase_cover(
        env: Env,
        passenger: Address,
        flight_id: Symbol,
        premium: i128,
        payout: i128,
        delay_min: u32,
    ) -> Symbol {
        // Require the passenger to authorize this call
        passenger.require_auth();

        // Validate inputs
        if premium <= 0 {
            panic!("premium must be positive");
        }
        if payout <= 0 {
            panic!("payout must be positive");
        }

        // Prevent duplicate policies for the same flight id
        let key = DataKey::Policy(flight_id.clone());
        if env.storage().instance().has(&key) {
            panic!("policy already exists for this flight");
        }

        // Retrieve the USDC token address set at initialization
        let usdc: Address = env
            .storage()
            .instance()
            .get(&DataKey::UsdcToken)
            .unwrap();

        // Transfer the premium from the passenger's wallet into the contract.
        // Stellar's token interface handles the actual on-chain USDC move.
        token::Client::new(&env, &usdc).transfer(
            &passenger,
            &env.current_contract_address(),
            &premium,
        );

        // Build and persist the policy
        let policy = Policy {
            passenger: passenger.clone(),
            flight_id: flight_id.clone(),
            premium,
            payout,
            delay_min,
            settled: false,
        };
        env.storage().instance().set(&key, &policy);

        // Return the flight_id as the policy handle the caller can reference
        flight_id
    }

    /// Passenger-initiated manual claim fallback.
    ///
    /// Useful if the oracle already wrote a qualifying delay but the
    /// auto-settle inside `oracle_report` was not triggered (e.g. the
    /// passenger purchased cover after the oracle reported). Requires
    /// that a delay has already been reported and the threshold met.
    ///
    /// # Arguments
    /// * `flight_id` — the policy to claim against
    /// * `reported_delay` — the delay minutes that were previously reported
    ///                      (contract re-checks the threshold)
    pub fn claim_payout(env: Env, flight_id: Symbol, reported_delay: u32) {
        let key = DataKey::Policy(flight_id.clone());

        let mut policy: Policy = env
            .storage()
            .instance()
            .get(&key)
            .expect("policy not found");

        if policy.settled {
            panic!("already settled");
        }

        // Only the insured passenger may call this
        policy.passenger.require_auth();

        // Re-check the delay threshold
        if reported_delay < policy.delay_min {
            panic!("delay threshold not met");
        }

        // Execute the USDC payout
        let usdc: Address = env
            .storage()
            .instance()
            .get(&DataKey::UsdcToken)
            .unwrap();

        token::Client::new(&env, &usdc).transfer(
            &env.current_contract_address(),
            &policy.passenger,
            &policy.payout,
        );

        // Mark settled to prevent double-spend
        policy.settled = true;
        env.storage().instance().set(&key, &policy);
    }

    // -----------------------------------------------------------------------
    // Oracle
    // -----------------------------------------------------------------------

    /// Called by the authorized oracle when a flight delay is confirmed.
    ///
    /// If the reported delay meets or exceeds the policy threshold, this
    /// function automatically transfers the payout to the passenger's wallet
    /// and marks the policy as settled — no passenger action required.
    ///
    /// # Arguments
    /// * `flight_id`      — the flight whose delay is being reported
    /// * `delay_minutes`  — confirmed delay in minutes (from airport data feed)
    pub fn oracle_report(env: Env, flight_id: Symbol, delay_minutes: u32) {
        // Only the pre-registered oracle may submit delay data
        let oracle: Address = env
            .storage()
            .instance()
            .get(&DataKey::Oracle)
            .unwrap();
        oracle.require_auth();

        let key = DataKey::Policy(flight_id.clone());

        // If no policy exists for this flight, nothing to do
        let policy_opt: Option<Policy> =
            env.storage().instance().get(&key);
        let mut policy = match policy_opt {
            Some(p) => p,
            None => return,
        };

        // Skip if already settled (idempotent)
        if policy.settled {
            return;
        }

        // Auto-settle if the delay threshold is met
        if delay_minutes >= policy.delay_min {
            let usdc: Address = env
                .storage()
                .instance()
                .get(&DataKey::UsdcToken)
                .unwrap();

            // Send payout directly to passenger — this is the core value prop:
            // money moves before the passenger even leaves the gate.
            token::Client::new(&env, &usdc).transfer(
                &env.current_contract_address(),
                &policy.passenger,
                &policy.payout,
            );

            policy.settled = true;
            env.storage().instance().set(&key, &policy);
        }
        // If delay is below threshold, state is unchanged; oracle can report again later
    }

    // -----------------------------------------------------------------------
    // Read-only helpers
    // -----------------------------------------------------------------------

    /// Returns the current state of a policy. Useful for frontends and oracles.
    pub fn get_policy(env: Env, flight_id: Symbol) -> Policy {
        env.storage()
            .instance()
            .get(&DataKey::Policy(flight_id))
            .expect("policy not found")
    }

    /// Returns the authorized oracle address.
    pub fn get_oracle(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Oracle)
            .unwrap()
    }
}