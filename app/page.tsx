import Link from "next/link";

const apps = [
  {
    href: "/counter",
    device: "Desktop / iPad",
    title: "Issuing counter",
    body: "The city office screen. It shows a QR code for picking up a Single Status Certificate.",
  },
  {
    href: "/wallet",
    device: "Phone",
    title: "DAS Busters",
    body: "Keeps the certificate on your phone and shares only the facts you choose.",
  },
  {
    href: "/mingle",
    device: "Phone",
    title: "Mingle",
    body: "A dating app that asks for proof of single status before showing the badge.",
  },
];

export default function Hub() {
  return (
    <main className="hub">
      <p className="hub-eyebrow">ETHGlobal Tokyo 2026</p>
      <h1>DAS Busters demo</h1>
      <p className="hub-lede">
        Prove you are single to a dating app without handing over your certificate.
      </p>
      <ul className="hub-apps">
        {apps.map((app) => (
          <li key={app.href}>
            <Link href={app.href} className="hub-card">
              <span className="hub-device">{app.device}</span>
              <strong>{app.title}</strong>
              <span>{app.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
