# HIRKANI Phase 3 - Food Engine Implementation Kickoff

**Status:** Ready to Start  
**Estimated Duration:** 3-4 days  
**Start Date:** Ready immediately  
**Dependencies:** Phase 1-2 Complete ✅

---

## Phase 3 Overview

Phase 3 implements the actual food analysis logic using the deterministic engine built in Phase 2. This phase transforms the framework into a working system.

### What Phase 3 Will Deliver
- ✅ Complete food analysis engine
- ✅ Evidence-backed rule database
- ✅ Ingredient analysis logic
- ✅ Nutrient analysis logic
- ✅ Allergen detection engine
- ✅ Deterministic scoring system
- ✅ Comprehensive reasoning chains
- ✅ Full test coverage

### What Phase 3 Depends On (Already Complete ✅)
- ✅ Type system (types.ts)
- ✅ Pregnancy calculator (PregnancyCalculator.ts)
- ✅ Rule engine (RuleEngine.ts)
- ✅ Ingredient normalizer (IngredientNormalizer.ts)
- ✅ FoodAnalysisEngine framework
- ✅ Determinism tests

---

## Implementation Tasks

### Task 3.1: Complete IngredientAnalysisEngine ⏳
**File:** `src/lib/engine/IngredientAnalysisEngine.ts` (NEW)  
**Status:** Not Started  
**Effort:** 3-4 hours

**What to Implement:**
```typescript
class IngredientAnalysisEngine {
  analyzeIngredient(
    ingredient: Ingredient,
    pregnancyWeek: number,
    trimester: number,
    profile: PregnancyProfile,
    rules: RuleMatch[]
  ): IngredientAnalysisResult
}
```

**Logic:**
1. Check if ingredient triggered any rules
2. Determine status (safe/caution/avoid/unknown)
3. Check trimester/week considerations
4. Check profile-specific concerns
5. Build reasoning from rules
6. Collect evidence sources

**Test Requirement:**
- Analyze same ingredient 10x = identical result
- Edge cases: unknown, ambiguous, allergens

---

### Task 3.2: Complete NutrientAnalysisEngine ⏳
**File:** `src/lib/engine/NutrientAnalysisEngine.ts` (NEW)  
**Status:** Not Started  
**Effort:** 3-4 hours

**What to Implement:**
```typescript
class NutrientAnalysisEngine {
  analyzeNutrient(
    nutrient: NutrientValue,
    pregnancyWeek: number,
    trimester: number,
    profile: PregnancyProfile
  ): NutrientAnalysisResult
}
```

**Thresholds (Configurable):**
- Sodium > 600mg/serving = caution
- Added sugar > 10g/serving = caution
- Caffeine > 100mg/serving = caution
- Mercury (fish) > 0.5ppm = caution

**Status Levels:**
- beneficial, appropriate, moderate, high, excessive, unknown

---

### Task 3.3: Create PregnancyRuleDatabase ⏳
**File:** `src/lib/engine/data/pregnancyRules.ts` (NEW)  
**Status:** Not Started  
**Effort:** 4-6 hours

**What to Create:**
Evidence-backed rules for pregnancy safety

**Rule Categories:**
1. Allergen rules (8 major allergens)
2. Ingredient concern rules (raw eggs, unpasteurized, mercury fish, etc.)
3. Nutrient threshold rules (sodium, sugar, caffeine, mercury)
4. Medical condition rules (gestational diabetes, hypertension)
5. Diet preference rules (vegetarian, vegan, etc.)

**Example Rule:**
```typescript
{
  ruleId: 'LISTERIA_RISK_UNPASTEURIZED',
  ruleName: 'Listeria Risk - Unpasteurized Dairy',
  category: 'food_safety',
  condition: {
    type: 'ingredient_contains',
    parameters: { ingredients: ['unpasteurized', 'raw milk'] }
  },
  severity: 'avoid',
  message: 'Contains unpasteurized dairy. Risk of Listeria.',
  evidence: [{
    sourceId: 'SRC_CDC_LISTERIA',
    organization: 'CDC',
    sourceType: 'government_regulatory',
    url: 'https://www.cdc.gov/listeria',
    evidenceLevel: 'high'
  }],
  trimesterSpecific: [1, 2, 3]
}
```

**Minimum Rules Needed:** 20-30 evidence-backed rules

---

