# Vocabulary Examples Display & Edit Issue - Analysis

## Problem Statement

Vocabulary examples are not being displayed and cannot be edited on the expert review page, even though:
- The data structure includes `example` field with `{ am, ao, audioUrl }`
- The code references `vItem.example?.audioUrl`
- Audio regeneration supports `isExample` parameter
- But the UI doesn't show example input fields

## Current State Analysis

### Data Structure (Correct)
```typescript
vocabulary[0] = {
  _id: "...",
  am: "ምግብ",
  ao: "nyaata",
  audioUrl: { am: "url1", ao: "url2" },
  example: {
    am: "ምግብ ይበላል",
    ao: "nyaata nyaata",
    audioUrl: { am: "url3", ao: "url4" }
  }
}
```

### Normalization Function (Correct)
```typescript
const normalizeVocabularyItem = (value: unknown): Record<string, unknown> => {
  const example = isRecord(value.example)
    ? {
        am: typeof value.example.am === "string" ? value.example.am : undefined,
        ao: typeof value.example.ao === "string" ? value.example.ao : undefined,
      }
    : value.example;

  return {
    ...value,
    am: typeof value.am === "string" ? value.am : "",
    ao: typeof value.ao === "string" ? value.ao : "",
    example,  // ✅ Included in draft
  };
};
```

### Draft Type (Incomplete)
```typescript
type LessonDraft = {
  title: { am: string; ao: string };
  grammarNotes: { am: string; ao: string };
  vocabulary: Array<Record<string, unknown>>;  // ❌ No example field defined
  dialogue: Array<Record<string, unknown>>;
  quiz: Array<Record<string, unknown>>;
};
```

### UI Rendering (Missing)
```typescript
// Current rendering only shows:
// - Amharic word input
// - Oromo word input
// - Audio controls

// Missing:
// - Example section
// - Example Amharic input
// - Example Oromo input
// - Example audio controls
```

### Update Handler (Incomplete)
```typescript
const updateVocabularyField = (index: number, lang: "am" | "ao", value: string) => {
  setLessonDraft((prev) => {
    if (!prev) return prev;
    const nextVocabulary = [...prev.vocabulary];
    const current = isRecord(nextVocabulary[index]) ? { ...nextVocabulary[index] } : { am: "", ao: "" };
    nextVocabulary[index] = { ...current, [lang]: value };  // ❌ Only updates word, not example
    return { ...prev, vocabulary: nextVocabulary };
  });
};
```

## Root Causes

1. **Missing UI Section**: No example input fields rendered
2. **No Update Handler**: No function to update example fields
3. **Incomplete Draft Type**: LessonDraft doesn't define example structure
4. **No Display Logic**: Non-editing view doesn't show examples

## Solution Overview

### 1. Update LessonDraft Type
```typescript
type LessonDraft = {
  title: { am: string; ao: string };
  grammarNotes: { am: string; ao: string };
  vocabulary: Array<{
    am: string;
    ao: string;
    audioUrl?: { am?: string; ao?: string };
    example?: {
      am: string;
      ao: string;
      audioUrl?: { am?: string; ao?: string };
    };
  }>;
  dialogue: Array<Record<string, unknown>>;
  quiz: Array<Record<string, unknown>>;
};
```

### 2. Add Update Handler for Examples
```typescript
const updateVocabularyExample = (index: number, lang: "am" | "ao", value: string) => {
  setLessonDraft((prev) => {
    if (!prev) return prev;
    const nextVocabulary = [...prev.vocabulary];
    const current = isRecord(nextVocabulary[index]) ? { ...nextVocabulary[index] } : { am: "", ao: "" };
    
    if (!current.example) {
      current.example = { am: "", ao: "" };
    }
    
    current.example[lang] = value;
    nextVocabulary[index] = current;
    return { ...prev, vocabulary: nextVocabulary };
  });
};
```

