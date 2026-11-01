import { useEffect, useRef, useState } from "react";
import "./PacmanBackground.css";

const LANES = [
  { id: "arriba", top: "12%", duration: 14, delay: 0, reverse: false },
  { id: "centro", top: "50%", duration: 18, delay: -6, reverse: true },
  { id: "abajo", top: "88%", duration: 16, delay: -3, reverse: false },
];
const GHOSTS = ["#ff4d6d", "#4dd2ff", "#ffb84d"];
const RESPAWN_MS = 1800;

export default function PacmanBackground() {
  const [score, setScore] = useState(0);
  const [deadLanes, setDeadLanes] = useState({});
  const timers = useRef(new Map());

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    []
  );

  const handlePacmanClick = (laneId) => {
    if (timers.current.has(laneId)) {
      return;
    }

    setDeadLanes((current) => ({ ...current, [laneId]: true }));
    setScore((current) => current + 100);

    const timer = setTimeout(() => {
      setDeadLanes((current) => ({ ...current, [laneId]: false }));
      timers.current.delete(laneId);
    }, RESPAWN_MS);

    timers.current.set(laneId, timer);
  };

  return (
    <div className="pm-bg" aria-hidden="true">
      <div className="pm-grid" />
      <div className="pm-vignette" />
      {LANES.map((lane) => (
        <div
          key={lane.id}
          className={`pm-lane${lane.reverse ? " pm-lane--rev" : ""}`}
          style={{ top: lane.top }}
        >
          <div className="pm-dots" />
          <div
            className="pm-runner"
            style={{
              animationDuration: `${lane.duration}s`,
              animationDelay: `${lane.delay}s`,
            }}
          >
            <span
              className={`pm-pacman${
                deadLanes[lane.id] ? " pm-pacman--dead" : ""
              }`}
              onClick={() => handlePacmanClick(lane.id)}
            />
            {GHOSTS.map((color) => (
              <span
                key={color}
                className="pm-ghost"
                style={{ "--ghost": color }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="pm-crt" />
      <div className="pm-score">
        SCORE <span>{String(score).padStart(4, "0")}</span>
      </div>
    </div>
  );
}
