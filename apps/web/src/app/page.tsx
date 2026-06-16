// Public landing page — funnel entry point
// No auth required. Mini-assessment + GS explainer.

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <section className="max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
          <span>Generative Specification Diagnostic</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          How{" "}
          <span className="text-orange-500">GS-ready</span>{" "}
          is your team?
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ForgeDX diagnoses your team&apos;s Generative Specification readiness,
          identifies the exact pathologies blocking adoption, and delivers a
          prescriptive treatment plan — in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Run Full Assessment →
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_SKOOL_COURSE_URL ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
          >
            Join the GS Course
          </a>
        </div>
      </section>

      <section className="mt-20 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          The 7 GS Properties (0–14 Score)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GS_PROPERTIES.map((p) => (
            <div key={p.name} className="p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-2xl">{p.icon}</p>
              <p className="font-semibold text-gray-900 mt-1">{p.name}</p>
              <p className="text-sm text-gray-500 mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 text-center">
        <p className="text-gray-600">
          Prefer hands-on guidance?{" "}
          <a
            href={process.env.NEXT_PUBLIC_WORKSHOP_URL ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 font-semibold hover:underline"
          >
            Book an in-person workshop at PragmaWorks →
          </a>
        </p>
      </section>
    </main>
  );
}

const GS_PROPERTIES = [
  { name: "Self-Describing", icon: "📖", description: "The spec documents itself" },
  { name: "Bounded", icon: "📦", description: "Clear scope boundaries" },
  { name: "Verifiable", icon: "✅", description: "Executable test cases" },
  { name: "Defended", icon: "🛡️", description: "Automated quality gates" },
  { name: "Auditable", icon: "📋", description: "Decision trail (ADRs)" },
  { name: "Composable", icon: "🔗", description: "Ports + adapters" },
  { name: "Executable", icon: "⚡", description: "Live system probes" },
];
