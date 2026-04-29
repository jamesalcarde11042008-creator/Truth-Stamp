// flight_guard/src/test.rs
// Five Soroban unit tests for the FlightGuard parametric insurance contract.

#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::Address as _,
    token, Address, Env,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Deploy the contract + a mock USDC token, initialize everything,
/// and mint `passenger_balance` USDC stroops to the passenger.
/// Returns (client, passenger, oracle, usdc_address).
fn setup(
    env: &Env,
    passenger_balance: i128,
) -> (
    FlightGuardContractClient<'_>,
    Address, // passenger
    Address, // oracle
    Address, // usdc contract id
) {
    env.mock_all_auths();

    let passenger = Address::generate(env);
    let oracle    = Address::generate(env);
    let admin     = Address::generate(env);

    // Deploy a mock Stellar asset (acts as USDC in tests)
    let usdc_id = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_address = usdc_id.address();

    // Mint starting balance to the passenger
    let usdc_admin = token::StellarAssetClient::new(env, &usdc_address);
    usdc_admin.mint(&passenger, &passenger_balance);

    // Deploy and initialize the FlightGuard contract
    let contract_id = env.register(FlightGuardContract, ());
    let client = FlightGuardContractClient::new(env, &contract_id);
    client.initialize(&oracle, &usdc_address);

    // Fund the contract so it can pay out
    usdc_admin.mint(&contract_id, &100_000_000);

    (client, passenger, oracle, usdc_address)
}

// ---------------------------------------------------------------------------
// Test 1 — Happy path: full lifecycle executes end-to-end
// ---------------------------------------------------------------------------
#[test]
fn test_happy_path_full_lifecycle() {
    let env = Env::default();

    // Passenger starts with 10_000_000 stroops (1 USDC)
    let starting_balance: i128 = 10_000_000;
    let premium:          i128 =    320_000; // $0.032 USDC (scaled for test)
    let payout:           i128 = 10_000_000; // $1.00 USDC
    let threshold:        u32  = 120;         // 2 hours

    let (client, passenger, _oracle, usdc) = setup(&env, starting_balance);

    let flight_id = symbol_short!("PR742");

    // Step 1: passenger purchases cover — premium moves into contract
    client.purchase_cover(
        &passenger,
        &flight_id,
        &premium,
        &payout,
        &threshold,
    );

    // Step 2: oracle reports a 134-minute delay (above threshold)
    client.oracle_report(&flight_id, &134_u32);

    // Step 3: verify passenger received the payout
    let final_balance = token::Client::new(&env, &usdc).balance(&passenger);
    assert_eq!(
        final_balance,
        starting_balance - premium + payout,
        "passenger should receive payout after qualifying delay"
    );
}

// ---------------------------------------------------------------------------
// Test 2 — Edge case: unauthorized oracle call is rejected
// ---------------------------------------------------------------------------
#[test]
#[should_panic(expected = "HostError: Error(Auth, InvalidAction)")]
fn test_unauthorized_oracle_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let passenger = Address::generate(&env);
    let oracle    = Address::generate(&env);
    let impostor  = Address::generate(&env); 
    let admin     = Address::generate(&env);

    let usdc_id = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_address = usdc_id.address();
    token::StellarAssetClient::new(&env, &usdc_address)
        .mint(&passenger, &1_000_000);

    let contract_id = env.register(FlightGuardContract, ());
    let client = FlightGuardContractClient::new(&env, &contract_id);
    client.initialize(&oracle, &usdc_address);

    client.purchase_cover(
        &passenger,
        &symbol_short!("SQ317"),
        &100_000,
        &1_000_000,
        &120_u32,
    );

    env.set_auths(&[]); 

    // This call should fail because impostor is not the oracle
    // In Soroban, unauthorized require_auth often panics with HostError
    client.oracle_report(&symbol_short!("SQ317"), &200_u32);
}

// ---------------------------------------------------------------------------
// Test 3 — State verification: settled flag is true after payout
// ---------------------------------------------------------------------------
#[test]
fn test_policy_settled_flag_after_oracle_payout() {
    let env = Env::default();
    let (client, passenger, _oracle, _usdc) = setup(&env, 5_000_000);

    let flight_id = symbol_short!("CX837");

    client.purchase_cover(
        &passenger,
        &flight_id,
        &300_000,  // premium
        &3_000_000, // payout
        &120_u32,   // 2h threshold
    );

    // Oracle reports 145 minutes — above threshold
    client.oracle_report(&flight_id, &145_u32);

    // Read the policy back from ledger storage
    let policy = client.get_policy(&flight_id);

    assert!(
        policy.settled,
        "policy.settled must be true after qualifying oracle report"
    );
    assert_eq!(
        policy.passenger, passenger,
        "policy should still reference the correct passenger"
    );
}

// ---------------------------------------------------------------------------
// Test 4 — Edge case: double-claim on an already-settled policy
// ---------------------------------------------------------------------------
#[test]
#[should_panic(expected = "already settled")]
fn test_double_claim_rejected() {
    let env = Env::default();
    let (client, passenger, _oracle, _usdc) = setup(&env, 10_000_000);

    let flight_id = symbol_short!("EK432");

    client.purchase_cover(
        &passenger,
        &flight_id,
        &320_000,
        &5_000_000,
        &120_u32,
    );

    // Oracle auto-settles on first report
    client.oracle_report(&flight_id, &180_u32);

    // Passenger also tries to manually claim — must panic
    client.claim_payout(&flight_id, &180_u32);
}

// ---------------------------------------------------------------------------
// Test 5 — No payout when delay is below the threshold
// ---------------------------------------------------------------------------
#[test]
fn test_no_payout_when_delay_below_threshold() {
    let env = Env::default();

    let starting_balance: i128 = 10_000_000;
    let premium:          i128 =    320_000;
    let payout:           i128 =  5_000_000;
    let threshold:        u32  = 120;

    let (client, passenger, _oracle, usdc) = setup(&env, starting_balance);

    let flight_id = symbol_short!("PR001");

    client.purchase_cover(
        &passenger,
        &flight_id,
        &premium,
        &payout,
        &threshold,
    );

    // Balance after purchase — premium has been deducted
    let balance_after_purchase =
        token::Client::new(&env, &usdc).balance(&passenger);
    assert_eq!(balance_after_purchase, starting_balance - premium);

    // Oracle reports only 45 minutes — below 120-minute threshold
    client.oracle_report(&flight_id, &45_u32);

    // Balance must be unchanged — no payout was triggered
    let balance_after_report =
        token::Client::new(&env, &usdc).balance(&passenger);
    assert_eq!(
        balance_after_report,
        starting_balance - premium,
        "balance must not change when delay is below threshold"
    );

    // Policy must NOT be settled
    let policy = client.get_policy(&flight_id);
    assert!(
        !policy.settled,
        "policy must remain unsettled when threshold is not met"
    );
}
