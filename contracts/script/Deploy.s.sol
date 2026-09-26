// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script, console} from "forge-std/Script.sol";
import {Groth16Verifier} from "../src/Groth16Verifier.sol";
import {IGroth16Verifier, SingleProofRegistry} from "../src/SingleProofRegistry.sol";

/// Deploys the verifier and the registry trusting the city office key in
/// lib/zk/issuer-public.json, then writes the addresses for the app.
///   forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL \
///     --private-key $RELAYER_PRIVATE_KEY --broadcast
contract Deploy is Script {
    function run() external {
        string memory issuer = vm.readFile("../lib/zk/issuer-public.json");
        uint256 issuerAx = vm.parseJsonUint(issuer, ".Ax");
        uint256 issuerAy = vm.parseJsonUint(issuer, ".Ay");

        vm.startBroadcast();
        Groth16Verifier verifier = new Groth16Verifier();
        SingleProofRegistry registry =
            new SingleProofRegistry(IGroth16Verifier(address(verifier)), issuerAx, issuerAy);
        vm.stopBroadcast();

        string memory key = "deployment";
        vm.serializeUint(key, "chainId", block.chainid);
        vm.serializeUint(key, "deployedAtBlock", block.number);
        vm.serializeAddress(key, "verifier", address(verifier));
        string memory json = vm.serializeAddress(key, "registry", address(registry));
        vm.writeJson(json, string.concat("../lib/chain/deployment-", vm.toString(block.chainid), ".json"));

        console.log("verifier", address(verifier));
        console.log("registry", address(registry));
    }
}
