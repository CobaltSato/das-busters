import { safeReturnPath } from "../_components/returnPath";
import { HumanCheck } from "./HumanCheck";

type Props = { searchParams: Promise<{ return?: string | string[] }> };

export default async function HumanCheckPage({ searchParams }: Props) {
  const { return: back } = await searchParams;
  return <HumanCheck returnTo={safeReturnPath(back)} />;
}
