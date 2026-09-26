import { formatDate, type CredentialPreview } from "@/lib/credential";

type Props = {
  certificate: CredentialPreview;
  variant?: "detail" | "compact";
  showTitle?: boolean;
};

export function CertificateCard({ certificate, variant = "detail", showTitle = false }: Props) {
  if (variant === "compact") {
    return (
      <section className="certificate certificate-compact">
        <h2>{certificate.type}</h2>
        <strong>{certificate.holder}</strong>
        <p>Issued by {certificate.issuer}</p>
      </section>
    );
  }

  return (
    <section className="certificate certificate-detail" aria-label={certificate.type}>
      {showTitle && <h2>{certificate.type}</h2>}
      <dl>
        <div className="is-wide is-name">
          <dt>Full name</dt>
          <dd>{certificate.holder}</dd>
        </div>
        <div>
          <dt>Date of birth</dt>
          <dd>{formatDate(certificate.birthDate)}</dd>
        </div>
        <div>
          <dt>Marital status</dt>
          <dd>{certificate.maritalStatus}</dd>
        </div>
        <div className="is-wide">
          <dt>Issuing authority</dt>
          <dd>{certificate.issuer}</dd>
        </div>
        <div className="is-wide">
          <dt>Date of issue</dt>
          <dd>{formatDate(certificate.issuedAt)}</dd>
        </div>
      </dl>
      <p className="certificate-statement">{certificate.statement}</p>
    </section>
  );
}
