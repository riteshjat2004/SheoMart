import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className={cn("w-full max-w-md rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 dark:border-stone-800 dark:bg-stone-900/85", className)}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p>
      </div>
      {children}
    </div>
  );
}
