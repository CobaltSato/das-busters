// snarkjs ships without types; this covers the calls we make.
declare module "snarkjs" {
  export type Groth16Proof = {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };

  export const groth16: {
    fullProve(
      input: Record<string, string>,
      wasmFile: string,
      zkeyFile: string,
    ): Promise<{ proof: Groth16Proof; publicSignals: string[] }>;
    verify(verificationKey: unknown, publicSignals: string[], proof: Groth16Proof): Promise<boolean>;
    exportSolidityCallData(proof: Groth16Proof, publicSignals: string[]): Promise<string>;
  };
}
