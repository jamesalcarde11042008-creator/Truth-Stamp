import { Client, networks } from "./flight-guard-client";
import { isConnected, getAddress, signTransaction } from "@stellar/freighter-api";
import { rpc } from "@stellar/stellar-sdk";

export const CONTRACT_ID = networks.testnet.contractId;
export const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;
export const RPC_URL = "https://soroban-testnet.stellar.org";

const server = new rpc.Server(RPC_URL, { allowHttp: true });

export const client = new Client({
  ...networks.testnet,
  rpcUrl: RPC_URL,
  allowHttp: true,
});

export async function connectWallet() {
  if (await isConnected()) {
    const result = await getAddress();
    if (typeof result === "string") return result;
    if (result && typeof result === "object" && "address" in result) {
      return (result as any).address as string;
    }
    return result as string; // Fallback
  }
  return null;
}

export async function purchaseCover(flightId: string, premium: number, payout: number, delayMin: number) {
  const result = await getAddress();
  if (!result) throw new Error("Wallet not connected");

  // Handle both string and object returns from Freighter
  const address = typeof result === "string" ? result : result.address;
  if (!address) throw new Error("Could not retrieve wallet address");

  // USDC has 7 decimals on Stellar
  const premiumBigInt = BigInt(Math.floor(premium * 10_000_000));
  const payoutBigInt = BigInt(Math.floor(payout * 10_000_000));

  console.log("Purchasing cover for:", { address, flightId, premiumBigInt, payoutBigInt, delayMin });

  const tx = await client.purchase_cover({
    passenger: address,
    flight_id: flightId,
    premium: premiumBigInt,
    payout: payoutBigInt,
    delay_min: delayMin,
  });

  // To actually send, we need to sign with Freighter
  const signedTxXdr = await signTransaction(tx.toXdr(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const sendResponse = await server.sendTransaction(signedTxXdr);
  if (sendResponse.status === "PENDING") {
    let txResponse = await server.getTransaction(sendResponse.hash);
    while (txResponse.status === "NOT_FOUND" || txResponse.status === "PENDING") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      txResponse = await server.getTransaction(sendResponse.hash);
    }
    return txResponse;
  }
  return sendResponse;
}
