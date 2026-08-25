function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E76F51]/20 disabled:cursor-not-allowed disabled:opacity-50";

  const styles = {
    primary:
      "bg-[#E76F51] text-white hover:bg-[#d65f43] active:scale-[0.99]",

    secondary:
      "border border-[#26262F] bg-[#111116] text-white hover:border-[#E76F51] hover:bg-[#15151B]",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;