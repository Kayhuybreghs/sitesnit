import { websiteQuestions, type Answers } from "./questions";
import type { Finding, TechnicalResult } from "./lighthouse";
const positive: Record<string, string> = {
  message: "Je boodschap maakt meteen duidelijk wat je doet.",
  offer: "Je diensten of producten zijn goed te vinden.",
  difference: "Je laat zien wat je bedrijf onderscheidt.",
  action: "Belangrijke pagina’s hebben een duidelijke volgende stap.",
  friction: "Je klantpad bevat weinig onnodige omwegen.",
  forms: "Je belangrijkste formulieren en transacties werken.",
  trust: "Je aanbod wordt ondersteund door betrouwbaar bewijs.",
  examples: "Je werkvoorbeelden geven begrijpelijke context.",
  doubt: "Je beantwoordt vragen die contact in de weg kunnen staan.",
  mobile: "Je website is volgens jouw ervaring prettig op mobiel.",
  speed: "Je ervaart je website op mobiel als voldoende snel.",
  access: "Je kunt de inhoud lezen en zonder muis bedienen.",
  findability: "Je wordt ook buiten je bedrijfsnaam gevonden.",
  content: "Je belangrijke pagina’s beantwoorden klantvragen.",
  measurement: "Je hebt inzicht in bezoeken die aanvragen opleveren.",
};
export function buildWebsiteAdvice(
  answers: Answers,
  technical: TechnicalResult | null,
) {
  const content: Finding[] = websiteQuestions
    .filter((q) => ["needs", "partial"].includes(String(answers[q.id])))
    .map((q) => ({
      id: q.id,
      title: q.topic!,
      what: `Je geeft aan: ${answers[q.id] === "needs" ? "dit kan beter" : "dit is gedeeltelijk op orde"}. ${q.title}`,
      why: q.why!,
      action: q.action!,
      source: "Jouw antwoorden" as const,
      priority: (q.priority ?? 5) - (answers[q.id] === "partial" ? 2 : 0),
    }));
  const good = websiteQuestions
    .filter((q) => answers[q.id] === "good")
    .map((q) => positive[q.id]);
  const combined = [...content, ...(technical?.findings ?? [])].sort(
    (a, b) => b.priority - a.priority,
  );
  let priorities = combined.slice(0, 3);
  if (
    technical?.findings.length &&
    priorities.every((p) => p.source !== "Lighthouse")
  )
    priorities = [...priorities.slice(0, 2), technical.findings[0]];
  const unknown = websiteQuestions.filter(
    (q) => answers[q.id] === "unknown",
  ).length;
  const assessed = websiteQuestions.filter((q) =>
    ["good", "needs", "partial"].includes(String(answers[q.id])),
  ).length;
  return {
    priorities,
    content,
    good,
    unknown,
    assessed,
    conclusion: priorities.length
      ? `${priorities[0].title.replace(/[.!?]+$/, "")}. Hieronder zie je waarom dit prioriteit krijgt en wat je kunt doen.`
      : assessed > 0
        ? "Je antwoorden geven op de beoordeelde onderdelen een positief vertrekpunt."
        : "Er is nog te weinig beoordeeld voor een inhoudelijke conclusie.",
    technicalComplete: !!technical,
  };
}
