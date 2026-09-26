import { z } from "zod";
import { SIGNAL_ORDER } from "./presentation";

// Input validation for the API routes.

const decimal = z.string().regex(/^\d{1,78}$/, "Expected a decimal field element");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CredentialSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.literal("Single Status Certificate"),
  holder: z.string().min(1).max(120),
  birthDate: isoDate,
  maritalStatus: z.literal("Single"),
  residenceCode: z.number().int().min(1).max(47),
  residence: z.string().min(1).max(60),
  issuer: z.string().min(1).max(120),
  issuedAt: isoDate,
  statement: z.string().max(300),
  holderCommitment: decimal,
  signature: z.discriminatedUnion("scheme", [
    z.object({ scheme: z.literal("mock"), mac: z.string().regex(/^[0-9a-f]{64}$/) }),
    z.object({
      scheme: z.literal("eddsa-poseidon"),
      R8x: decimal,
      R8y: decimal,
      S: decimal,
      Ax: decimal,
      Ay: decimal,
    }),
  ]),
});

const signalShape = Object.fromEntries(SIGNAL_ORDER.map((name) => [name, decimal])) as Record<
  (typeof SIGNAL_ORDER)[number],
  typeof decimal
>;

export const PresentationSchema = z.object({
  prover: z.enum(["mock", "groth16"]),
  publicSignals: z.object(signalShape),
  proof: z.unknown(),
  provingMs: z.number().nonnegative(),
});

export const OfferClaimBody = z.object({
  offer: z.string().min(1),
  holderCommitment: decimal,
});

export const RequestBody = z.object({
  epoch: z.string().regex(/^\d{1,18}$/),
});

export const ProveBody = z.object({
  request: z.string().min(1),
  credential: CredentialSchema,
  holderSecret: decimal,
  disclose: z.object({ residence: z.boolean(), ageRange: z.boolean() }),
});

export const VerifyBody = z.object({
  request: z.string().min(1),
  presentation: PresentationSchema,
  humanCheck: z.enum(["simulated", "world-id"]).nullable(),
});
