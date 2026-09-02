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
    <section className={cn("px-4 pt-4", className)}>
      <div className="relative mx-auto flex max-w-7xl min-h-[280px] items-center overflow-hidden rounded-2xl sm:min-h-[340px]">
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white sm:px-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/85 sm:text-base">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
