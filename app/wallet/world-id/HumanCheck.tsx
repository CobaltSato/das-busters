"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { humanStore } from "@/lib/storage";

// Simulated World ID Selfie Check: the camera opens for five seconds and
// nothing is recorded. IDKit replaces this when WORLDID_MODE=idkit.
type Phase = "ready" | "opening" | "camera" | "done";

const SECONDS = 5;

export function HumanCheck({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [canStream, setCanStream] = useState(true);

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  }, []);

  const complete = useCallback(() => {
    stopCamera();
    if (!humanStore.set({ check: "simulated", verifiedAt: new Date().toISOString() })) {
      setPhase("ready");
      setError("Could not save the result. Turn off private browsing and try again.");
      return;
    }
    setPhase("done");
  }, [stopCamera]);

  useEffect(() => {
    setCanStream(window.isSecureContext && Boolean(navigator.mediaDevices?.getUserMedia));
    return stopCamera;
  }, [stopCamera]);

  useEffect(() => {
    if (phase !== "camera") return;
    if (count <= 0) {
      complete();
      return;
    }
    const timer = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, count, complete]);

  async function openCamera() {
    setError(null);
    setPhase("opening");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      stream.current = media;
      if (video.current) video.current.srcObject = media;
      setCount(SECONDS);
      setPhase("camera");
    } catch {
      setPhase("ready");
      setError("Camera access was not available. Allow camera access and try again.");
    }
  }

  const header = (
    <div className="phone-top">
      <button type="button" className="phone-back" aria-label="Back" onClick={() => router.push(returnTo)}>
        ‹
      </button>
      <BrandLockup small />
      <span style={{ width: 36 }} />
    </div>
  );

  if (phase === "done") {
    return (
      <main className="phone">
        {header}
        <section className="selfie-result">
          <div className="selfie-check" aria-hidden="true">
            ✓
          </div>
          <h1>Human check complete</h1>
          <p>Simulated for the demo. No World ID verification was performed.</p>
        </section>
        <div className="phone-actions">
          <button type="button" className="btn btn-primary" onClick={() => router.push(returnTo)}>
            Continue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="phone">
      {header}
      <div className="selfie-heading">
        <h1 className="screen-title">Human check</h1>
        <p>World ID Selfie Check · simulated</p>
      </div>
      <div className="viewfinder">
        <video ref={video} autoPlay playsInline muted hidden={phase !== "camera"} />
        <span className="viewfinder-guide" />
        {phase === "camera" && <span className="viewfinder-count">{count}</span>}
      </div>
      <div className="selfie-copy">
        <h2>{phase === "camera" ? "Look at the camera" : "Ready for a quick camera check?"}</h2>
        <p>
          {phase === "camera"
            ? "The camera closes by itself in five seconds."
            : "The front camera opens for five seconds. Nothing is uploaded or saved."}
        </p>
      </div>
      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        {canStream ? (
          <button type="button" className="btn btn-primary" onClick={openCamera} disabled={phase !== "ready"}>
            {phase === "opening" ? (
              <>
                <span className="spinner" />
                Opening camera…
              </>
            ) : phase === "camera" ? (
              "Checking…"
            ) : (
              "Open camera"
            )}
          </button>
        ) : (
          <label className="btn btn-primary">
            Open iPhone camera
            <input
              className="selfie-file"
              type="file"
              accept="video/*,image/*"
              capture="user"
              onChange={(event) => {
                // The clip is discarded; picking one only ends the simulation.
                event.target.value = "";
                complete();
              }}
            />
          </label>
        )}
        <p className="fine-print">Simulated for the demo. This does not create a World ID proof.</p>
      </div>
    </main>
  );
}
