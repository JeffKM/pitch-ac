// ScoutLab Glossary — 고급 메트릭 용어 사전
import { SCOUTLAB_GLOSSARY } from "../_lib/scoutlab-glossary-data";

export default function ScoutingGlossaryPage() {
  return (
    <div className="space-y-8" data-testid="glossary-page">
      <div>
        <h2 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xl)] text-comic-black">
          Metric Glossary
        </h2>
        <p className="mt-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/50">
          ScoutLab에서 사용하는 고급 메트릭 용어 정의
        </p>
      </div>

      {SCOUTLAB_GLOSSARY.map(({ category, label, terms }) => (
        <section key={category} data-testid={`glossary-section-${category}`}>
          <h2 className="mb-3 border-b border-comic-black/10 pb-2 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
            {label}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {terms.map((term) => (
              <div
                key={term.key}
                className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/10 bg-comic-white p-3"
              >
                <h3 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-lg)] text-comic-black">
                  {term.label}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-comic-black/70">
                  {term.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
