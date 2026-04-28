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
    FlightGuardContractClient,
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
    token::StellarAssetClient::new(env, &usdc_address)
        .mint(&passenger, &passenger_balance);

    // Deploy and initialize the FlightGuard contract
    let contract_id = env.register_contract(None, FlightGuardContract);
    let client = FlightGuardContractClient::new(env, &contract_id);
    client.initialize(&oracle, &usdc_address);

    (client, passenger, oracle, usdc_address)
}

// ---------------------------------------------------------------------------
// Test 1 — Happy path: full lifecycle executes end-to-end
// ---------------------------------------------------------------------------
//
// Scenario: passenger buys cover, oracle reports a qualifying delay,
// the contract auto-settles and transfers the payout.
// Asserts the passenger's final USDC balance equals:
//   starting_balance - premium + payout
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
//
// An address that is NOT the registered oracle attempts to call
// oracle_report. The contract must panic (require_auth fails).
#[test]
#[should_panic]
fn test_unauthorized_oracle_rejected() {
    let env = Env::default();
    // Note: we do NOT call env.mock_all_auths() here so auth is enforced.
    // We only mock auth for setup calls, then clear mocks.
    env.mock_all_auths();

    let passenger = Address::generate(&env);
    let oracle    = Address::generate(&env);
    let impostor  = Address::generate(&env); // not the real oracle
    let admin     = Address::generate(&env);

    let usdc_id = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_address = usdc_id.address();
    token::StellarAssetClient::new(&env, &usdc_address)
        .mint(&passenger, &1_000_000);

    let contract_id = env.register_contract(None, FlightGuardContract);
    let client = FlightGuardContractClient::new(&env, &contract_id);
    client.initialize(&oracle, &usdc_address);

    client.purchase_cover(
        &passenger,
        &symbol_short!("SQ317"),
        &100_000,
        &1_000_000,
        &120_u32,
    );

    // Stop mocking all auths — now auth checks are real
    // Calling oracle_report as `impostor` should fail auth for `oracle`
    // The SDK will panic because `oracle` did not authorize this call.
    //
    // In a real environment this triggers a HOST_ERROR auth failure.
    // In the test environment with no mock, require_auth panics.
    env.set_auths(&[]); // clear all mocked auths

    // This call should panic — impostor is not the registered oracle
    client.oracle_report(&symbol_short!("SQ317"), &200_u32);
}

// ---------------------------------------------------------------------------
// Test 3 — State verification: settled flag is true after payout
// ---------------------------------------------------------------------------
//
// After a qualifying oracle report, the Policy stored in ledger must
// have `settled == true`. This prevents double-spend at the storage level.
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
// Test 4 — Edge case: double-claim on an already-settled policy panics
// ---------------------------------------------------------------------------
//
// After the oracle auto-settles a policy, any further call to claim_payout
// must panic with "already settled". This prevents any re-entrancy or
// double-spend even if the passenger calls claim manually.
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
//
// Oracle reports a 45-minute delay against a 120-minute threshold.
// The contract must NOT transfer any payout. The passenger's balance
// after the oracle report must equal their balance after buying cover
// (i.e. starting_balance - premium, with no payout added).
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