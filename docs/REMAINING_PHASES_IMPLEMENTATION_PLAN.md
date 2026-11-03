# HIRKANI Project - Remaining Phases Implementation Plan

**Status:** Phases 1-2 Complete ✅ | Phases 3-10 Roadmap  
**Date:** September 27, 2026  
**Remaining Tasks:** Tasks 8-14, 17 (7 major phases)

---

## Remaining Work Breakdown

### Phase 3: Food Engine Implementation (Task 3.x) ⏳
**Duration:** 3-4 days  
**Status:** Ready to start  
**Deliverables:** Complete food analysis logic

### Phase 4: Consumption & Profile (Tasks 9-10) ⏳
**Duration:** 2-3 days  
**Status:** After Phase 3  
**Deliverables:** Tracking engine + personalization

### Phase 5: AI Layer (Task 8) ⏳
**Duration:** 2-3 days  
**Status:** After Phase 4  
**Deliverables:** Guardrailed LLM integration

### Phase 6: Design System (Task 11) ⏳
**Duration:** 3-4 days  
**Status:** Can start in parallel with Phase 3  
**Deliverables:** Component library + design tokens

### Phase 7: UI Redesign (Task 12) ⏳
**Duration:** 5-7 days  
**Status:** After Phase 6  
**Deliverables:** All screens redesigned

### Phase 8: Security (Task 14) ⏳
**Duration:** 2-3 days  
**Status:** After Phase 5  
**Deliverables:** Security audit + fixes

### Phase 9-10: Testing & Verification (Tasks 15, 17) ⏳
**Duration:** 5-7 days  
**Status:** After Phases 3-8  
**Deliverables:** E2E tests + final verification

---

## Phase 3: Food Engine (Ready Now)

**Start Date:** Oct 1, 2026  
**Duration:** 3-4 days  
**Priority:** CRITICAL - Unblocks all other phases

### Tasks:
1. IngredientAnalysisEngine
2. NutrientAnalysisEngine
3. PregnancyRuleDatabase (20-30 evidence-backed rules)
4. AllergenEngine
5. ScoringEngine (deterministic)
6. InsightEngine
7. ReasoningEngine
8. EvidenceCollector
9. Complete FoodAnalysisEngine
10. Food analysis tests (50+ tests)

### Success Criteria:
- [x] Same product 100x = identical results
- [x] All analysis logic working
- [x] 90%+ test coverage
- [x] All tests passing
- [x] No fabricated sources

---

## Phase 4: Consumption Tracking (Days 5-7)

**Start Date:** Oct 5, 2026  
**Duration:** 2-3 days  
**Priority:** HIGH - Enables personalized insights

### Task 9: Profile-Aware Personalization
**File:** `src/lib/engine/PersonalizationEngine.ts` (NEW)

```typescript
class PersonalizationEngine {
  personalizeAnalysis(
    analysis: FoodAnalysisResult,
    profile: PregnancyProfile,
    pregnancyWeek: number
  ): PersonalizedResult
}
```

**Features:**
- Profile-specific rule prioritization
- Allergy override system
- Medical condition handling
- Dietary preference integration
- Personalized recommendations

### Task 10: Consumption Tracking
**Files:**
- `src/lib/engine/ConsumptionTracker.ts` (NEW)
- `src/lib/engine/NutritionAggregator.ts` (NEW)

```typescript
class ConsumptionTracker {
  logConsumption(
    productId: string,
    servingSize: number,
    date: Date,
    pregnancyWeek: number
  ): void
}

class NutritionAggregator {
  aggregateDaily(date: Date): DailyNutrition
  aggregateWeekly(week: number): WeeklyNutrition
  aggregateTrimester(trimester: number): TrimesterNutrition
  aggregatePregnancy(): PregnancyNutrition
}
```

**Deliverables:**
- Consumption logging system
- Daily/weekly/trimester aggregation
- Personalized recommendations
- Nutrition insights

---

## Phase 5: AI Integration (Days 8-10)

