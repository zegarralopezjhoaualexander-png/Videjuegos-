import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  getPasswordChecks,
  getPasswordStrength,
} from "../page/registerValidation.js";

const PASSWORD_REQUIREMENTS = [
  {
    key: "length",
    label: `Entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`,
  },
  { key: "uppercase", label: "Al menos una mayúscula" },
  { key: "lowercase", label: "Al menos una minúscula" },
  { key: "number", label: "Al menos un número" },
  { key: "symbol", label: "Al menos un símbolo" },
];

const STRENGTH_TONES = {
  slate: { bar: "bg-slate-600", text: "text-slate-400" },
  rose: { bar: "bg-rose-500", text: "text-rose-300" },
  orange: { bar: "bg-orange-500", text: "text-orange-300" },
  amber: { bar: "bg-amber-400", text: "text-amber-300" },
  sky: { bar: "bg-sky-400", text: "text-sky-300" },
  emerald: { bar: "bg-emerald-400", text: "text-emerald-300" },
};

function PasswordStrength({ contrasena }) {
  const checks = getPasswordChecks(contrasena);
  const strength = getPasswordStrength(contrasena);
  const tone = STRENGTH_TONES[strength.tone] ?? STRENGTH_TONES.slate;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Seguridad de la contraseña</span>
        <span className={`font-semibold ${tone.text}`}>{strength.label}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${tone.bar}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>

      <ul
        id="contrasena-requisitos"
        className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2"
      >
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const met = checks[requirement.key];

          return (
            <li
              key={requirement.key}
              className={`flex items-center gap-2 ${
                met ? "text-emerald-300" : "text-slate-500"
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-1.5 shrink-0 rounded-full ${
                  met ? "bg-emerald-400" : "bg-slate-600"
                }`}
              />
              <span>{requirement.label}</span>
              <span className="sr-only">{met ? "Cumplido" : "Pendiente"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PasswordStrength;
