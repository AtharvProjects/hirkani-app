# HIRKANI Phase 3 Implementation Roadmap
## Food Engine - Deterministic Analysis Logic

**Target Duration:** 1-2 weeks  
**Status:** Ready to begin  
**Previous Phase:** Architecture complete ✅

---

## Overview

Phase 3 implements the core food analysis logic inside the deterministic engine built in Phase 2. This is where we:

1. Analyze each ingredient against pregnancy rules
2. Analyze nutrients against thresholds
3. Calculate suitability scores without randomness
4. Build reasoning chains
5. Extract benefits, concerns, and flags

**KEY PRINCIPLE:** All logic must be deterministic. No randomness. Same input = same output.

---

## Tasks

### Task 3.1: Ingredient Analysis Implementation

**File:** `src/lib/engine/IngredientAnalysisEngine.ts`  
**Responsibility:** Analyze each ingredient for pregnancy/profile safety

**Implementation:**
```typescript
interface IngredientAnalysisResult {
  ingredient: Ingredient
  status: IngredientStatus
  pregnancyConsideration: boolean
  trimesterConsideration: boolean
  weekConsideration: boolean
  profileConsideration: boolean
  reasoning: string
  evidence: DataSource[]
}

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

**Process:**
1. Check if ingredient triggered any rules
2. Determine status: safe / generally_appropriate / moderate / caution / limit / avoid / unknown
3. Check trimester/week specific considerations
4. Check profile-specific concerns
5. Build reasoning from rule hits and evidence
6. Collect evidence sources

**Determinism Requirements:**
- No randomness in status determination
- Rules processed in sorted order
- Status hierarchy is consistent
- Evidence collection is deterministic

---

### Task 3.2: Nutrient Analysis Implementation

**File:** `src/lib/engine/NutrientAnalysisEngine.ts`  
**Responsibility:** Analyze each nutrient for pregnancy/profile appropriateness

**Implementation:**
```typescript
interface NutrientAnalysisResult {
  nutrient: NutrientValue
  status: NutrientStatus
  interpretation: string
  pregnancyContext?: string
  dailyContribution?: number
  concern?: string
  recommendation?: string
}

class NutrientAnalysisEngine {
  analyzeNutrient(
    nutrient: NutrientValue,
    pregnancyWeek: number,
    trimester: number,
    profile: PregnancyProfile
  ): NutrientAnalysisResult
}
```

**Thresholds (Configured, Not Hardcoded):**
- Sodium: > 600mg/serving = caution
- Added sugar: > 10g/serving = caution
- Caffeine: > 100mg/serving = caution
- Mercury (for fish): > 0.5ppm = caution

**Status Types:**
- beneficial: Provides useful nutrition
- appropriate: Acceptable levels
- moderate: Should limit intake
- high: Elevated levels
- excessive: Beyond safe limits
- unknown: Insufficient data

**Determinism:**
- Thresholds stored in configuration (not hardcoded)
- Comparison is deterministic (no randomness)
- Status determined by fixed rules

---

### Task 3.3: Pregnancy Rule Database

**File:** `src/lib/engine/data/pregnancyRules.ts`  
**Responsibility:** Curated pregnancy-specific rules with evidence

**Structure:**
```typescript
const PREGNANCY_RULES: FoodRule[] = [
  {
    ruleId: 'CAFFEINE_LIMIT_T2',
    ruleName: 'Caffeine Limit (Trimester 2)',
    ruleVersion: '1.0.0',
    category: 'pregnancy_safety',
    condition: {
      type: 'nutrient_threshold',
      parameters: {
        nutrientId: 'caffeine_mg',
        threshold: 100,
        comparison: 'greater_than'
      }
    },
    severity: 'caution',
    message: 'High caffeine content. Limit to 200mg daily during pregnancy.',
    reasoning: 'Research suggests caffeine > 200mg daily may increase miscarriage risk.',
    evidence: [
      {
        sourceId: 'SRC_ACOG_2010',
        title: 'Caffeine and Pregnancy',
        organization: 'ACOG',
        sourceType: 'professional_organization',
        url: 'https://...',
        evidenceLevel: 'high'
      }
    ],
    trimesterSpecific: [1, 2, 3],
    profileSpecific: undefined
  },
  // More rules...
]
```

**Rule Categories:**
- Allergen rules (milk, egg, fish, etc.)
- Ingredient concern rules (papaya, raw eggs, unpasteurized, etc.)
- Nutrient threshold rules (sodium, sugar, caffeine, etc.)
- Medical condition rules (gestational diabetes, hypertension, etc.)
- Diet preference rules (vegetarian, vegan, etc.)

**Critical Rules to Include:**
```
HIGH PRIORITY (Evidence-backed):
- Listeria risk (unpasteurized dairy, deli meats)
- Mercury in fish (high-mercury species)
- Caffeine limits (200mg/day)
- Alcohol (avoid completely)
- Raw eggs (Salmonella risk)
- Undercooked meat (Toxoplasmosis)

