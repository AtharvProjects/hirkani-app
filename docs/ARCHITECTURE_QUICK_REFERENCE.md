# HIRKANI Architecture - Quick Reference Guide

**Version:** 1.0.0  
**Date:** September 27, 2026  
**Purpose:** Quick lookup for the new deterministic food analysis engine

---

## Module Overview

### 🔷 types.ts
**Purpose:** Complete TypeScript type system  
**Key Types:**
- `ProductIdentity` - Product metadata
- `Ingredient` - Normalized ingredient
- `NutritionData` - Nutrient values
- `PregnancyProfile` - User profile
- `FoodAnalysisResult` - Complete analysis output
- `FoodRule` - Rule definition
- `DataSource` - Evidence source

**Use When:** Defining data structures, function signatures

### 🔷 PregnancyCalculator.ts
**Purpose:** Centralized pregnancy date/week calculations  
**Key Functions:**
- `calculatePregnancyFromDueDate(dueDate)` → `{ week, trimester, daysRemaining, ... }`
- `calculatePregnancyFromLMP(lmpDate)` → same
- `getTrimesterFromWeek(week)` → `1 | 2 | 3`
- `calculateDueDateFromWeek(week)` → `Date`

**Trimester Boundaries:**
- Trimester 1: Weeks 1-13
- Trimester 2: Weeks 14-27
- Trimester 3: Weeks 28-42

**Use When:** Need pregnancy week/trimester, date calculations

### 🔷 IngredientNormalizer.ts
**Purpose:** Convert raw ingredient text to canonical form  
**Key Functions:**
- `normalize(rawText)` → `Ingredient`
- `normalizeList(ingredients)` → `Ingredient[]` (sorted)

**Normalization Examples:**
- "E322" → "Lecithin"
- "casein" → "Milk (Casein)"
- "soya" → "Soy"

**Use When:** Processing ingredient lists from labels, OCR, or user input

### 🔷 AllergenMatcher.ts
**Purpose:** Profile-aware allergen detection  
**Key Functions:**
- `checkAllergens(ingredients, userAllergies)` → `{ hasAllergen: boolean, detectedAllergens: string[] }`

**Use When:** Checking if product contains user's known allergens

### 🔷 RuleEngine.ts
**Purpose:** Deterministic rule evaluation  
**Key Functions:**
- `evaluateRules(context)` → `RuleMatch[]` (sorted by severity)

**Context Parameters:**
- `ingredients: Ingredient[]`
- `nutrients: NutrientValue[]`
- `profile: PregnancyProfile`
- `pregnancyWeek: number`
- `trimester: number`

**Rule Severity Order (High → Low Priority):**
1. `critical_avoid` (-50 points)
2. `avoid` (-30 points)
3. `caution` (-15 points)
4. `limit` (-10 points)
5. `monitor` (-5 points)
6. `info` (0 points)

**Use When:** Evaluating which rules apply to a product

### 🔷 FoodAnalysisEngine.ts
**Purpose:** Main orchestration engine  
**Key Function:**
```typescript
analyze(
  product: ProductIdentity,
  ingredients: Ingredient[],
  nutrition: NutritionData,
  profile: PregnancyProfile
): Promise<FoodAnalysisResult>
```

**Output Contains:**
- Product identity verification
- Ingredient analysis (per ingredient)
- Nutrient analysis (per nutrient)
- Suitability scores (pregnancy, nutrition, profile, confidence)
- Overall status (generally_appropriate / limit / caution / avoid)
- Benefits and concerns
- Personalized flags
- Pregnancy-specific flags
- Evidence/sources
- Reasoning chain

**Use When:** Performing complete food analysis

---

## Data Flow

```
User Input (Image/Barcode/Search)
          ↓
Product Verification (Barcode lookup or OCR)
          ↓
ProductIdentity Object
          ↓
IngredientNormalizer.normalizeList()
          ↓
Normalized Ingredients[]
          ↓
RuleEngine.evaluateRules()
          ↓
Triggered Rules[]
          ↓
FoodAnalysisEngine.analyze()
          ├─ IngredientAnalysis
          ├─ NutrientAnalysis
          ├─ Score Calculation
          ├─ Benefit/Concern Extraction
          ├─ Flag Extraction
          └─ Evidence Collection
                ↓
          FoodAnalysisResult
                ↓
          UI Display
```

