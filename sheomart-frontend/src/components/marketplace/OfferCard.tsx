interface OfferCardProps {
  title: string;
  description: string;
  accent: string;
}

export function OfferCard({ title, description, accent }: OfferCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-zinc-900">
      <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${accent}`}>
        Limited offer
      </div>
      <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p>
    </div>
  );
}
