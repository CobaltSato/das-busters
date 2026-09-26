"use client";

import { useEffect, useState } from "react";
import { fill } from "@/lib/i18n";
import { ACTORS, PHASES, type ActorId, type PhaseId, type StepCopy, type StepId } from "@/lib/i18n/how-it-works/flow";
import type { StoryCopy } from "@/lib/i18n/how-it-works/story.en";
import { ActorIcon } from "./icons";
import { STAGE, arcBetween, clampLabel, labelWidth, nodeX } from "./stage";

export type PlayerStep = StepCopy & { id: StepId; phase: PhaseId; from: ActorId; to: ActorId };

type PlayerProps = {
  label: string;
  steps: PlayerStep[];
  actors: Record<ActorId, string>;
  phases: Record<PhaseId, string>;
  controls: StoryCopy["flow"]["controls"];
};

const STEP_MS = 4500;

// The walkthrough: one message at a time between six parties. It starts
// paused and only plays when asked, so it never moves on its own.
export function SequencePlayer({ label, steps, actors, phases, controls }: PlayerProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = steps[index];
  const last = steps.length - 1;
  const atEnd = index === last;

  useEffect(() => {
    if (!playing || atEnd) return;
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, index, atEnd, last]);

  const go = (next: number) => setIndex(Math.min(Math.max(next, 0), last));
  const togglePlay = () => {
    if (atEnd) {
      setIndex(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") go(index - 1);
    if (event.key === "ArrowRight") go(index + 1);
  }

  const isPlaying = playing && !atEnd;
  const playLabel = atEnd ? controls.restart : isPlaying ? controls.pause : controls.play;

  return (
    <div className="hiw-seq" role="group" aria-label={label} onKeyDown={onKeyDown}>
      <ol className="hiw-seq-progress">
        {PHASES.map((phase) => (
          <li key={phase} className={step.phase === phase ? "is-current" : undefined}>
            <button type="button" className="hiw-seq-phase" onClick={() => go(steps.findIndex((s) => s.phase === phase))}>
              {phases[phase]}
            </button>
            <span className="hiw-seq-ticks">
              {steps.map((s, i) =>
                s.phase !== phase ? null : (
                  <button
                    key={s.id}
                    type="button"
                    className={i < index ? "hiw-seq-tick is-past" : i === index ? "hiw-seq-tick is-now" : "hiw-seq-tick"}
                    aria-label={fill(controls.goTo, { n: String(i + 1), title: s.title })}
                    aria-current={i === index ? "step" : undefined}
                    onClick={() => go(i)}
                  />
                ),
              )}
            </span>
          </li>
        ))}
      </ol>

      <div className="hiw-seq-body">
        <div className="hiw-seq-stage">
          <Stage key={step.id} step={step} actors={actors} />
          <div className="hiw-seq-controls">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label={controls.previous}>
              ←
            </button>
            <button type="button" className="hiw-seq-play" onClick={togglePlay}>
              {playLabel}
            </button>
            <button type="button" onClick={() => go(index + 1)} disabled={atEnd} aria-label={controls.next}>
              →
            </button>
          </div>
        </div>

        <div className="hiw-seq-caption" aria-live="polite">
          <p className="hiw-seq-meta">
            <span>{phases[step.phase]}</span>
            <span>{fill(controls.step, { n: String(index + 1), total: String(steps.length) })}</span>
          </p>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          <dl className="hiw-tech">
            <div>
              <dt>{controls.tech}</dt>
              <dd className="is-tech">{step.tech}</dd>
            </div>
            <div>
              <dt>{controls.data}</dt>
              <dd>{step.data}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// The words on the arrow: plain ones in Plain view, the route or call in
// Engineer view. Both are in the SVG; CSS shows one.
function ArcLabel({ text, x, y, className }: { text: string; x: number; y: number; className: string }) {
  const width = labelWidth(text);
  const labelX = clampLabel(x, width);
  return (
    <g className={`hiw-seq-label ${className}`}>
      <rect x={labelX - width / 2} y={y - 9} width={width} height="18" rx="9" />
      <text x={labelX} y={y + 3.5} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

// Keyed by step, so each message redraws its arc from the start.
function Stage({ step, actors }: { step: PlayerStep; actors: Record<ActorId, string> }) {
  const arc = arcBetween(step.from, step.to);
  const active = (actor: ActorId) => actor === step.from || actor === step.to;
  return (
    <svg className="hiw-seq-svg" viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} aria-hidden="true">
      <path d={arc.d} pathLength={1} className="hiw-seq-arc" />
      <path
        d="M0 0L-8 -4.5L-8 4.5Z"
        transform={`translate(${arc.head.x} ${arc.head.y}) rotate(${arc.head.angle})`}
        className="hiw-seq-head"
      />
      <circle r="4" className="hiw-seq-dot hiw-motion">
        <animateMotion dur="1.6s" repeatCount="indefinite" path={arc.d} />
      </circle>
      <ArcLabel text={step.label} x={arc.labelX} y={arc.labelY} className="hiw-plain-only" />
      <ArcLabel text={step.arrow} x={arc.labelX} y={arc.labelY} className="hiw-tech" />
      {ACTORS.map((actor) => (
        <g key={actor} className={active(actor) ? "hiw-seq-node is-active" : "hiw-seq-node"}>
          <circle cx={nodeX(actor)} cy={STAGE.nodeY} r={STAGE.radius} />
          <ActorIcon actor={actor} size={18} x={nodeX(actor) - 9} y={STAGE.nodeY - 9} />
          <text x={nodeX(actor)} y={STAGE.nodeY + 34} textAnchor="middle">
            {actors[actor]}
          </text>
        </g>
      ))}
    </svg>
  );
}
