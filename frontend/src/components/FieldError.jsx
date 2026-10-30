function FieldError({
  id,
  message,
  className = "mt-2 text-xs text-rose-300",
}) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className={className}>
      {message}
    </p>
  );
}

export default FieldError;
