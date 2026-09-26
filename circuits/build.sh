#!/usr/bin/env bash
# Compiles the circuit, runs a local Groth16 setup and copies the runtime
# artifacts where the app reads them. Re-running reuses the ptau.
#
# The official ptau mirrors answer 403, so the powers of tau are generated
# here with a single contribution. Good enough for a demo, not for production.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="$ROOT/circuits/build"
SNARKJS="$ROOT/node_modules/.bin/snarkjs"
CIRCOM="$ROOT/node_modules/.bin/circom2"
NAME=single_proof
POWER="${PTAU_POWER:-14}"

mkdir -p "$BUILD" "$ROOT/public/zk" "$ROOT/lib/zk" "$ROOT/contracts/src"

echo "==> compile"
"$CIRCOM" "$ROOT/circuits/$NAME.circom" --r1cs --wasm --sym -l "$ROOT/node_modules" -o "$BUILD"
"$SNARKJS" r1cs info "$BUILD/$NAME.r1cs"

if [ ! -f "$BUILD/pot_final.ptau" ]; then
  echo "==> powers of tau 2^$POWER"
  "$SNARKJS" powersoftau new bn128 "$POWER" "$BUILD/pot_0000.ptau"
  "$SNARKJS" powersoftau contribute "$BUILD/pot_0000.ptau" "$BUILD/pot_0001.ptau" \
    --name=local -e="$(head -c 48 /dev/urandom | base64)"
  "$SNARKJS" powersoftau prepare phase2 "$BUILD/pot_0001.ptau" "$BUILD/pot_final.ptau"
fi

echo "==> groth16 setup"
"$SNARKJS" groth16 setup "$BUILD/$NAME.r1cs" "$BUILD/pot_final.ptau" "$BUILD/${NAME}_0000.zkey"
"$SNARKJS" zkey contribute "$BUILD/${NAME}_0000.zkey" "$BUILD/${NAME}_final.zkey" \
  --name=local -e="$(head -c 48 /dev/urandom | base64)"
"$SNARKJS" zkey export verificationkey "$BUILD/${NAME}_final.zkey" "$ROOT/lib/zk/verification_key.json"
"$SNARKJS" zkey export solidityverifier "$BUILD/${NAME}_final.zkey" "$ROOT/contracts/src/Groth16Verifier.sol"

cp "$BUILD/${NAME}_js/${NAME}.wasm" "$ROOT/public/zk/$NAME.wasm"
cp "$BUILD/${NAME}_final.zkey" "$ROOT/public/zk/$NAME.zkey"

echo "==> done"
ls -la "$ROOT/public/zk" "$ROOT/lib/zk/verification_key.json"
