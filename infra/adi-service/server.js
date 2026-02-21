import "dotenv/config";
import express from "express";
import cors from "cors";

import { createPublicClient, createWalletClient, http, parseAbi, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const PORT = Number(process.env.PORT || "8787");
const CHAIN_ID = Number(process.env.CHAIN_ID || "99999");
const RPC_URL = process.env.RPC_URL;
const CONTRACT = process.env.CONTRACT;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!RPC_URL || !CONTRACT || !PRIVATE_KEY) {
  console.error("Missing RPC_URL / CONTRACT / PRIVATE_KEY in env");
  process.exit(1);
}

const chain = {
  id: CHAIN_ID,
  name: "ADI Testnet",
  nativeCurrency: { name: "ADI", symbol: "ADI", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
};

const abi = parseAbi([
  "function anchor(bytes32 sessionIdHash, bytes32 payloadHash, uint64 submittedAt)",
]);

const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
const walletClient = createWalletClient({ account, chain, transport: http(RPC_URL) });

function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

function isoToUnixSeconds(iso) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new Error("payload.submittedAt must be ISO time string");
  return Math.floor(ms / 1000);
}

function hashTextToBytes32(text) {
  return keccak256(toBytes(text));
}

function validate(body) {
  if (!body || typeof body !== "object") throw new Error("Body must be JSON object");
  if (!body.contractId) throw new Error("Missing contractId");
  if (!body.payload || typeof body.payload !== "object") throw new Error("Missing payload");

  const p = body.payload;
  const required = [
    "clinic",
    "patient",
    "publicHealthAuth",
    "sessionId",
    "diagnosis",
    "symptomHash",
    "confidence",
    "submittedAt",
    "anchored",
  ];
  const missing = required.filter(k => p[k] === undefined || p[k] === null);
  if (missing.length) throw new Error("Missing payload fields: " + missing.join(", "));
  return body;
}

// IMPORTANT: do NOT include anchored in payloadHash (it changes false->true)
function payloadToHash(payload) {
  const { anchored, ...rest } = payload;
  return rest;
}

async function anchorRecord(record) {
  const p = record.payload;

  const sessionIdHash = hashTextToBytes32(String(p.sessionId));
  const payloadHash = hashTextToBytes32(stableStringify(payloadToHash(p)));
  const submittedAt = isoToUnixSeconds(String(p.submittedAt));

  const txHash = await walletClient.writeContract({
    address: CONTRACT,
    abi,
    functionName: "anchor",
    args: [sessionIdHash, payloadHash, submittedAt],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  return {
    txHash,
    blockNumber: receipt.blockNumber?.toString?.() ?? receipt.blockNumber,
    sessionIdHash,
    payloadHash,
    submittedAt,
  };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/anchor", async (req, res) => {
  try {
    const record = validate(req.body);
    const result = await anchorRecord(record);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Anchor service running: http://localhost:${PORT}`);
});
