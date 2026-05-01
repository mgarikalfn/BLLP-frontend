"use client";

import React from "react";

// Types
export interface LocalizedText {
  am: string;
  ao: string;
}

export interface QuestionRecord {
  _id?: string;
  type?: string;
  intendedFor?: string;
  content?: any;
  prompt?: string | LocalizedText;
  question?: string | LocalizedText;
  options?: any[];
  [key: string]: any;
}

interface QuestionEditorProps {
  question: QuestionRecord;
  index: number;
  isEditing: boolean;
  onChange: (index: number, nextQuestion: QuestionRecord) => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const formatLocalized = (value: unknown): string => {
  if (!value) return "—";
  if (Array.isArray(value)) {
    const items = value.map((entry) => formatLocalized(entry)).filter((entry) => entry !== "—");
    return items.length > 0 ? items.join(" • ") : "—";
  }
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as { am?: string; ao?: string };
    const am = record.am?.trim();
    const ao = record.ao?.trim();
    if (am && ao) return `${am} / ${ao}`;
    return am || ao || "—";
  }
  return "—";
};

const toLocalizedRecord = (value: unknown): LocalizedText => {
  if (isRecord(value) && ("am" in value || "ao" in value)) {
    return {
      am: typeof value.am === "string" ? value.am : "",
      ao: typeof value.ao === "string" ? value.ao : "",
    };
  }
  if (typeof value === "string") {
    return { am: value, ao: value };
  }
  return { am: "", ao: "" };
};

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, index, isEditing, onChange }) => {
  const type = typeof question.type === "string" ? question.type : "MULTIPLE_CHOICE";
  const content = isRecord(question.content) ? question.content : {};

  // Prompt parsing
  const rawPrompt = content.prompt ?? content.question ?? question.prompt ?? question.question ?? "";
  const prompt = toLocalizedRecord(rawPrompt);

  const updatePrompt = (lang: "am" | "ao", val: string) => {
    const nextPrompt = { ...prompt, [lang]: val };
    const nextContent = { ...content };
    if ("prompt" in nextContent) nextContent.prompt = nextPrompt;
    else if ("question" in nextContent) nextContent.question = nextPrompt;
    else nextContent.prompt = nextPrompt;
    onChange(index, { ...question, content: nextContent });
  };

  const renderPrompt = () => (
    <div className="mt-2">
      {isEditing ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
            value={prompt.am}
            onChange={(e) => updatePrompt("am", e.target.value)}
            placeholder="Prompt (Amharic)"
          />
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
            value={prompt.ao}
            onChange={(e) => updatePrompt("ao", e.target.value)}
            placeholder="Prompt (Afaan Oromoo)"
          />
        </div>
      ) : (
        <p className="text-sm font-semibold text-slate-700">{formatLocalized(prompt)}</p>
      )}
    </div>
  );

  if (type === "MULTIPLE_CHOICE" || type === "QUESTION") {
    const options = Array.isArray(content.options) ? content.options : Array.isArray(question.options) ? question.options : [];
    const source = Array.isArray(content.options) ? "content" : Array.isArray(question.options) ? "root" : "content";

    const updateOption = (optIndex: number, lang: "am" | "ao", val: string) => {
      const nextOptions = [...options];
      const opt = toLocalizedRecord(nextOptions[optIndex]);
      nextOptions[optIndex] = { ...opt, [lang]: val };
      
      if (source === "content") {
        onChange(index, { ...question, content: { ...content, options: nextOptions } });
      } else {
        onChange(index, { ...question, options: nextOptions });
      }
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
          {type}
        </span>
        {renderPrompt()}
        <div className="mt-2 space-y-2">
          {options.length === 0 && !isEditing && (
            <p className="text-xs font-semibold text-slate-400">No options provided.</p>
          )}
          {options.map((opt, optIndex) => {
            const optLoc = toLocalizedRecord(opt);
            return (
              <div key={optIndex}>
                {isEditing ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                      value={optLoc.am}
                      onChange={(e) => updateOption(optIndex, "am", e.target.value)}
                      placeholder="Option (Amharic)"
                    />
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                      value={optLoc.ao}
                      onChange={(e) => updateOption(optIndex, "ao", e.target.value)}
                      placeholder="Option (Afaan Oromoo)"
                    />
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-600">{formatLocalized(opt)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "MATCHING") {
    const pairs = Array.isArray(content.pairs) ? content.pairs : [];
    
    const updatePair = (pairIndex: number, field: "left" | "right", val: string) => {
      const nextPairs = [...pairs];
      nextPairs[pairIndex] = { ...nextPairs[pairIndex], [field]: val };
      onChange(index, { ...question, content: { ...content, pairs: nextPairs } });
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
          {type}
        </span>
        {renderPrompt()}
        <div className="mt-2 space-y-2">
          {pairs.length === 0 && !isEditing && (
            <p className="text-xs font-semibold text-slate-400">No pairs provided.</p>
          )}
          {pairs.map((pair, pIndex) => (
            <div key={pIndex} className="rounded border border-slate-100 bg-slate-50 p-2">
              {isEditing ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={typeof pair.left === "string" ? pair.left : ""}
                    onChange={(e) => updatePair(pIndex, "left", e.target.value)}
                    placeholder="Left pair"
                  />
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={typeof pair.right === "string" ? pair.right : ""}
                    onChange={(e) => updatePair(pIndex, "right", e.target.value)}
                    placeholder="Right pair"
                  />
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-600">
                  {pair.left} ↔ {pair.right}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "SCRAMBLE") {
    const scrambled = Array.isArray(content.scrambled) ? content.scrambled : [];
    const answer = typeof content.answer === "string" ? content.answer : "";

    const updateScrambled = (sIndex: number, val: string) => {
      const nextS = [...scrambled];
      nextS[sIndex] = val;
      onChange(index, { ...question, content: { ...content, scrambled: nextS } });
    };
    
    const updateAnswer = (val: string) => {
      onChange(index, { ...question, content: { ...content, answer: val } });
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
          {type}
        </span>
        {renderPrompt()}
        <div className="mt-2 space-y-2">
          {isEditing ? (
            <>
              <div>
                <p className="mb-1 text-[10px] font-black uppercase text-slate-400">Scrambled Parts</p>
                <div className="flex flex-wrap gap-2">
                  {scrambled.map((s, sIndex) => (
                    <input
                      key={sIndex}
                      className="w-32 rounded border border-slate-200 px-2 py-1 text-xs"
                      value={typeof s === "string" ? s : ""}
                      onChange={(e) => updateScrambled(sIndex, e.target.value)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-black uppercase text-slate-400">Correct Answer</p>
                <input
                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                  value={answer}
                  onChange={(e) => updateAnswer(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-1">
                {scrambled.map((s, sIndex) => (
                  <span key={sIndex} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {typeof s === "string" ? s : ""}
                  </span>
                ))}
              </div>
              <p className="text-xs font-semibold text-emerald-600">Answer: {answer}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "CLOZE") {
    const sentence = toLocalizedRecord(content.sentence);
    const answerLoc = toLocalizedRecord(content.answer);

    const updateSentence = (lang: "am" | "ao", val: string) => {
      onChange(index, { ...question, content: { ...content, sentence: { ...sentence, [lang]: val } } });
    };

    const updateClozeAnswer = (lang: "am" | "ao", val: string) => {
      onChange(index, { ...question, content: { ...content, answer: { ...answerLoc, [lang]: val } } });
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
          {type}
        </span>
        <div className="mt-2 space-y-2">
          {isEditing ? (
            <>
              <div>
                <p className="mb-1 text-[10px] font-black uppercase text-slate-400">Sentence with Blank (_____)</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={sentence.am}
                    onChange={(e) => updateSentence("am", e.target.value)}
                    placeholder="Amharic"
                  />
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={sentence.ao}
                    onChange={(e) => updateSentence("ao", e.target.value)}
                    placeholder="Afaan Oromoo"
                  />
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-black uppercase text-slate-400">Correct Answer</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={answerLoc.am}
                    onChange={(e) => updateClozeAnswer("am", e.target.value)}
                    placeholder="Amharic"
                  />
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={answerLoc.ao}
                    onChange={(e) => updateClozeAnswer("ao", e.target.value)}
                    placeholder="Afaan Oromoo"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700">{formatLocalized(sentence)}</p>
              <p className="text-xs font-semibold text-emerald-600">Answer: {formatLocalized(answerLoc)}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Fallback for unknown question types
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
        {type}
      </span>
      {renderPrompt()}
      <p className="mt-2 text-[10px] text-slate-400">Preview not available for this type.</p>
    </div>
  );
};
