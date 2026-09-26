import "server-only";
import { TOKYO, type CredentialPreview } from "./credential";

// Stand-in for the family register at the city office. A real issuer would
// look the resident up after checking their ID at the counter.
const RESIDENTS: Record<string, Omit<CredentialPreview, "issuedAt">> = {
  "shibuya-0003": {
    type: "Single Status Certificate",
    holder: "Ken Sato",
    birthDate: "1990-04-18",
    maritalStatus: "Single",
    residenceCode: TOKYO,
    residence: "Tokyo",
    issuer: "Shibuya City, Tokyo",
    statement: "This certifies that the holder was not married as of the date of issue.",
  },
};

export const COUNTER_RESIDENT = "shibuya-0003";

export function findResident(id: string, issuedAt: string): CredentialPreview | null {
  const resident = RESIDENTS[id];
  return resident ? { ...resident, issuedAt } : null;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
