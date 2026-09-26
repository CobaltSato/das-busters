import { Rich } from "./Rich";

type SectionProps = {
  id: string;
  title: string;
  lede?: string;
  wide?: boolean;
  children: React.ReactNode;
};

// One chapter of the explainer. The id is the anchor the contents bar links to.
export function Section({ id, title, lede, wide, children }: SectionProps) {
  return (
    <section id={id} className={wide ? "hiw-section is-wide" : "hiw-section"} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {lede && (
        <p className="hiw-lede">
          <Rich text={lede} />
        </p>
      )}
      {children}
    </section>
  );
}
