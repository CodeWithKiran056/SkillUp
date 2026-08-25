function AppBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-[var(--app-bg)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(231,111,81,0.08),transparent)]" />
    </div>
  );
}

export default AppBackground;