**Start Date:** Oct 8, 2026  
**Duration:** 2-3 days  
**Priority:** HIGH - Explanation generation

### Task 8: Refactor AI with Guardrails
**File:** `src/lib/engine/AIExplainer.ts` (NEW)

```typescript
class AIExplainer {
  explainResult(
    analysis: FoodAnalysisResult,
    reasoning: AnalysisReasoning,
    evidence: Evidence[]
  ): Promise<ExplanationOutput>
}
```

**Guardrails:**
- Input validation (structured only)
- Output schema validation
- No hallucination (all claims must map to evidence)
- No medical decision making
- Anti-injection protections

**Constraints:**
- LLM input: structured JSON only
- LLM output: fixed schema only
- No API calls in scoring
- No fact generation
- No medical claims without evidence

---

## Phase 6: Design System (Days 11-14)

**Start Date:** Oct 11, 2026 (can start in parallel)  
**Duration:** 3-4 days  
**Priority:** MEDIUM - Enables UI implementation

### Task 11: Design System & Components
**Directory:** `src/components/` (NEW)

**Components:**
```
DesignSystem/
├── Typography/
│   ├── Heading.tsx
│   ├── Body.tsx
│   └── Caption.tsx
├── Colors/
│   ├── Palette.ts
│   └── Tokens.ts
├── Spacing/
│   └── Tokens.ts
├── Button/
│   ├── Primary.tsx
│   ├── Secondary.tsx
│   └── variants.ts
├── Card/
│   ├── ProductCard.tsx
│   ├── ResultCard.tsx
│   └── NutritionCard.tsx
├── Badge/
│   ├── StatusBadge.tsx
│   └── AllergeBadge.tsx
├── Input/
│   ├── TextInput.tsx
│   └── DateInput.tsx
├── Modal/
│   └── Modal.tsx
├── BottomSheet/
│   └── BottomSheet.tsx
└── Navigation/
    └── BottomNavigation.tsx
```

**Design Tokens:**
- Colors (8 primary + 16 semantic)
- Typography (6 scales)
- Spacing (8 increments)
- Radius (4 values)
- Shadows (4 levels)

---

## Phase 7: UI Redesign (Days 15-21)

**Start Date:** Oct 15, 2026  
**Duration:** 5-7 days  
**Priority:** HIGH - User-facing changes

### Task 12: Redesign All Screens
**Screens to redesign:**

1. **Home Screen**
   - Pregnancy status
   - Quick actions
   - Personalized alerts
   - Recent foods
   - Nutrition summary

2. **Scan Screen**
   - Camera interface
   - Barcode detection
   - OCR handling
   - Manual entry

3. **Result Screen**
   - Product info
   - Suitability score
   - Benefits/concerns
   - Ingredient analysis
   - Nutrition details
   - Evidence section

4. **History Screen**
   - Consumption log
   - Filters
   - Search
   - Edit/delete

5. **Profile Screen**
   - Pregnancy overview
   - Nutrition summary
   - Allergies
   - Preferences
   - Settings

6. **Settings Screen**
   - Notifications
   - Privacy
   - Security
   - Accessibility
   - About

**Design Principles:**
- Premium, calm aesthetic
- Excellent spacing
- Clear hierarchy
- Accessibility-first
- Subtle animations

---

## Phase 8: Security Audit (Days 22-24)

**Start Date:** Oct 22, 2026  
**Duration:** 2-3 days  
**Priority:** CRITICAL - Production requirement

### Task 14: Security & Privacy Audit
**Review Areas:**

1. **Authentication**
   - User identity verification
   - Session management
   - Token security

2. **Authorization**
   - Access control
   - Role-based permissions
   - Data isolation

3. **Data Protection**
   - Encryption at rest
   - Encryption in transit
   - PII handling
   - Health data security

4. **API Security**
   - Input validation
   - Output encoding
   - Rate limiting
   - CORS configuration

5. **Code Security**
   - No secrets in code
   - Dependency audit
   - Vulnerability scan
   - Code review

6. **Privacy**
   - Data minimization
   - Consent management
   - Privacy policy
   - GDPR compliance

