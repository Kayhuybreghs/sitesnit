"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import type { Question, Answers, Answer } from "./questions";
export function useCheckTools(state: {
  stage: string;
  question: Question;
  step: number;
  answers: Answers;
  setAnswer: (id: string, value: Answer) => void;
}) {
  const ref = useRef(state);
  useLayoutEffect(() => {
    ref.current = state;
  });
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const register = (tool: unknown) => {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: controller.signal }),
        ).catch(() => {});
      } catch {}
    };
    register({
      name: "read_check_state",
      title: "Lees de huidige checkstap",
      description:
        "Lees de zichtbare vraag, toegestane antwoorden en huidige selectie. Er wordt niets gestart of verstuurd.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute(input: unknown) {
        if (!input || typeof input !== "object" || Object.keys(input).length)
          throw new Error("Gebruik een leeg object.");
        const s = ref.current;
        return {
          stage: s.stage,
          question:
            s.stage === "questions"
              ? {
                  id: s.question.id,
                  title: s.question.title,
                  options: s.question.options,
                  multiple: !!s.question.multiple,
                  number: s.step + 1,
                  total: 15,
                  selected: s.answers[s.question.id] ?? null,
                }
              : null,
        };
      },
    });
    register({
      name: "answer_check_question",
      title: "Selecteer een antwoord",
      description:
        "Selecteer antwoorden op de huidige zichtbare vraag. Bevestigt alleen de keuze; gaat niet verder en verstuurt geen aanvraag.",
      inputSchema: {
        type: "object",
        properties: {
          questionId: { type: "string" },
          answers: { type: "array", items: { type: "string" }, minItems: 1 },
        },
        required: ["questionId", "answers"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute(input: unknown) {
        const s = ref.current;
        const i = input as { questionId?: unknown; answers?: unknown };
        if (
          !i ||
          Object.keys(i).some((k) => !["questionId", "answers"].includes(k)) ||
          s.stage !== "questions" ||
          i.questionId !== s.question.id ||
          !Array.isArray(i.answers) ||
          !i.answers.length ||
          i.answers.some(
            (v) =>
              typeof v !== "string" ||
              !s.question.options.some((o) => o.value === v),
          ) ||
          (!s.question.multiple && i.answers.length !== 1) ||
          new Set(i.answers).size !== i.answers.length ||
          (i.answers.some((v) => ["none", "unknown"].includes(v)) &&
            i.answers.length > 1)
        )
          throw new Error("Ongeldige keuze voor de huidige vraag.");
        const value = s.question.multiple ? i.answers : i.answers[0];
        flushSync(() => s.setAnswer(s.question.id, value));
        return { questionId: s.question.id, selected: value, advanced: false };
      },
    });
    return () => controller.abort();
  }, []);
}
