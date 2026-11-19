export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Loading LivingHope"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-all duration-300"
    >
      <div className="relative flex flex-col items-center justify-center space-y-5">
        {/* Animated Brand Emblem Pulse */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-20 rounded-full bg-brand-accent/20 animate-ping opacity-75" />
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-brand-navy shadow-lg shadow-brand-navy/30">
            <svg
              viewBox="0 0 40 40"
              className="size-10 text-white"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 7C14 7 9 12 9 18C9 26 20 33 20 33C20 33 31 26 31 18C31 12 26 7 20 7Z"
                className="fill-brand-accent"
              />
              <circle cx="20" cy="18" r="4" fill="#1e293b" />
            </svg>
          </div>
        </div>

        {/* Brand Name & Loading Message */}
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
            Living<span className="text-brand-accent">Hope</span>
          </h2>
          <p className="mt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Transforming lives in Ghana...
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full origin-left-right animate-[indeterminate_1.5s_infinite_linear] bg-brand-accent rounded-full" />
        </div>
      </div>
    </div>
  );
}
