"use client";

import type { CredentialPreview } from "@/lib/credential";
import { formatDate, lookup } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

type Props = {
  certificate: CredentialPreview;
  variant?: "detail" | "compact";
  showTitle?: boolean;
};

export function CertificateCard({ certificate, variant = "detail", showTitle = false }: Props) {
  const { t } = useI18n();
  const labels = t.certificate;
  // The signed certificate stays in English; only its display is translated.
  const show = (value: string) => lookup(labels.values, value);
  const type = show(certificate.type);

  if (variant === "compact") {
    return (
      <section className="certificate certificate-compact">
        <h2>{type}</h2>
        <strong>{show(certificate.holder)}</strong>
        <p>{labels.issuedBy(show(certificate.issuer))}</p>
      </section>
    );
  }

  return (
    <section className="certificate certificate-detail" aria-label={type}>
      {showTitle && <h2>{type}</h2>}
      <dl>
        <div className="is-name">
          <dt>{labels.fullName}</dt>
          <dd>{show(certificate.holder)}</dd>
        </div>
        {/* Not on a real 独身証明書; the demo adds it, as a residence record
            would, so the holder can also prove "lives in Tokyo". It shares
            the name's row so the card gets no taller; on the receive screen
            the only button sits right below it. */}
        <div>
          <dt>{labels.residence}</dt>
          <dd>{lookup(t.places, certificate.residence)}</dd>
        </div>
        <div>
          <dt>{labels.dateOfBirth}</dt>
          <dd>{formatDate(t, certificate.birthDate)}</dd>
        </div>
        <div>
          <dt>{labels.maritalStatus}</dt>
          <dd>{show(certificate.maritalStatus)}</dd>
        </div>
        <div className="is-wide">
          <dt>{labels.issuingAuthority}</dt>
          <dd>{show(certificate.issuer)}</dd>
        </div>
        <div className="is-wide">
          <dt>{labels.dateOfIssue}</dt>
          <dd>{formatDate(t, certificate.issuedAt)}</dd>
        </div>
      </dl>
      <p className="certificate-statement">{show(certificate.statement)}</p>
    </section>
  );
}
