import Image from "next/image";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  subtitle,
  imageUrl,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("px-4 pt-1.5", className)}>
      <div className="relative mx-auto flex min-h-64 max-w-7xl items-center overflow-hidden rounded-2xl sm:min-h-80 lg:min-h-96">
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-8 text-center text-white sm:px-8 sm:py-12">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl font-heading">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </section>
  );
}
