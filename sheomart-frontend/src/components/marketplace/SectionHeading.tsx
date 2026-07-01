interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base dark:text-stone-300">{description}</p> : null}
    </div>
  );
}
