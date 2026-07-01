import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageWrapper } from "@/components/layout/page-wrapper";

const highlights = [
  {
    title: "API-ready architecture",
    description: "The frontend shell is wired for the existing backend routes and shared data contracts.",
  },
  {
    title: "Reusable design system",
    description: "Buttons, containers, sections, and page wrappers are ready for the next feature slice.",
  },
  {
    title: "Modern state foundation",
    description: "React Query, Zustand, and form-ready utilities are already configured for expansion.",
  },
];

export default function Home() {
  return (
    <PageWrapper>
      <Section className="pt-12 sm:pt-16 lg:pt-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
                Foundation sprint complete
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl dark:text-stone-50">
                SheoMart is ready for its next product layer.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600 dark:text-stone-300">
                This starter shell establishes the visual language, layout primitives, providers, and shared UI foundation needed to build stores, products, carts, and checkout experiences with confidence.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg">Explore the app</Button>
                <Button variant="outline" size="lg">
                  View backend APIs
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.35)] backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500 dark:text-stone-400">
                Product foundation
              </p>
              <div className="mt-6 space-y-4">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                    <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