MEDIUM PRIORITY (Common concerns):
- High sodium (gestational hypertension)
- High sugar (gestational diabetes)
- Raw sprouts (E. coli)
- Herbal supplements (many not studied)

LOW PRIORITY (Myths to debunk):
- Papaya (only concentrated/unripe is concern)
- Pineapple (normal amounts safe)
- Chocolate (caffeine minimal)
```

**NO HARDCODED MYTHS:** Rules must be evidence-based only.

---

### Task 3.4: Allergen Engine Implementation

**File:** `src/lib/engine/AllergenEngine.ts`  
**Responsibility:** Sophisticated allergen detection with confidence levels

**Implementation:**
```typescript
interface AllergenDetection {
  allergen: string
  detected: boolean
  confidence: 'confirmed' | 'possible' | 'unknown'
  sourceIngredients: string[]
  crossContaminationRisk?: boolean
  evidence: DataSource[]
}

class AllergenEngine {
  detectAllergens(
    ingredients: Ingredient[],
    userAllergies: string[],
    manufacturingContext?: string
  ): AllergenDetection[]
}
```

**Confidence Levels:**
- **Confirmed:** Direct ingredient match (e.g., "milk" found in "milk solids")
- **Possible:** Contains derived ingredient (e.g., "whey" = milk-derived)
- **Unknown:** Unclear or requires expert review

**Cross-Contamination:**
- If manufacturing facility mentioned, flag potential risk
- Let user decide based on severity

---

### Task 3.5: Score Calculation Implementation

**File:** `src/lib/engine/ScoringEngine.ts`  
**Responsibility:** Calculate pregnancy suitability scores deterministically

**NO RANDOMNESS - DETERMINISTIC ONLY**

**Scoring Framework:**
```
Pregnancy Suitability = Base(95) - Rule Penalties + Profile Adjustments

Penalties by Severity:
- Critical Avoid: -50
- Avoid: -30
- Caution: -15
- Limit: -10
- Monitor: -5

Adjustments:
+ Provides key pregnancy nutrients: +5
+ Evidence-backed benefits: +3
- Profile allergy conflict: -100 (overrides score)
- Medical condition conflict: -50 (overrides score)
```

**Score Levels:**
```
80-100: Excellent
60-79:  Good
40-59:  Fair
20-39:  Poor
0-19:   Very Poor
```

**Critical Rule:** Allergies override score (never show "95% safe with allergen")

---

### Task 3.6: Benefits and Concerns Extraction

**File:** `src/lib/engine/InsightEngine.ts`  
**Responsibility:** Extract human-readable benefits and concerns

**Implementation:**
```typescript
interface Benefit {
  benefitId: string
  category: 'nutrition' | 'health' | 'pregnancy' | 'profile'
  description: string
  nutrients?: string[]
  evidence: DataSource[]
}

interface Concern {
  concernId: string
  category: 'pregnancy' | 'nutrition' | 'allergen' | 'medical' | 'food_safety'
  severity: RuleSeverity
  description: string
  reasoning: string
  recommendation?: string
  evidence: DataSource[]
}

class InsightEngine {
  extractBenefits(analysis): Benefit[]
  extractConcerns(analysis): Concern[]
}
```

**Benefits Examples:**
- "Rich in calcium (500mg per serving)"
- "Good source of folic acid"
- "High protein content supports fetal development"

**Concerns Examples:**
- "Contains caffeine (120mg per serving) - limit daily intake"
- "High sodium content"
- "Raw egg ingredient - Salmonella risk"

**RULE:** Never invent benefits. Only use facts from data.

---

### Task 3.7: Reasoning Chain Building

**File:** `src/lib/engine/ReasoningEngine.ts`  
**Responsibility:** Build explainable reasoning chains

**Implementation:**
```typescript
interface DecisionNode {
  nodeId: string
  decision: string
  reasoning: string
  impact: 'positive' | 'negative' | 'neutral'
  children?: DecisionNode[]
}

