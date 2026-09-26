import Image from "next/image";

export function BrandLockup({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "brand-lockup is-small" : "brand-lockup"}>
      <Image src="/brand/das-busters.png" alt="" width={28} height={28} priority />
      DAS Busters
    </span>
  );
}
