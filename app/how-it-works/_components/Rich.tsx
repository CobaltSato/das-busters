// Copy strings mark `code` and **bold** inline; everything else is text.
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*)/g;

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
        return part;
      })}
    </>
  );
}
