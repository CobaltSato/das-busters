"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { useI18n } from "@/components/I18nProvider";
import { humanStore } from "@/lib/storage";

// Simulated human check: the camera opens for five seconds and nothing is
// recorded. IDKit replaces this when WORLDID_MODE=idkit. It must never hang
// on stage, so opening the camera gives up after ten seconds and the check
// can always be completed without the camera.
type Phase = "ready" | "opening" | "camera" | "done";

const SECONDS = 5;
const CAMERA_TIMEOUT_MS = 10_000;

export function HumanCheck({ returnTo }: { returnTo: string }) {
  const { t } = useI18n();
  const copy = t.wallet.selfie;
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  // Bumped on every camera request, timeout, skip and unmount, so a camera
  // that answers late is closed instead of left running.
  const attempt = useRef(0);
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
      setError(copy.storeFailed);
      return;
    }
    setPhase("done");
  }, [stopCamera, copy]);

  useEffect(() => {
    setCanStream(window.isSecureContext && Boolean(navigator.mediaDevices?.getUserMedia));
    return () => {
      attempt.current += 1;
      stopCamera();
    };
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
    const id = ++attempt.current;
    setError(null);
    setPhase("opening");
    const timer = window.setTimeout(() => {
      if (attempt.current !== id) return;
      attempt.current += 1;
      setPhase("ready");
      setError(copy.cameraTimeout);
    }, CAMERA_TIMEOUT_MS);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (attempt.current !== id) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      if (video.current) video.current.srcObject = media;
      setCount(SECONDS);
      setPhase("camera");
    } catch {
      if (attempt.current !== id) return;
      setPhase("ready");
      setError(copy.cameraFailed);
    } finally {
      window.clearTimeout(timer);
    }
  }

  function completeWithoutCamera() {
    attempt.current += 1;
    complete();
  }

  const header = (
    <div className="phone-top">
      <button type="button" className="phone-back" aria-label={t.common.back} onClick={() => router.push(returnTo)}>
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
          <h1>{copy.complete}</h1>
          <p>{copy.completeBody}</p>
        </section>
        <div className="phone-actions">
          <button type="button" className="btn btn-primary" onClick={() => router.push(returnTo)}>
            {t.common.continue}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="phone">
      {header}
      <div className="selfie-heading">
        <h1 className="screen-title">{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>
      <div className="viewfinder">
        <video ref={video} autoPlay playsInline muted hidden={phase !== "camera"} />
        <span className="viewfinder-guide" />
        {phase === "camera" && <span className="viewfinder-count">{count}</span>}
      </div>
      <div className="selfie-copy">
        <h2>{phase === "camera" ? copy.lookAtCamera : copy.ready}</h2>
        <p>{phase === "camera" ? copy.closesSoon : copy.opensFor}</p>
      </div>
      <div className="phone-actions">
        {error && <p className="error-banner">{error}</p>}
        {canStream ? (
          <button type="button" className="btn btn-primary" onClick={openCamera} disabled={phase !== "ready"}>
            {phase === "opening" ? (
              <>
                <span className="spinner" />
                {copy.openingCamera}
              </>
            ) : phase === "camera" ? (
              copy.checking
            ) : (
              copy.openCamera
            )}
          </button>
        ) : (
          <label className="btn btn-primary">
            {copy.openIphoneCamera}
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
        {phase !== "camera" && (
          <button type="button" className="btn btn-text" onClick={completeWithoutCamera}>
            {copy.skipCamera}
          </button>
        )}
        <p className="fine-print">{copy.finePrint}</p>
      </div>
    </main>
  );
}
