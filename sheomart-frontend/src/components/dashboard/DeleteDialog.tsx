import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

interface DeleteDialogProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function DeleteDialog({ title, description, children }: DeleteDialogProps) {
  return (
    <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40">
      <div className="flex items-start gap-3">
        <Trash2 className="mt-0.5 h-5 w-5 text-rose-600" />
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
          {description ? <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{description}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