class ReasoningEngine {
  buildReasoningChain(analysis): AnalysisReasoning
}
```

**Decision Tree Example:**
```
Root: "Is this product suitable during pregnancy?"
├─ Positive: No critical allergies detected
│  └─ Confidence: High
├─ Negative: Contains 120mg caffeine
│  └─ Impact: Moderate caution
├─ Positive: Good source of calcium
│  └─ Confidence: High
└─ Final Decision: Generally Appropriate
   └─ Reasoning: Benefits outweigh concerns; caffeine within limits
```

---

### Task 3.8: Evidence Collection

**File:** `src/lib/engine/EvidenceCollector.ts`  
**Responsibility:** Gather and organize evidence sources

**Sources for Each Claim:**
- Product info: Manufacturer label
- Nutrition: USDA FoodData Central / Manufacturer
- Pregnancy safety: Medical organizations / Guidelines
- Allergens: Product label / Recognized databases

**NO FABRICATED SOURCES:** Only include sources that actually exist.

---

### Task 3.9: Complete FoodAnalysisEngine

**File:** `src/lib/engine/FoodAnalysisEngine.ts` (complete implementation)  
**Responsibility:** Wire all components together

**Complete the following methods:**
- `analyzeIngredients()` - use IngredientAnalysisEngine
- `analyzeNutrients()` - use NutrientAnalysisEngine
- `extractBenefitsAndConcerns()` - use InsightEngine
- `extractFlags()` - identify personalized/pregnancy flags
- `collectEvidence()` - gather all sources
- `buildReasoning()` - create reasoning chain

---

### Task 3.10: Complete Unit Tests

**File:** `src/lib/engine/__tests__/foodEngine.test.ts`  
**Coverage needed:**
- Ingredient analysis determinism
- Nutrient analysis determinism
- Score calculation determinism
- Same product 100x = identical results
- Edge cases (missing data, low confidence, etc.)
- Rule matching correctness
- Evidence collection completeness

---

## Determinism Verification Checklist

For each component, verify:
- [ ] No Math.random() usage
- [ ] No Date.now() in scoring
- [ ] No API calls in scoring
- [ ] Rules processed in sorted order
- [ ] Same input produces same output 100x
- [ ] No floating-point comparison errors
- [ ] No timezone-dependent logic

---

## Implementation Notes

### 1. Configuration Over Hardcoding
Store all thresholds, rules, and evidence in data files, not in code.

### 2. Determinism Testing
Every component needs a determinism test scanning same product 5+ times.

### 3. Evidence Requirements
Every medical/nutrition claim must have:
- Source ID
- Source name
- Evidence level
- URL (if available)

### 4. Profile Priority
Rules must respect profile priority:
1. Allergies (critical)
2. Medical conditions (high)
3. Pregnancy (high)
4. Nutrition (medium)

### 5. Graceful Degradation
If data missing:
- Don't invent it
- Mark as "Data unavailable"
- Continue analysis with available data

---

## Estimated Effort

- Task 3.1: 3-4 hours
- Task 3.2: 3-4 hours
- Task 3.3: 2-3 hours (rule curation)
- Task 3.4: 2-3 hours
- Task 3.5: 2-3 hours
- Task 3.6: 2-3 hours
- Task 3.7: 2-3 hours
- Task 3.8: 1-2 hours
- Task 3.9: 1-2 hours
- Task 3.10: 4-6 hours (testing)

**Total:** ~25-33 hours (3-4 days full-time)

---

## Success Criteria

- [ ] All tests pass
- [ ] Determinism tests verify identical results 100x
- [ ] No Math.random() in scoring
- [ ] No fabricated sources
- [ ] Rules are evidence-backed
- [ ] Edge cases handled gracefully
- [ ] Performance acceptable (< 1s per analysis)
- [ ] Code is well-typed and documented

---

## Next Phase

After Phase 3 completes:
- Phase 4: Consumption tracking and aggregation
- Phase 5: AI layer (explanation only, no decision-making)
- Phase 6: Design system
- Phase 7: UI screens
- etc.

---

Created: 2026-09-27  
Status: Ready for implementation  
Prerequisite: Phase 2 complete ✅
