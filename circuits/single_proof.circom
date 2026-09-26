pragma circom 2.1.9;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

// Proves: "the city office signed a certificate saying I am single, it was
// issued to me, and (optionally) I live in the requested prefecture and was
// born in the requested year range" without revealing the certificate.
//
// Public signals come out as: nullifierHash, then the public inputs in the
// order they are declared below. lib/presentation.ts relies on this order.
template SingleProof() {
    // Private: the certificate fields the city office signed.
    signal input isSingle;
    signal input birthYear;
    signal input residenceCode;
    signal input issuedAt;          // yyyymmdd
    signal input holderSecret;
    signal input sigR8x;
    signal input sigR8y;
    signal input sigS;

    // Public, in signal order.
    signal input issuerAx;
    signal input issuerAy;
    signal input revealResidence;
    signal input revealAge;
    signal input expectedResidence;
    signal input minBirthYear;
    signal input maxBirthYear;
    signal input scopeHash;
    signal input requestHash;

    signal output nullifierHash;

    // The certificate is bound to the holder through a commitment to a
    // secret only the phone knows.
    component commitment = Poseidon(1);
    commitment.inputs[0] <== holderSecret;

    component message = Poseidon(5);
    message.inputs[0] <== isSingle;
    message.inputs[1] <== birthYear;
    message.inputs[2] <== residenceCode;
    message.inputs[3] <== issuedAt;
    message.inputs[4] <== commitment.out;

    component signature = EdDSAPoseidonVerifier();
    signature.enabled <== 1;
    signature.Ax <== issuerAx;
    signature.Ay <== issuerAy;
    signature.R8x <== sigR8x;
    signature.R8y <== sigR8y;
    signature.S <== sigS;
    signature.M <== message.out;

    isSingle === 1;

    revealResidence * (revealResidence - 1) === 0;
    revealAge * (revealAge - 1) === 0;

    // Residence must match only when revealed; hidden means the public value is 0.
    revealResidence * (residenceCode - expectedResidence) === 0;
    (1 - revealResidence) * expectedResidence === 0;

    // Keep the year small enough for 16-bit comparisons.
    component yearBits = Num2Bits(16);
    yearBits.in <== birthYear;

    component notTooOld = GreaterEqThan(16);
    notTooOld.in[0] <== birthYear;
    notTooOld.in[1] <== minBirthYear;

    component notTooYoung = LessEqThan(16);
    notTooYoung.in[0] <== birthYear;
    notTooYoung.in[1] <== maxBirthYear;

    revealAge * (1 - notTooOld.out) === 0;
    revealAge * (1 - notTooYoung.out) === 0;
    (1 - revealAge) * minBirthYear === 0;
    (1 - revealAge) * maxBirthYear === 0;

    // Same holder and same scope give the same nullifier, so one certificate
    // can back one Mingle account per epoch.
    component nullifier = Poseidon(2);
    nullifier.inputs[0] <== holderSecret;
    nullifier.inputs[1] <== scopeHash;
    nullifierHash <== nullifier.out;

    // requestHash takes no part in the logic. Squaring it adds a constraint so
    // the proof is tied to one request and cannot be replayed on another.
    signal requestSquare;
    requestSquare <== requestHash * requestHash;
}

component main {public [
    issuerAx,
    issuerAy,
    revealResidence,
    revealAge,
    expectedResidence,
    minBirthYear,
    maxBirthYear,
    scopeHash,
    requestHash
]} = SingleProof();
