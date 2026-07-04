import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function ConfirmDialog({ title, description, children }: ConfirmDialogProps) {
  return (
    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
          {description ? <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{description}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
