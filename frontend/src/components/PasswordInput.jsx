import { inputClasses } from "../page/formStyles.js";
import FieldError from "./FieldError.jsx";

function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  showPassword = false,
  onToggle,
  describedBy,
  inputClassName = "",
}) {
  const errorId = `${id}-error`;
  const ariaDescribedBy =
    [error ? errorId : "", describedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={ariaDescribedBy}
          className={`${inputClasses(Boolean(error))} ${
            onToggle ? "pr-24" : ""
          } ${inputClassName}`}
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export default PasswordInput;
