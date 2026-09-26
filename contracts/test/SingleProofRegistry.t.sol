// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {Groth16Verifier} from "../src/Groth16Verifier.sol";
import {IGroth16Verifier, SingleProofRegistry} from "../src/SingleProofRegistry.sol";

/// Runs against the real generated verifier and a real proof from
/// scripts/fixture.ts, so a mismatch between circuit, calldata encoding and
/// contract shows up here rather than on Sepolia.
contract SingleProofRegistryTest is Test {
    uint256 internal constant FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    event SingleStatusVerified(uint256 indexed nullifierHash, uint256 indexed scopeHash, uint256 requestHash);

    SingleProofRegistry internal registry;
    IGroth16Verifier internal verifier;
    uint256 internal issuerAx;
    uint256 internal issuerAy;

    uint256[2] internal a;
    uint256[2][2] internal b;
    uint256[2] internal c;
    uint256[10] internal pub;

    function setUp() public {
        string memory issuer = vm.readFile("../lib/zk/issuer-public.json");
        issuerAx = vm.parseJsonUint(issuer, ".Ax");
        issuerAy = vm.parseJsonUint(issuer, ".Ay");

        string memory json = vm.readFile("test/fixtures/proof.json");
        uint256[] memory pa = vm.parseJsonUintArray(json, ".a");
        uint256[] memory pb0 = vm.parseJsonUintArray(json, ".b[0]");
        uint256[] memory pb1 = vm.parseJsonUintArray(json, ".b[1]");
        uint256[] memory pc = vm.parseJsonUintArray(json, ".c");
        uint256[] memory ps = vm.parseJsonUintArray(json, ".publicSignals");
        a = [pa[0], pa[1]];
        b = [[pb0[0], pb0[1]], [pb1[0], pb1[1]]];
        c = [pc[0], pc[1]];
        for (uint256 i = 0; i < 10; i++) {
            pub[i] = ps[i];
        }

        verifier = IGroth16Verifier(address(new Groth16Verifier()));
        registry = new SingleProofRegistry(verifier, issuerAx, issuerAy);
    }

    function test_RecordsAValidProof() public {
        vm.expectEmit(true, true, false, true, address(registry));
        emit SingleStatusVerified(pub[0], pub[8], pub[9]);
        registry.record(a, b, c, pub);
        assertTrue(registry.used(pub[0]));
    }

    function test_RevertWhen_NullifierIsReused() public {
        registry.record(a, b, c, pub);
        vm.expectRevert(SingleProofRegistry.NullifierAlreadyUsed.selector);
        registry.record(a, b, c, pub);
    }

    function test_RevertWhen_IssuerIsNotTrusted() public {
        SingleProofRegistry other = new SingleProofRegistry(verifier, issuerAx + 1, issuerAy);
        vm.expectRevert(SingleProofRegistry.UntrustedIssuer.selector);
        other.record(a, b, c, pub);
    }

    function test_RevertWhen_DisclosedValueIsChanged() public {
        // Claim a different prefecture than the one proven.
        pub[5] = 27;
        vm.expectRevert(SingleProofRegistry.InvalidProof.selector);
        registry.record(a, b, c, pub);
    }

    function test_RevertWhen_ProofPointIsChanged() public {
        a[0] = addmod(a[0], 1, FIELD);
        vm.expectRevert(SingleProofRegistry.InvalidProof.selector);
        registry.record(a, b, c, pub);
    }

    function test_FailedAttemptDoesNotBurnTheNullifier() public {
        uint256 original = pub[9];
        pub[9] = addmod(original, 1, FIELD);
        vm.expectRevert(SingleProofRegistry.InvalidProof.selector);
        registry.record(a, b, c, pub);

        pub[9] = original;
        registry.record(a, b, c, pub);
        assertTrue(registry.used(pub[0]));
    }

    /// A proof is tied to the request it answered.
    function testFuzz_RevertWhen_RequestHashDiffers(uint256 requestHash) public {
        requestHash = bound(requestHash, 0, FIELD - 1);
        if (requestHash == pub[9]) requestHash = addmod(requestHash, 1, FIELD);
        pub[9] = requestHash;
        vm.expectRevert(SingleProofRegistry.InvalidProof.selector);
        registry.record(a, b, c, pub);
    }

    /// A proof is tied to the verifier scope (and so to the nullifier's epoch).
    function testFuzz_RevertWhen_ScopeDiffers(uint256 scopeHash) public {
        scopeHash = bound(scopeHash, 0, FIELD - 1);
        if (scopeHash == pub[8]) scopeHash = addmod(scopeHash, 1, FIELD);
        pub[8] = scopeHash;
        vm.expectRevert(SingleProofRegistry.InvalidProof.selector);
        registry.record(a, b, c, pub);
    }

    function test_RevertWhen_VerifierIsZero() public {
        vm.expectRevert(SingleProofRegistry.ZeroAddress.selector);
        new SingleProofRegistry(IGroth16Verifier(address(0)), issuerAx, issuerAy);
    }

    function test_RevertWhen_IssuerKeyIsZero() public {
        vm.expectRevert(SingleProofRegistry.ZeroIssuerKey.selector);
        new SingleProofRegistry(verifier, 0, issuerAy);
    }
}
