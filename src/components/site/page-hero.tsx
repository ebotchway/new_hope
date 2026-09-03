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
    <section className={cn("px-4 pt-2", className)}>
      <div className="relative mx-auto flex min-h-100 max-w-7xl items-center overflow-hidden rounded-3xl sm:min-h-120 lg:min-h-140">
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white sm:px-10">
          <h1 className="text-4xl tracking-tight text-balance sm:text-6xl lg:text-7xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
