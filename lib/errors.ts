// Thrown when a proof or its inputs break a rule. The API reports the
// message to the user as it is, with a code the UI can translate.
export class ProofError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly params?: Record<string, string>,
  ) {
    super(message);
  }
}