### Task 3.4: Complete AllergenEngine ⏳
**File:** `src/lib/engine/AllergenEngine.ts` (NEW)  
**Status:** Not Started  
**Effort:** 2-3 hours

**What to Implement:**
```typescript
class AllergenEngine {
  detectAllergens(
    ingredients: Ingredient[],
    userAllergies: string[],
    manufacturingContext?: string
  ): AllergenDetection[]
}
```

**Confidence Levels:**
- confirmed: Direct match
- possible: Derived/cross-contamination
- unknown: Requires expert review

---

### Task 3.5: Implement ScoringEngine ⏳
**File:** `src/lib/engine/ScoringEngine.ts` (NEW)  
**Status:** Not Started  
**Effort:** 2-3 hours

**What to Implement:**
Deterministic score calculation (NO RANDOMNESS)

**Scoring Formula:**
```
Base Score: 95
For each rule:
  - critical_avoid: -50
  - avoid: -30
  - caution: -15
  - limit: -10
  - monitor: -5

Final Score: Clamp(0, 100)
```

**Override Rules:**
- Allergy detected → Score overridden to 0 (AVOID)
- Critical food safety → Score overridden

---

### Task 3.6: Implement InsightEngine ⏳
**File:** `src/lib/engine/InsightEngine.ts` (NEW)  
**Status:** Not Started  
**Effort:** 2-3 hours

**What to Implement:**
Extract benefits and concerns from analysis

```typescript
class InsightEngine {
  extractBenefits(analysis): Benefit[]
  extractConcerns(analysis): Concern[]
}
```

**Benefits Examples:**
- "Rich in calcium (500mg per serving)"
- "Good source of folic acid"
- "Protein supports fetal development"

**Concerns Examples:**
- "Contains caffeine (120mg) - limit daily intake"
- "High sodium content"
- "Raw egg ingredient - Salmonella risk"

---

### Task 3.7: Implement ReasoningEngine ⏳
**File:** `src/lib/engine/ReasoningEngine.ts` (NEW)  
**Status:** Not Started  
**Effort:** 2-3 hours

**What to Implement:**
Build explainable reasoning chains

```typescript
class ReasoningEngine {
  buildReasoningChain(analysis): AnalysisReasoning
}
```

**Output:**
- Summary of analysis
- Score breakdown
- Decision tree (why each score)

---

### Task 3.8: Implement EvidenceCollector ⏳
**File:** `src/lib/engine/EvidenceCollector.ts` (NEW)  
**Status:** Not Started  
**Effort:** 1-2 hours

**What to Implement:**
Gather and organize evidence sources

**Sources to Track:**
- Product information
- Nutrition data
- Pregnancy guidance
- Allergen information
- Food safety guidance

---

### Task 3.9: Complete FoodAnalysisEngine ⏳
**File:** `src/lib/engine/FoodAnalysisEngine.ts` (UPDATE)  
**Status:** Framework exists, logic incomplete  
**Effort:** 2-3 hours

**What to Complete:**
Wire all components together

Methods to implement:
- `analyzeIngredients()` - use IngredientAnalysisEngine
- `analyzeNutrients()` - use NutrientAnalysisEngine
- `extractBenefitsAndConcerns()` - use InsightEngine
- `extractFlags()` - identify flags
- `collectEvidence()` - gather sources
- `buildReasoning()` - create reasoning chain

---

### Task 3.10: Complete Tests ⏳
**File:** `src/lib/engine/__tests__/foodEngine.test.ts` (NEW)  
**Status:** Not Started  
**Effort:** 4-6 hours

**What to Test:**
- Ingredient analysis determinism (10x same ingredient)
- Nutrient analysis determinism (10x same nutrient)
- Score calculation determinism (10x same product)
- Same product 100x = identical results
- Edge cases (missing data, low confidence)
- Rule matching correctness
- Evidence collection completeness
- No fabricated sources

**Test Coverage Target:** 90%+

---

## Implementation Checklist

### Pre-Implementation
- [ ] Read PHASE3_IMPLEMENTATION_ROADMAP.md
- [ ] Review all Phase 2 code files
- [ ] Understand type system and interfaces
- [ ] Set up development environment

