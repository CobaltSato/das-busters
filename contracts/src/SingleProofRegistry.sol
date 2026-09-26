// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

interface IGroth16Verifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[10] calldata publicSignals
    ) external view returns (bool);
}

/// @title SingleProofRegistry
/// @notice Records that someone proved single status with a certificate from
/// the trusted city office. Only the nullifier, the verifier scope and the
/// request hash are stored or emitted; no personal data and not even which
/// optional facts were shared.
/// @dev Public signal layout (see circuits/single_proof.circom):
/// [0] nullifierHash, [1] issuerAx, [2] issuerAy, [3] revealResidence,
/// [4] revealAge, [5] expectedResidence, [6] minBirthYear, [7] maxBirthYear,
/// [8] scopeHash, [9] requestHash.
contract SingleProofRegistry {
    IGroth16Verifier public immutable verifier;
    uint256 public immutable issuerAx;
    uint256 public immutable issuerAy;

    /// @notice nullifierHash => already recorded. One certificate backs one
    /// account per verifier scope.
    mapping(uint256 => bool) public used;

    event SingleStatusVerified(uint256 indexed nullifierHash, uint256 indexed scopeHash, uint256 requestHash);

    error ZeroAddress();
    error ZeroIssuerKey();
    error UntrustedIssuer();
    error NullifierAlreadyUsed();
    error InvalidProof();

    constructor(IGroth16Verifier verifier_, uint256 issuerAx_, uint256 issuerAy_) {
        if (address(verifier_) == address(0)) revert ZeroAddress();
        if (issuerAx_ == 0 || issuerAy_ == 0) revert ZeroIssuerKey();
        verifier = verifier_;
        issuerAx = issuerAx_;
        issuerAy = issuerAy_;
    }

    /// @notice Verify a proof and record its nullifier. Anyone may submit;
    /// the proof itself is the authorisation.
    function record(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[10] calldata publicSignals
    ) external {
        if (publicSignals[1] != issuerAx || publicSignals[2] != issuerAy) revert UntrustedIssuer();
        uint256 nullifierHash = publicSignals[0];
        if (used[nullifierHash]) revert NullifierAlreadyUsed();
        // The generated verifier returns false instead of reverting.
        if (!verifier.verifyProof(a, b, c, publicSignals)) revert InvalidProof();

        used[nullifierHash] = true;
        emit SingleStatusVerified(nullifierHash, publicSignals[8], publicSignals[9]);
    }
}
