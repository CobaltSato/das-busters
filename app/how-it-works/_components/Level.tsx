"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";

// The page has two reading levels. "Plain" is pictures and one-line
// captions; "Engineer" also shows routes, formulas, the circuit and the
// contract checks. Everything is in the HTML either way: CSS hides the
// `.hiw-tech` parts in plain view, so printing and searching still work.

type Level = "plain" | "tech";

const STORAGE_KEY = "hiw-level";

const LevelContext = createContext<{ level: Level; setLevel: (level: Level) => void }>({
  level: "plain",
  setLevel: () => {},
});

export function LevelRoot({ className, children }: { className: string; children: React.ReactNode }) {
  const [level, setLevelState] = useState<Level>("plain");

  // The server renders plain; a returning reader gets their last choice.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "tech") setLevelState("tech");
    } catch {
      // Storage can be blocked; plain view is a fine default.
    }
  }, []);

  const setLevel = (next: Level) => {
    setLevelState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same: the choice just won't be remembered.
    }
  };

  return (
    <LevelContext.Provider value={{ level, setLevel }}>
      <main className={className} data-level={level}>
        {children}
      </main>
    </LevelContext.Provider>
  );
}

export function LevelToggle({ copy }: { copy: StoryCopy["level"] }) {
  const { level, setLevel } = useContext(LevelContext);
  return (
    <div className="hiw-level" role="group" aria-label={copy.label} title={copy.hint}>
      <button type="button" aria-pressed={level === "plain"} onClick={() => setLevel("plain")}>
        {copy.plain}
      </button>
      <button type="button" aria-pressed={level === "tech"} onClick={() => setLevel("tech")}>
        {copy.tech}
      </button>
      <span className="hiw-visually-hidden">{copy.hint}</span>
    </div>
  );
}

// A plain-text button that switches to the Engineer view in place.
export function LevelSwitch({ children }: { children: React.ReactNode }) {
  const { setLevel } = useContext(LevelContext);
  return (
    <button type="button" className="hiw-level-switch" onClick={() => setLevel("tech")}>
      {children}
    </button>
  );
}
