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
  const content = isRecord(question.content) ? question.content : {};
  
  let type = typeof question.type === "string" ? question.type.toUpperCase() : "";
  
  // Auto-detect type if it's missing or incorrectly defaulted to MULTIPLE_CHOICE
  if (!type || type === "MULTIPLE_CHOICE" || type === "QUESTION") {
    if (typeof content.type === "string") {
      type = content.type.toUpperCase();
    } else if (content.textBeforeBlank !== undefined || content.textWithBlank !== undefined) {
      type = "CLOZE";
    } else if (content.pairs !== undefined) {
      type = "MATCHING";
    } else if (content.scrambled !== undefined) {
      type = "SCRAMBLE";
    } else {
      type = "MULTIPLE_CHOICE";
    }
  }

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
    const correctIndex = typeof content.correctIndex === "number" ? content.correctIndex : typeof question.correctIndex === "number" ? question.correctIndex : 0;

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

    const updateCorrectIndex = (newIndex: number) => {
      if (source === "content") {
        onChange(index, { ...question, content: { ...content, correctIndex: newIndex } });
      } else {
        onChange(index, { ...question, correctIndex: newIndex });
      }
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
          {type}
        </span>
        {renderPrompt()}
        <div className="mt-3 space-y-2">
          {options.length === 0 && !isEditing && (
            <p className="text-xs font-semibold text-slate-400">No options provided.</p>
          )}
          {options.map((opt, optIndex) => {
            const optLoc = toLocalizedRecord(opt);
            const isCorrect = correctIndex === optIndex;
            return (
              <div key={optIndex} className={`flex items-start gap-2 p-2 rounded-lg border ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                {isEditing ? (
                  <>
                    <input 
                      type="radio" 
                      name={`question-${index}-correct`} 
                      checked={isCorrect} 
                      onChange={() => updateCorrectIndex(optIndex)}
                      className="mt-2 h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <input
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                        value={optLoc.am}
                        onChange={(e) => updateOption(optIndex, "am", e.target.value)}
                        placeholder="Option (Amharic)"
                      />
                      <input
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                        value={optLoc.ao}
                        onChange={(e) => updateOption(optIndex, "ao", e.target.value)}
                        placeholder="Option (Afaan Oromoo)"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`mt-0.5 h-3 w-3 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <p className={`text-xs font-semibold ${isCorrect ? 'text-emerald-800' : 'text-slate-600'}`}>
                      {formatLocalized(opt)}
                    </p>
                  </>
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
            <div key={pIndex} className="flex items-center gap-2 rounded border border-slate-100 bg-slate-50 p-2">
              {isEditing ? (
                <>
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={typeof pair.left === "string" ? pair.left : ""}
                    onChange={(e) => updatePair(pIndex, "left", e.target.value)}
                    placeholder="Left pair (Target Language)"
                  />
                  <span className="text-slate-400">↔</span>
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={typeof pair.right === "string" ? pair.right : ""}
                    onChange={(e) => updatePair(pIndex, "right", e.target.value)}
                    placeholder="Right pair (Native Language)"
                  />
                </>
              ) : (
                <p className="text-xs font-semibold text-slate-600">
                  {pair.left} <span className="text-slate-400 mx-2">↔</span> {pair.right}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "SCRAMBLE") {
    // Scrambled expects: { am: ["word1", "word2"], ao: ["word1", "word2"] }
    const rawScrambled = isRecord(content.scrambled) ? content.scrambled : { am: [], ao: [] };
    const scrambled = {
      am: Array.isArray(rawScrambled.am) ? rawScrambled.am : [],
      ao: Array.isArray(rawScrambled.ao) ? rawScrambled.ao : []
    };
    
    // Answer expects: { am: "sentence", ao: "sentence" }
    const answer = toLocalizedRecord(content.answer);

    const updateScrambled = (lang: "am" | "ao", val: string) => {
      // Split by comma for easy editing of arrays
      const parts = val.split(",").map(s => s.trim()).filter(s => s.length > 0);
      onChange(index, { 
        ...question, 
        content: { 
          ...content, 
          scrambled: { ...scrambled, [lang]: parts } 
        } 
      });
    };
    
    const updateAnswer = (lang: "am" | "ao", val: string) => {
      onChange(index, { 
        ...question, 
        content: { 
          ...content, 
          answer: { ...answer, [lang]: val } 
        } 
      });
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
          {type}
        </span>
        {renderPrompt()}
        <div className="mt-3 space-y-4">
          {isEditing ? (
            <>
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <p className="mb-2 text-[10px] font-black uppercase text-slate-400">Scrambled Parts (Comma Separated)</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={scrambled.am.join(", ")}
                    onChange={(e) => updateScrambled("am", e.target.value)}
                    placeholder="e.g. ሰላም, ነው, እንዴት"
                  />
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={scrambled.ao.join(", ")}
                    onChange={(e) => updateScrambled("ao", e.target.value)}
                    placeholder="e.g. akkam, jirta, nagaa"
                  />
                </div>
              </div>
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <p className="mb-2 text-[10px] font-black uppercase text-slate-400">Correct Final Sentence</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={answer.am}
                    onChange={(e) => updateAnswer("am", e.target.value)}
                    placeholder="Amharic Answer"
                  />
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    value={answer.ao}
                    onChange={(e) => updateAnswer("ao", e.target.value)}
                    placeholder="Afaan Oromoo Answer"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  {scrambled.am.map((s, sIndex) => (
                    <span key={`am-${sIndex}`} className="rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 border border-slate-200">
                      {typeof s === "string" ? s : ""}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {scrambled.ao.map((s, sIndex) => (
                    <span key={`ao-${sIndex}`} className="rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 border border-slate-200">
                      {typeof s === "string" ? s : ""}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded">Answer: {formatLocalized(answer)}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "CLOZE") {
    // Schema uses textBeforeBlank, textAfterBlank, options, correctAnswer
    const textBeforeBlank = toLocalizedRecord(content.textBeforeBlank);
    const textAfterBlank = toLocalizedRecord(content.textAfterBlank);
    const options = Array.isArray(content.options) ? content.options : [];
    
    // Fallback: Compute correctIndex from correctAnswer if correctIndex is missing
    let correctIndex = 0;
    if (content.correctAnswer && typeof content.correctAnswer === "object") {
      const ansAm = content.correctAnswer.am || content.correctAnswer.word || "";
      const idx = options.findIndex(opt => (opt.am || opt.word || opt) === ansAm);
      if (idx !== -1) correctIndex = idx;
    } else if (typeof content.correctIndex === "number") {
      correctIndex = content.correctIndex;
    }

    const updateTextBeforeBlank = (lang: "am" | "ao", val: string) => {
      onChange(index, { ...question, content: { ...content, textBeforeBlank: { ...textBeforeBlank, [lang]: val } } });
    };

    const updateTextAfterBlank = (lang: "am" | "ao", val: string) => {
      onChange(index, { ...question, content: { ...content, textAfterBlank: { ...textAfterBlank, [lang]: val } } });
    };

    const updateClozeOption = (optIndex: number, lang: "am" | "ao", val: string) => {
      const nextOptions = [...options];
      const opt = toLocalizedRecord(nextOptions[optIndex]);
      nextOptions[optIndex] = { ...opt, [lang]: val };
      
      // If we are editing the currently correct option, we MUST also update correctAnswer!
      let nextCorrectAnswer = toLocalizedRecord(content.correctAnswer);
      if (optIndex === correctIndex) {
        nextCorrectAnswer = { ...nextCorrectAnswer, [lang]: val };
      }
      
      onChange(index, { ...question, content: { ...content, options: nextOptions, correctAnswer: nextCorrectAnswer } });
    };

    const updateClozeCorrectIndex = (newIndex: number) => {
      // Also update correctAnswer to reflect the new chosen option
      const newCorrectAnswer = toLocalizedRecord(options[newIndex]);
      onChange(index, { ...question, content: { ...content, correctIndex: newIndex, correctAnswer: newCorrectAnswer } });
    };

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500 mt-1">
          {type}
        </span>
        {renderPrompt()}
        <div className="mt-3 space-y-3">
          {isEditing ? (
            <>
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <p className="mb-2 text-[10px] font-black uppercase text-slate-400">Sentence Parts (Before & After Blank)</p>
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={textBeforeBlank.am}
                      onChange={(e) => updateTextBeforeBlank("am", e.target.value)}
                      placeholder="Amharic Before Blank"
                    />
                    <input
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={textBeforeBlank.ao}
                      onChange={(e) => updateTextBeforeBlank("ao", e.target.value)}
                      placeholder="Oromo Before Blank"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={textAfterBlank.am}
                      onChange={(e) => updateTextAfterBlank("am", e.target.value)}
                      placeholder="Amharic After Blank"
                    />
                    <input
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={textAfterBlank.ao}
                      onChange={(e) => updateTextAfterBlank("ao", e.target.value)}
                      placeholder="Oromo After Blank"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <p className="mb-2 text-[10px] font-black uppercase text-slate-400">Options & Correct Answer</p>
                <div className="space-y-2">
                  {options.map((opt, optIndex) => {
                    const optLoc = toLocalizedRecord(opt);
                    const isCorrect = correctIndex === optIndex;
                    return (
                      <div key={optIndex} className={`flex items-start gap-2 p-2 rounded-lg border ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                        <input 
                          type="radio" 
                          name={`cloze-${index}-correct`} 
                          checked={isCorrect} 
                          onChange={() => updateClozeCorrectIndex(optIndex)}
                          className="mt-2 h-4 w-4 text-emerald-600 border-slate-300 cursor-pointer"
                        />
                        <div className="flex-1 grid gap-2 sm:grid-cols-2">
                          <input
                            className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                            value={optLoc.am}
                            onChange={(e) => updateClozeOption(optIndex, "am", e.target.value)}
                            placeholder="Option (Amharic)"
                          />
                          <input
                            className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                            value={optLoc.ao}
                            onChange={(e) => updateClozeOption(optIndex, "ao", e.target.value)}
                            placeholder="Option (Afaan Oromoo)"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  {textBeforeBlank.am} <span className="inline-block w-16 border-b-2 border-slate-400"></span> {textAfterBlank.am}
                </p>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  {textBeforeBlank.ao} <span className="inline-block w-16 border-b-2 border-slate-400"></span> {textAfterBlank.ao}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {options.map((opt, optIndex) => {
                  const isCorrect = correctIndex === optIndex;
                  return (
                    <span key={optIndex} className={`px-2 py-1 text-xs font-semibold rounded-full border ${isCorrect ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                      {formatLocalized(opt)} {isCorrect && "✓"}
                    </span>
                  );
                })}
              </div>
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