---

## Common Tasks

### Task: Analyze a Food Product
```typescript
import FoodAnalysisEngine from '@/lib/engine';
import { RuleEngine } from '@/lib/engine/RuleEngine';
import pregnancyRules from '@/lib/engine/data/pregnancyRules';

const engine = new FoodAnalysisEngine(new RuleEngine(pregnancyRules));

const result = await engine.analyze(
  { productId: 'parle-g', productName: 'Parle-G', ... },
  [{ rawText: 'Wheat Flour', ... }, ...],
  { nutrients: [...], ... },
  { pregnancyWeek: 22, ... }
);

// Use result.overallStatus, result.scores, result.benefits, etc.
```

### Task: Normalize Ingredients
```typescript
import { IngredientNormalizer } from '@/lib/engine/IngredientNormalizer';

const normalizer = new IngredientNormalizer();
const normalized = normalizer.normalizeList([
  'E322 (Lecithin)',
  'Casein',
  'Vegetable Oil'
]);

// normalized[0].canonicalName === 'Lecithin'
// normalized[1].canonicalName === 'Milk (Casein)'
// normalized[2].canonicalName === 'Vegetable Oil'
```

### Task: Check Allergies
```typescript
import { AllergenMatcher } from '@/lib/engine/IngredientNormalizer';

const matcher = new AllergenMatcher();
const result = matcher.checkAllergens(
  normalizedIngredients,
  userProfile.allergies
);

if (result.hasAllergen) {
  // Show allergy alert
  console.log('Detected allergens:', result.detectedAllergens);
}
```

### Task: Calculate Pregnancy Week
```typescript
import { PregnancyCalculator } from '@/lib/engine/PregnancyCalculator';

const calc = PregnancyCalculator.calculatePregnancyFromDueDate('2027-03-15');
console.log(`Week: ${calc.week}, Trimester: ${calc.trimester}`);
```

---

## Determinism Guarantees

✅ **GUARANTEED:** Same product scanned with:
- Same product identity
- Same ingredients
- Same nutrition data
- Same user profile
- Same pregnancy week
- Same engine version

**WILL ALWAYS PRODUCE:**
- Same overall status
- Same scores
- Same triggered rules
- Same ingredient analysis
- Same nutrient analysis
- Same benefits/concerns

**NO RANDOMNESS in:**
- Score calculation
- Rule evaluation
- Ingredient normalization
- Allergen detection
- Pregnancy week calculation

---

## Score Calculation

**Base Score:** 95 (starts with high confidence)

**Deductions:**
```
For each triggered rule:
  if severity === 'critical_avoid':   score -= 50
  if severity === 'avoid':            score -= 30
  if severity === 'caution':          score -= 15
  if severity === 'limit':            score -= 10
  if severity === 'monitor':          score -= 5
```

**Examples:**
- Product with no triggered rules: 95% (Excellent)
- Product with 1 caution rule: 80% (Good)
- Product with 2 caution rules: 65% (Good)
- Product with 1 avoid rule: 65% (Good/Fair)
- Product with critical allergy: 0% (Override - Avoid)

**Critical Override Rule:**
If user allergic ingredient detected → Score is ignored, show "AVOID FOR YOUR PROFILE"

---

## Adding New Rules

### Location
`src/lib/engine/data/pregnancyRules.ts`

