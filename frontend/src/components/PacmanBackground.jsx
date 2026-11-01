import "./PacmanBackground.css";

const LANES = [
  { id: "arriba", top: "12%", duration: 14, delay: 0, reverse: false },
  { id: "centro", top: "50%", duration: 18, delay: -6, reverse: true },
  { id: "abajo", top: "88%", duration: 16, delay: -3, reverse: false },
];
const GHOSTS = ["#ff4d6d", "#4dd2ff", "#ffb84d"];

export default function PacmanBackground() {
  return (
    <div className="pm-bg" aria-hidden="true">
      <div className="pm-grid" />
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
            <span className="pm-pacman" />
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
    </div>
  );
}
