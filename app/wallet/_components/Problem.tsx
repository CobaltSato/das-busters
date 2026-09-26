import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { LanguageToggle } from "@/components/LanguageToggle";

type Props = {
  title: string;
  body: string;
  action?: { href: string; label: string };
};

export function Problem({ title, body, action }: Props) {
  return (
    <main className="phone">
      <div className="phone-top">
        <BrandLockup />
        <LanguageToggle />
      </div>
      <section className="problem">
        <h1 className="screen-title">{title}</h1>
        <p>{body}</p>
      </section>
      {action && (
        <div className="phone-actions">
          <Link className="btn btn-primary" href={action.href}>
            {action.label}
          </Link>
        </div>
      )}
    </main>
  );
}
