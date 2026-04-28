import { Buffer } from "buffer";
import * as StellarSdk from "@stellar/stellar-sdk";
const { Address } = StellarSdk;
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export { StellarSdk };
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CC7VMNV5B4L3IHKMPUKLBEBVQ42YCH3J57ZI2SLWQF4S45EDPA6T3JUK",
  }
} as const


/**
 * A single parametric insurance policy
 */
export interface Policy {
  /**
 * Minimum delay in minutes that triggers a payout
 */
delay_min: u32;
  /**
 * Flight identifier (e.g. "PR742")
 */
flight_id: string;
  /**
 * Stellar address of the insured passenger
 */
passenger: string;
  /**
 * Payout amount sent to passenger when delay threshold is met
 */
payout: i128;
  /**
 * Premium paid by passenger, in USDC stroops (1 USDC = 10_000_000 stroops)
 */
premium: i128;
  /**
 * Whether this policy has already been settled (prevents double-pay)
 */
settled: boolean;
}

export type DataKey = {tag: "Policy", values: readonly [string]} | {tag: "Oracle", values: void} | {tag: "UsdcToken", values: void};

export interface Client {
  /**
   * Construct and simulate a get_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the authorized oracle address.
   */
  get_oracle: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_policy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the current state of a policy. Useful for frontends and oracles.
   */
  get_policy: ({flight_id}: {flight_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Policy>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * One-time initialization.
   * Sets the authorized oracle address and the USDC token contract address.
   * Must be called immediately after deployment before any other function.
   * 
   * # Arguments
   * * `oracle` — address of the off-chain oracle keeper authorized to call `oracle_report`
   * * `usdc`   — address of the USDC Stellar asset contract
   */
  initialize: ({oracle, usdc}: {oracle: string, usdc: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a claim_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Passenger-initiated manual claim fallback.
   * 
   * Useful if the oracle already wrote a qualifying delay but the
   * auto-settle inside `oracle_report` was not triggered (e.g. the
   * passenger purchased cover after the oracle reported). Requires
   * that a delay has already been reported and the threshold met.
   * 
   * # Arguments
   * * `flight_id` — the policy to claim against
   * * `reported_delay` — the delay minutes that were previously reported
   * (contract re-checks the threshold)
   */
  claim_payout: ({flight_id, reported_delay}: {flight_id: string, reported_delay: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a oracle_report transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Called by the authorized oracle when a flight delay is confirmed.
   * 
   * If the reported delay meets or exceeds the policy threshold, this
   * function automatically transfers the payout to the passenger's wallet
   * and marks the policy as settled — no passenger action required.
   * 
   * # Arguments
   * * `flight_id`      — the flight whose delay is being reported
   * * `delay_minutes`  — confirmed delay in minutes (from airport data feed)
   */
  oracle_report: ({flight_id, delay_minutes}: {flight_id: string, delay_minutes: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a purchase_cover transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Passenger purchases parametric delay cover for a specific flight.
   * 
   * Transfers `premium` USDC stroops from `passenger` into the contract
   * (escrow). Stores the Policy in ledger storage keyed by `flight_id`.
   * Returns the `flight_id` as the policy identifier.
   * 
   * # Arguments
   * * `passenger`  — the insured passenger's Stellar address
   * * `flight_id`  — short flight code, e.g. symbol_short!("PR742")
   * * `premium`    — amount in USDC stroops to be collected now
   * * `payout`     — amount in USDC stroops to send on confirmed delay
   * * `delay_min`  — minimum delay minutes required to trigger payout
   */
  purchase_cover: ({passenger, flight_id, premium, payout, delay_min}: {passenger: string, flight_id: string, premium: i128, payout: i128, delay_min: u32}, options?: MethodOptions) => Promise<AssembledTransaction<string>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAACRBIHNpbmdsZSBwYXJhbWV0cmljIGluc3VyYW5jZSBwb2xpY3kAAAAAAAAABlBvbGljeQAAAAAABgAAAC9NaW5pbXVtIGRlbGF5IGluIG1pbnV0ZXMgdGhhdCB0cmlnZ2VycyBhIHBheW91dAAAAAAJZGVsYXlfbWluAAAAAAAABAAAACBGbGlnaHQgaWRlbnRpZmllciAoZS5nLiAiUFI3NDIiKQAAAAlmbGlnaHRfaWQAAAAAAAARAAAAKFN0ZWxsYXIgYWRkcmVzcyBvZiB0aGUgaW5zdXJlZCBwYXNzZW5nZXIAAAAJcGFzc2VuZ2VyAAAAAAAAEwAAADtQYXlvdXQgYW1vdW50IHNlbnQgdG8gcGFzc2VuZ2VyIHdoZW4gZGVsYXkgdGhyZXNob2xkIGlzIG1ldAAAAAAGcGF5b3V0AAAAAAALAAAASFByZW1pdW0gcGFpZCBieSBwYXNzZW5nZXIsIGluIFVTREMgc3Ryb29wcyAoMSBVU0RDID0gMTBfMDAwXzAwMCBzdHJvb3BzKQAAAAdwcmVtaXVtAAAAAAsAAABCV2hldGhlciB0aGlzIHBvbGljeSBoYXMgYWxyZWFkeSBiZWVuIHNldHRsZWQgKHByZXZlbnRzIGRvdWJsZS1wYXkpAAAAAAAHc2V0dGxlZAAAAAAB",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAApTWFwcyBmbGlnaHRfaWQgKFN5bWJvbCkg4oaSIFBvbGljeSBzdHJ1Y3QAAAAAAAAGUG9saWN5AAAAAAABAAAAEQAAAAAAAAA9VGhlIHNpbmdsZSBhdXRob3JpemVkIG9yYWNsZSBhZGRyZXNzIGFsbG93ZWQgdG8gcmVwb3J0IGRlbGF5cwAAAAAAAAZPcmFjbGUAAAAAAAAAAAA2VGhlIFVTREMgdG9rZW4gY29udHJhY3QgYWRkcmVzcyB1c2VkIGZvciBhbGwgdHJhbnNmZXJzAAAAAAAJVXNkY1Rva2VuAAAA",
        "AAAAAAAAACZSZXR1cm5zIHRoZSBhdXRob3JpemVkIG9yYWNsZSBhZGRyZXNzLgAAAAAACmdldF9vcmFjbGUAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAAEhSZXR1cm5zIHRoZSBjdXJyZW50IHN0YXRlIG9mIGEgcG9saWN5LiBVc2VmdWwgZm9yIGZyb250ZW5kcyBhbmQgb3JhY2xlcy4AAAAKZ2V0X3BvbGljeQAAAAAAAQAAAAAAAAAJZmxpZ2h0X2lkAAAAAAAAEQAAAAEAAAfQAAAABlBvbGljeQAA",
        "AAAAAAAAAUdPbmUtdGltZSBpbml0aWFsaXphdGlvbi4KU2V0cyB0aGUgYXV0aG9yaXplZCBvcmFjbGUgYWRkcmVzcyBhbmQgdGhlIFVTREMgdG9rZW4gY29udHJhY3QgYWRkcmVzcy4KTXVzdCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgZGVwbG95bWVudCBiZWZvcmUgYW55IG90aGVyIGZ1bmN0aW9uLgoKIyBBcmd1bWVudHMKKiBgb3JhY2xlYCDigJQgYWRkcmVzcyBvZiB0aGUgb2ZmLWNoYWluIG9yYWNsZSBrZWVwZXIgYXV0aG9yaXplZCB0byBjYWxsIGBvcmFjbGVfcmVwb3J0YAoqIGB1c2RjYCAgIOKAlCBhZGRyZXNzIG9mIHRoZSBVU0RDIFN0ZWxsYXIgYXNzZXQgY29udHJhY3QAAAAACmluaXRpYWxpemUAAAAAAAIAAAAAAAAABm9yYWNsZQAAAAAAEwAAAAAAAAAEdXNkYwAAABMAAAAA",
        "AAAAAAAAAcpQYXNzZW5nZXItaW5pdGlhdGVkIG1hbnVhbCBjbGFpbSBmYWxsYmFjay4KClVzZWZ1bCBpZiB0aGUgb3JhY2xlIGFscmVhZHkgd3JvdGUgYSBxdWFsaWZ5aW5nIGRlbGF5IGJ1dCB0aGUKYXV0by1zZXR0bGUgaW5zaWRlIGBvcmFjbGVfcmVwb3J0YCB3YXMgbm90IHRyaWdnZXJlZCAoZS5nLiB0aGUKcGFzc2VuZ2VyIHB1cmNoYXNlZCBjb3ZlciBhZnRlciB0aGUgb3JhY2xlIHJlcG9ydGVkKS4gUmVxdWlyZXMKdGhhdCBhIGRlbGF5IGhhcyBhbHJlYWR5IGJlZW4gcmVwb3J0ZWQgYW5kIHRoZSB0aHJlc2hvbGQgbWV0LgoKIyBBcmd1bWVudHMKKiBgZmxpZ2h0X2lkYCDigJQgdGhlIHBvbGljeSB0byBjbGFpbSBhZ2FpbnN0CiogYHJlcG9ydGVkX2RlbGF5YCDigJQgdGhlIGRlbGF5IG1pbnV0ZXMgdGhhdCB3ZXJlIHByZXZpb3VzbHkgcmVwb3J0ZWQKKGNvbnRyYWN0IHJlLWNoZWNrcyB0aGUgdGhyZXNob2xkKQAAAAAADGNsYWltX3BheW91dAAAAAIAAAAAAAAACWZsaWdodF9pZAAAAAAAABEAAAAAAAAADnJlcG9ydGVkX2RlbGF5AAAAAAAEAAAAAA==",
        "AAAAAAAAAaRDYWxsZWQgYnkgdGhlIGF1dGhvcml6ZWQgb3JhY2xlIHdoZW4gYSBmbGlnaHQgZGVsYXkgaXMgY29uZmlybWVkLgoKSWYgdGhlIHJlcG9ydGVkIGRlbGF5IG1lZXRzIG9yIGV4Y2VlZHMgdGhlIHBvbGljeSB0aHJlc2hvbGQsIHRoaXMKZnVuY3Rpb24gYXV0b21hdGljYWxseSB0cmFuc2ZlcnMgdGhlIHBheW91dCB0byB0aGUgcGFzc2VuZ2VyJ3Mgd2FsbGV0CmFuZCBtYXJrcyB0aGUgcG9saWN5IGFzIHNldHRsZWQg4oCUIG5vIHBhc3NlbmdlciBhY3Rpb24gcmVxdWlyZWQuCgojIEFyZ3VtZW50cwoqIGBmbGlnaHRfaWRgICAgICAg4oCUIHRoZSBmbGlnaHQgd2hvc2UgZGVsYXkgaXMgYmVpbmcgcmVwb3J0ZWQKKiBgZGVsYXlfbWludXRlc2AgIOKAlCBjb25maXJtZWQgZGVsYXkgaW4gbWludXRlcyAoZnJvbSBhaXJwb3J0IGRhdGEgZmVlZCkAAAANb3JhY2xlX3JlcG9ydAAAAAAAAAIAAAAAAAAACWZsaWdodF9pZAAAAAAAABEAAAAAAAAADWRlbGF5X21pbnV0ZXMAAAAAAAAEAAAAAA==",
        "AAAAAAAAAk1QYXNzZW5nZXIgcHVyY2hhc2VzIHBhcmFtZXRyaWMgZGVsYXkgY292ZXIgZm9yIGEgc3BlY2lmaWMgZmxpZ2h0LgoKVHJhbnNmZXJzIGBwcmVtaXVtYCBVU0RDIHN0cm9vcHMgZnJvbSBgcGFzc2VuZ2VyYCBpbnRvIHRoZSBjb250cmFjdAooZXNjcm93KS4gU3RvcmVzIHRoZSBQb2xpY3kgaW4gbGVkZ2VyIHN0b3JhZ2Uga2V5ZWQgYnkgYGZsaWdodF9pZGAuClJldHVybnMgdGhlIGBmbGlnaHRfaWRgIGFzIHRoZSBwb2xpY3kgaWRlbnRpZmllci4KCiMgQXJndW1lbnRzCiogYHBhc3NlbmdlcmAgIOKAlCB0aGUgaW5zdXJlZCBwYXNzZW5nZXIncyBTdGVsbGFyIGFkZHJlc3MKKiBgZmxpZ2h0X2lkYCAg4oCUIHNob3J0IGZsaWdodCBjb2RlLCBlLmcuIHN5bWJvbF9zaG9ydCEoIlBSNzQyIikKKiBgcHJlbWl1bWAgICAg4oCUIGFtb3VudCBpbiBVU0RDIHN0cm9vcHMgdG8gYmUgY29sbGVjdGVkIG5vdwoqIGBwYXlvdXRgICAgICDigJQgYW1vdW50IGluIFVTREMgc3Ryb29wcyB0byBzZW5kIG9uIGNvbmZpcm1lZCBkZWxheQoqIGBkZWxheV9taW5gICDigJQgbWluaW11bSBkZWxheSBtaW51dGVzIHJlcXVpcmVkIHRvIHRyaWdnZXIgcGF5b3V0AAAAAAAADnB1cmNoYXNlX2NvdmVyAAAAAAAFAAAAAAAAAAlwYXNzZW5nZXIAAAAAAAATAAAAAAAAAAlmbGlnaHRfaWQAAAAAAAARAAAAAAAAAAdwcmVtaXVtAAAAAAsAAAAAAAAABnBheW91dAAAAAAACwAAAAAAAAAJZGVsYXlfbWluAAAAAAAABAAAAAEAAAAR" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_oracle: this.txFromJSON<string>,
        get_policy: this.txFromJSON<Policy>,
        initialize: this.txFromJSON<null>,
        claim_payout: this.txFromJSON<null>,
        oracle_report: this.txFromJSON<null>,
        purchase_cover: this.txFromJSON<string>
  }
}