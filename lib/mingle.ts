import { TOKYO } from "./credential";

// Mingle's own profile data for Ken. Mingle asks the wallet to back up the
// parts of it that people lie about.
export const MINGLE_PROFILE = {
  name: "Ken",
  age: 36,
  city: "Tokyo",
  cityCode: TOKYO,
  photo: "/mingle/profile.jpg",
  stats: { likes: 24, matches: 8, views: 36 },
  bio: "I enjoy exploring cafés and taking walks on my days off.",
};

export const MINGLE_VERIFIER = "mingle";

export function declaredAgeRange(age: number, now = new Date()) {
  const decade = Math.floor(age / 10) * 10;
  const year = now.getUTCFullYear();
  return {
    label: `${decade}s`,
    minBirthYear: year - decade - 9,
    maxBirthYear: year - decade,
  };
}