### 3. Add UI Section for Examples
```typescript
// In editing mode, after word inputs:
<div className="mt-3 border-t border-slate-200 pt-3">
  <h5 className="text-[10px] font-black uppercase text-slate-400 mb-2">Example Sentences</h5>
  <div className="grid gap-2 sm:grid-cols-2">
    {/* Amharic Example */}
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-slate-400">Amharic Example</span>
        <div className="flex items-center gap-1">
          {exAudioUrl.am ? (
            <>
              <span className="text-[10px] font-bold text-emerald-600">🟢 Audio Ready</span>
              <button onClick={() => playAudio(exAudioUrl.am)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Play"><Play size={12}/></button>
              <button onClick={() => handleRegenerateAudio(index, true, "am")} disabled={regeneratingAudioFor?.vocabIndex === index && regeneratingAudioFor?.isExample} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Regenerate"><RefreshCw size={12} className={regeneratingAudioFor?.vocabIndex === index && regeneratingAudioFor?.language === 'am' && regeneratingAudioFor?.isExample ? "animate-spin" : ""}/></button>
            </>
          ) : (
            <span className="text-[10px] font-bold text-rose-500">🔴 Missing Audio</span>
          )}
        </div>
      </div>
      <textarea
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700 min-h-[60px]"
        value={typeof vItem.example?.am === "string" ? vItem.example.am : ""}
        onChange={(event) => updateVocabularyExample(index, "am", event.target.value)}
        placeholder="Amharic example sentence"
      />
    </div>
    
    {/* Oromo Example */}
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-slate-400">Oromo Example</span>
        <div className="flex items-center gap-1">
          {exAudioUrl.ao ? (
            <>
              <span className="text-[10px] font-bold text-emerald-600">🟢 Audio Ready</span>
              <button onClick={() => playAudio(exAudioUrl.ao)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Play"><Play size={12}/></button>
              <button onClick={() => handleRegenerateAudio(index, true, "ao")} disabled={regeneratingAudioFor?.vocabIndex === index && regeneratingAudioFor?.isExample} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Regenerate"><RefreshCw size={12} className={regeneratingAudioFor?.vocabIndex === index && regeneratingAudioFor?.language === 'ao' && regeneratingAudioFor?.isExample ? "animate-spin" : ""}/></button>
            </>
          ) : (
            <span className="text-[10px] font-bold text-rose-500">🔴 Missing Audio</span>
          )}
        </div>
      </div>
      <textarea
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700 min-h-[60px]"
        value={typeof vItem.example?.ao === "string" ? vItem.example.ao : ""}
        onChange={(event) => updateVocabularyExample(index, "ao", event.target.value)}
        placeholder="Oromo example sentence"
      />
    </div>
  </div>
</div>
```

### 4. Add Display Logic for Non-Editing Mode
```typescript
// In non-editing mode, after word display:
{vItem.example?.am || vItem.example?.ao ? (
  <div className="mt-2 border-t border-slate-200 pt-2">
    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Example</p>
    <p className="text-xs text-slate-600">
      {formatLocalized(vItem.example)}
    </p>
  </div>
) : null}
```

## Implementation Checklist

- [ ] Update `LessonDraft` type to include example structure
- [ ] Add `updateVocabularyExample()` handler function
- [ ] Add example section to editing UI
- [ ] Add example display to non-editing UI
- [ ] Verify audio regeneration works for examples
- [ ] Test with multiple vocabulary items
- [ ] Test save/load cycle
- [ ] Verify audio clearing works for examples

## Expected Result

After implementation:
- ✅ Examples display in non-editing mode
- ✅ Examples can be edited in editing mode
- ✅ Example audio shows status (🟢 Ready / 🔴 Missing)
- ✅ Example audio can be played
- ✅ Example audio can be regenerated
- ✅ Examples save correctly
- ✅ Examples load correctly
- ✅ Audio clearing works for examples

## Files to Modify

1. `app/(app)/expert/review/page.tsx`
   - Update `LessonDraft` type
   - Add `updateVocabularyExample()` function
   - Add example UI section (editing mode)
   - Add example display (non-editing mode)

## Testing Scenarios

1. **Add Example**: Edit vocabulary, add example text, save, reload
2. **Edit Example**: Edit existing example, save, reload
3. **Delete Example**: Clear example text, save, reload
4. **Example Audio**: Generate audio for example, verify it plays
5. **Regenerate Example Audio**: Change example text, save, regenerate audio
6. **Multiple Examples**: Edit multiple vocabulary items with examples

---

**Status**: Analysis complete, ready for implementation
**Complexity**: Low-Medium
**Risk**: Low
**Impact**: High (enables full vocabulary editing)