### Task Implementation
- [ ] Task 3.1: IngredientAnalysisEngine
- [ ] Task 3.2: NutrientAnalysisEngine
- [ ] Task 3.3: PregnancyRuleDatabase
- [ ] Task 3.4: AllergenEngine
- [ ] Task 3.5: ScoringEngine
- [ ] Task 3.6: InsightEngine
- [ ] Task 3.7: ReasoningEngine
- [ ] Task 3.8: EvidenceCollector
- [ ] Task 3.9: Complete FoodAnalysisEngine
- [ ] Task 3.10: Complete Tests

### Testing & Verification
- [ ] All unit tests pass
- [ ] Determinism tests verify identical results
- [ ] No Math.random() in code
- [ ] Code coverage > 90%
- [ ] Type checking passes
- [ ] Lint passes
- [ ] No fabricated sources

### Documentation
- [ ] Code comments complete
- [ ] API documentation updated
- [ ] Examples provided
- [ ] Phase 3 completion report

---

## Determinism Requirements

**CRITICAL:** Every component must be deterministic

✅ No Math.random()  
✅ No Date.now() in scoring  
✅ No external API calls in analysis  
✅ Rules processed in sorted order  
✅ Same input → Same output (guaranteed)

**Verification:** Same product scanned 100x = identical result

---

## Code Organization

```
frontend/src/lib/engine/
├── types.ts                         (existing)
├── PregnancyCalculator.ts           (existing)
├── RuleEngine.ts                    (existing)
├── IngredientNormalizer.ts          (existing)
├── FoodAnalysisEngine.ts            (update existing)
├── index.ts                         (existing)
│
├── IngredientAnalysisEngine.ts      (NEW - Task 3.1)
├── NutrientAnalysisEngine.ts        (NEW - Task 3.2)
├── AllergenEngine.ts                (NEW - Task 3.4)
├── ScoringEngine.ts                 (NEW - Task 3.5)
├── InsightEngine.ts                 (NEW - Task 3.6)
├── ReasoningEngine.ts               (NEW - Task 3.7)
├── EvidenceCollector.ts             (NEW - Task 3.8)
│
├── data/
│   └── pregnancyRules.ts            (NEW - Task 3.3)
│
└── __tests__/
    ├── determinism.test.ts          (existing)
    └── foodEngine.test.ts           (NEW - Task 3.10)
```

---

## Success Criteria for Phase 3

- [ ] All 10 implementation tasks completed
- [ ] All tests passing
- [ ] Determinism verified (100x same product test)
- [ ] No fabricated medical rules
- [ ] All claims have evidence sources
- [ ] Performance < 1 second per analysis
- [ ] Edge cases handled gracefully
- [ ] Code coverage > 90%
- [ ] Type checking passes
- [ ] Documentation complete

---

## Timeline

**Estimated Effort per Task:**
- Task 3.1: 3-4 hours
- Task 3.2: 3-4 hours
- Task 3.3: 4-6 hours
- Task 3.4: 2-3 hours
- Task 3.5: 2-3 hours
- Task 3.6: 2-3 hours
- Task 3.7: 2-3 hours
- Task 3.8: 1-2 hours
- Task 3.9: 2-3 hours
- Task 3.10: 4-6 hours

**Total:** ~28-38 hours (3-4 days full-time)

---

## Next Phases After Phase 3

### Phase 4: Consumption Tracking (2-3 days)
- Implement consumption logging
- Implement nutrition aggregation
- Create consumption history UI

### Phase 5: AI Layer (2-3 days)
- Restrict AI to explanation only
- Implement strict input/output schemas
- Add anti-hallucination guardrails

### Phase 6+: UI, Security, Testing
- Design system, UI redesign, security audit, integration tests

---

## Resources

- **Reference:** ARCHITECTURE_QUICK_REFERENCE.md
- **Implementation Guide:** PHASE3_IMPLEMENTATION_ROADMAP.md
- **Type Definitions:** src/lib/engine/types.ts
- **Existing Modules:** src/lib/engine/*.ts

---

## Getting Started

1. ✅ Read PHASE3_IMPLEMENTATION_ROADMAP.md
2. ✅ Review all src/lib/engine/ files
3. ✅ Understand the type system
4. ⏳ Begin Task 3.1 (IngredientAnalysisEngine)
5. ⏳ Follow implementation checklist

---

**Status:** Phase 3 Ready to Kickoff 🚀  
**Duration:** 3-4 days full-time  
**Deliverables:** 7 new modules, complete tests  
**Success Metric:** Same product 100x = identical results

---

Generated: September 27, 2026  
Ready to implement immediately
