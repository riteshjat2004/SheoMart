import type { ReactNode } from "react";

interface ProfileCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}

export function ProfileCard({ title, description, action, children, id }: ProfileCardProps) {
  return (
    <section id={id} className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
