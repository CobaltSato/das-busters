// Copy strings mark `code`, **bold** and {{Engineer-only text}} inline;
// everything else is text. The Engineer-only part is hidden in Plain view,
// so a sentence can carry a contract name or a formula for engineers
// without putting jargon in front of everyone else.
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\{\{[^}]+\}\})/g;

export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(INLINE).map((part, i) => {
        if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.length > 4 && part.startsWith("{{") && part.endsWith("}}")) {
          return (
            <span key={i} className="hiw-tech">
              <Rich text={part.slice(2, -2)} />
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