### Structure
```typescript
{
  ruleId: 'UNIQUE_ID',
  ruleName: 'Human readable name',
  ruleVersion: '1.0.0',
  category: 'allergen' | 'diet_restriction' | 'medical_condition' | 'pregnancy_safety' | 'nutrition_concern' | 'food_safety' | 'ingredient_concern',
  condition: {
    type: 'ingredient_contains' | 'nutrient_threshold' | 'food_category' | 'custom',
    parameters: { ... }
  },
  severity: 'critical_avoid' | 'avoid' | 'caution' | 'limit' | 'monitor' | 'info',
  message: 'User-facing message',
  reasoning: 'Scientific reasoning',
  evidence: [
    {
      sourceId: 'SRC_ID',
      title: 'Source title',
      organization: 'Organization',
      sourceType: 'professional_organization' | 'peer_reviewed_study' | ...,
      url: 'https://...',
      evidenceLevel: 'high' | 'moderate' | 'limited'
    }
  ],
  trimesterSpecific: [1, 2, 3] | undefined,
  weekSpecific: { min: 14, max: 27 } | undefined,
  profileSpecific: { requiresAllergy: ['milk'], ... } | undefined
}
```

### Example: Caffeine Caution Rule
```typescript
{
  ruleId: 'CAFFEINE_CAUTION',
  ruleName: 'High Caffeine Content',
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
  message: 'High caffeine. Limit to 200mg daily during pregnancy.',
  reasoning: 'Research suggests caffeine > 200mg daily may increase miscarriage risk.',
  evidence: [
    {
      sourceId: 'SRC_ACOG_2010',
      title: 'Caffeine and Pregnancy',
      organization: 'American College of Obstetricians and Gynecologists',
      sourceType: 'professional_organization',
      url: 'https://www.acog.org/...',
      evidenceLevel: 'high'
    }
  ],
  trimesterSpecific: [1, 2, 3]
}
```

---

## Troubleshooting

### Issue: Different Results for Same Product
**Root Cause:** Old code path (uses Math.random())  
**Solution:** Use new FoodAnalysisEngine from `src/lib/engine/`

### Issue: Ingredient Not Recognized
**Root Cause:** Not in normalizer mapping  
**Solution:** Add to `initializeCanonicalMapping()` in IngredientNormalizer.ts

### Issue: Missing Allergen Detection
**Root Cause:** Synonym not in allergen map  
**Solution:** Add to `initializeAllergenSynonyms()` in IngredientNormalizer.ts

### Issue: Scores Keep Changing
**Root Cause:** Using old engine with Math.random()  
**Solution:** Migrate to new FoodAnalysisEngine, verify no randomness in code path

---

## Testing Determinism

### Command
```bash
npm test -- determinism.test.ts
```

### What It Tests
- Same product scanned 5x = identical results
- Same ingredient normalized 5x = identical form
- Same rules evaluated 5x = identical matches
- 100x week calculation = same result
- No Math.random() in critical code

### Expected Output
```
✓ should produce identical results scanning Parle-G 5 times
✓ should produce consistent allergen detection across multiple scans
✓ should never use Math.random() for week calculation
✓ 123 tests passed
```

---

## Performance Tips

### Caching
Use the `cacheKey` from analysis result:
```typescript
const result = await engine.analyze(...);
const cacheKey = result.cacheKey;
// Store: cacheKey → result
// Next time: if cacheKey exists, return cached result
```

### Parallel Processing
Rules are evaluated sequentially in sorted order. Safe for concurrency - no shared state.

### Input Preparation
- Normalize ingredients before passing
- Validate product ID format
- Pre-calculate pregnancy week

---

## Documentation Files

| File | Purpose |
|------|---------|
| ARCHITECTURE_AUDIT.md | Complete audit of old system |
| ARCHITECTURE_PHASE2_SUMMARY.md | What was built in Phase 2 |
| PHASE3_IMPLEMENTATION_ROADMAP.md | Detailed Phase 3 plan |
| PROGRESS_REPORT.md | Overall project progress |
| This file | Quick reference |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-27 | Initial deterministic engine |

---

## Contact & Support

For questions about:
- **Architecture:** See ARCHITECTURE_AUDIT.md
- **Implementation:** See PHASE3_IMPLEMENTATION_ROADMAP.md
- **Types:** See types.ts documentation
- **Determinism:** See determinism.test.ts

---

**Last Updated:** 2026-09-27  
**Status:** Production Ready  
**Next Phase:** Phase 3 Implementation
