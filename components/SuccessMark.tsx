export function SuccessMark({ size = 48 }: { size?: number }) {
  return (
    <span className="success-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="m14 24 7 7 13-14" />
      </svg>
    </span>
  );
}
