import type { ReferenceCopy } from "@/lib/i18n/how-it-works/reference.en";

// SingleProofRegistry.record() in the order the contract checks: each
// question either continues down the happy path or reverts to the side.

type Tree = ReferenceCopy["tech"]["verification"]["tree"];

export function RegistryTree({ tree }: { tree: Tree }) {
  const checks = [
    { question: tree.issuer, go: tree.yes, stop: tree.no, revert: tree.issuerRevert },
    { question: tree.nullifier, go: tree.no, stop: tree.yes, revert: tree.nullifierRevert },
    { question: tree.proof, go: tree.true, stop: tree.false, revert: tree.proofRevert },
  ];
  return (
    <ol className="hiw-tree">
      <li className="hiw-tree-call">
        <code>{tree.call}</code>
      </li>
      {checks.map((check) => (
        <li key={check.question} className="hiw-tree-check">
          <span className="hiw-tree-question">{check.question}</span>
          <span className="hiw-tree-revert">
            <em>{check.stop}</em>
            <code>{check.revert}</code>
          </span>
          <span className="hiw-tree-go">{check.go}</span>
        </li>
      ))}
      <li className="hiw-tree-ok">{tree.ok}</li>
    </ol>
  );
}