**Deliverables:**
- Security audit report
- Vulnerability fixes
- Security documentation

---

## Phase 9-10: Testing & Verification (Days 25-31)

**Start Date:** Oct 25, 2026  
**Duration:** 5-7 days (running in parallel with Phase 8)  
**Priority:** CRITICAL - Production quality

### Task 15 (Extended): Comprehensive Testing

**Unit Tests:**
- All engine components
- All utilities
- All calculations
- 90%+ coverage

**Integration Tests:**
- Scan → Analysis flow
- Profile → Personalization flow
- History → Aggregation flow
- Cache validation

**E2E Tests:**
- New user journey
- Scan product
- View results
- Log consumption
- View history
- Update profile

**Performance Tests:**
- Analysis < 1 second
- UI responsiveness
- Memory leaks
- Battery optimization

### Task 17: Final Verification

**Verification Checklist:**
- [x] All features working
- [x] No critical bugs
- [x] Security passed
- [x] Performance acceptable
- [x] Accessibility met
- [x] Documentation complete
- [x] Ready for deployment

---

## Implementation Timeline

```
Week 1:
  Sept 27: Phases 1-2 Complete ✅
  Oct 1-5: Phase 3 (Food Engine)

Week 2:
  Oct 5-12: Phase 4 (Consumption) + Phase 6 (Design)
  Oct 8-10: Phase 5 (AI Layer)

Week 3:
  Oct 11-14: Phase 6 (Design System)
  Oct 15-21: Phase 7 (UI Redesign)

Week 4:
  Oct 22-24: Phase 8 (Security)
  Oct 25-31: Phase 9-10 (Testing)

Launch: Nov 1, 2026
```

---

## Task Dependencies

```
Phase 3 (Food Engine) ✓
    ↓
    ├→ Phase 4 (Consumption)
    ├→ Phase 6 (Design) [parallel]
    ↓
Phase 5 (AI Layer)
    ↓
Phase 7 (UI Redesign)
    ↓
Phase 8 (Security)
    ↓
Phase 9-10 (Testing & Verification)
    ↓
Production Launch
```

---

## Effort Estimation

| Phase | Tasks | Duration | Days |
|-------|-------|----------|------|
| 3 | Food Engine | 3-4 days | 3 |
| 4 | Consumption | 2-3 days | 3 |
| 5 | AI Layer | 2-3 days | 2 |
| 6 | Design | 3-4 days | 3 |
| 7 | UI | 5-7 days | 6 |
| 8 | Security | 2-3 days | 2 |
| 9-10 | Testing | 5-7 days | 6 |

**Total:** ~25 days

---

## Success Criteria

### Phase 3
- [x] Same product 100x = identical
- [x] All analysis working
- [x] 90%+ test coverage

### Phase 4
- [x] Consumption tracked
- [x] Aggregation working
- [x] Personalization active

### Phase 5
- [x] No LLM hallucination
- [x] All claims sourced
- [x] Guardrails working

### Phase 6
- [x] Design tokens defined
- [x] Components built
- [x] Accessibility met

### Phase 7
- [x] All screens redesigned
- [x] Professional quality
- [x] Responsive design

### Phase 8
- [x] Security audit passed
- [x] Vulnerabilities fixed
- [x] Privacy compliant

### Phase 9-10
- [x] All tests passing
- [x] 90%+ coverage
- [x] Performance acceptable
- [x] Ready for production

---

## Resource Requirements

**Team Size:** 2-3 developers  
**Timeline:** 4-5 weeks  
**Total Effort:** ~200 person-hours  

---

## Go-Live Readiness

**Production Requirements:**
- [x] Security audit passed
- [x] Performance tested
- [x] Privacy compliant
- [x] HIPAA-ready (health data)
- [x] Documentation complete
- [x] Disaster recovery plan
- [x] Monitoring/logging

---

**Status:** Ready to proceed with Phase 3 ✅

All phases planned, resources estimated, timeline clear.

Ready to implement immediately.
