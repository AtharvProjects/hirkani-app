# HIRKANI Architecture Audit Report
**Date:** September 27, 2026  
**Auditor:** Lead Technical Architect  
**Status:** CRITICAL ISSUES IDENTIFIED

---

## Executive Summary

HIRKANI is a Next.js 15 + React 19 pregnancy food safety application that uses Supabase for backend, OpenFoodFacts for product data, and Gemini (via OpenRouter) for AI vision/text analysis. 

**CRITICAL FINDING:** The application exhibits severe nondeterministic behavior where **THE SAME FOOD PRODUCES DIFFERENT RESULTS WHEN SCANNED MULTIPLE TIMES**. This is caused by fundamental architectural flaws that must be addressed before production deployment.

---

## Current Technology Stack

### Frontend
- **Framework:** Next.js 15.5.2 with React 19.1.1
- **Styling:** TailwindCSS with custom design tokens
- **State Management:** Zustand with persistence
- **Animations:** Framer Motion
- **Mobile:** Capacitor 8 for Android/iOS
- **PWA:** next-pwa
- **UI Components:** Custom components with lucide-react icons

### Backend/Services
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth + Email/Password)
- **AI/LLM:** OpenRouter (google/gemini-2.5-flash)
- **Product Data:** OpenFoodFacts API
- **Barcode:** @zxing/library (web), jsqr

### Database Schema
```sql
- pregnancy_profiles (user profiles, allergies, medical conditions)
- scan_records (scan history)
- favorite_foods (user favorites)
- food_safety_rules (dynamic rules - referenced but may not exist)
```

---

## Current Architecture

### Data Flow: Camera → Analysis → Result

```
CAMERA/BARCODE/SEARCH
        ↓
1. INPUT ACQUISITION
   - Barcode scanning (ZXing)
   - Manual text search
   - Image upload
        ↓
2. PRODUCT IDENTIFICATION
   - barcodeStage() → OpenFoodFacts lookup
   - searchStage() → OpenFoodFacts search
   - geminiVisionScan() → AI vision (FALLBACK)
   - geminiTextScan() → AI text (FALLBACK)
        ↓
3. DATA EXTRACTION
   {
     detected_food: string,
     ingredients: string[],
     nutrients: { sugar_g, sodium_mg, caffeine_mg, ... }
   }
        ↓
4. RULES ENGINE (rulesEngine.ts)
   - evaluatePregnancySafety()
   - Allergen matching
   - Diet preference checking
   - Medical condition rules
   - Trimester-specific rules
   - Hardcoded food rules
        ↓
5. SAFETY CLASSIFICATION
   - SAFE
   - CONSUME_WITH_CAUTION
   - AVOID_DURING_PREGNANCY
        ↓
6. SCORE GENERATION
   **CRITICAL ISSUE:** Math.random() used
        ↓
7. LLM EXPLANATION (optional)
   - generateSimpleExplanation()
        ↓
8. RESULT STORAGE
   - Supabase scan_records table
   - Local zustand state
        ↓
9. UI DISPLAY
   - FoodSafetyResult component
```

---

## CRITICAL PROBLEMS

### 1. 🔴 NONDETERMINISTIC BEHAVIOR

**Location:** `src/lib/rulesEngine.ts` lines 206-210

```typescript
let safetyScore = 95;
if (final === AVOID || foodNameLower.includes("sushi") || foodNameLower.includes("papaya")) 
    safetyScore = Math.floor(Math.random() * 15) + 15; // 15-30 ⚠️ RANDOM
else if (foodNameLower.includes("kurkure") || foodNameLower.includes("chips")) 
    safetyScore = Math.floor(Math.random() * 10) + 40; // 40-50 ⚠️ RANDOM
else if (foodNameLower.includes("jamun") || foodNameLower.includes("sweet")) 
    safetyScore = Math.floor(Math.random() * 15) + 50; // 50-65 ⚠️ RANDOM
```

**Impact:** Same product scanned twice = different scores (e.g., 23% then 28%)  
**Severity:** CRITICAL  
**Fix Required:** Deterministic scoring based on structured rules

### 2. 🔴 AI AS SOURCE OF TRUTH

**Location:** `src/lib/llm.ts`

The LLM is asked to:
- Identify products
- Extract ingredients
- Provide nutrition values
- Return structured JSON

**Problems:**
- AI can hallucinate ingredients
- AI can invent nutrition values
- AI output varies between calls (temperature)
- No validation of AI responses
- AI becomes canonical data source

**Example Prompt:**
```typescript
"Identify the food item/product accurately. Provide its typical ingredients 
and nutritional values..."
```

**Severity:** CRITICAL  
**Fix Required:** AI should ONLY explain structured data, never create it

### 3. 🔴 NO PRODUCT IDENTITY SYSTEM

**Location:** `src/lib/foodPipeline.ts`

Current flow:
```
Barcode → OpenFoodFacts → use first result
  ↓ (if not found)
AI guess → use AI output directly
```

**Problems:**
- No verification that barcode matches product
- No confidence scoring
- AI guesses become canonical immediately
- No product normalization
- No duplicate detection
- No product versioning

**Severity:** CRITICAL  
**Fix Required:** Canonical product identity system with verification

### 4. 🔴 HARDCODED MEDICAL RULES IN UI CODE

**Location:** `src/lib/rulesEngine.ts` lines 146-160

```typescript
if (containsAny(combinedText, ["papaya", "unripe papaya"])) {
    ruleHits.push({ 
        key: "papaya", 
        severity: AVOID, 
        message: "Papaya contains latex which can trigger uterine contractions." 
    });
}
```

**Problems:**
- Medical rules scattered in code
- No evidence/source tracking
- Oversimplified (doesn't distinguish ripe vs unripe, normal portions vs concentrated)
- No versioning
- No audit trail
- Frontend code making medical decisions

**Severity:** HIGH  
**Fix Required:** Structured rule engine with evidence system

### 5. 🔴 FAKE SOURCES AND REFERENCES

**Location:** `src/lib/rulesEngine.ts` lines 226-238

```typescript
const sources = (final === AVOID) ? ["WHO", "CDC", "FDA"] : ["WHO", "FSSAI", "NIN"];

const references = (final === AVOID) 
    ? [
        { title: "WHO Guidelines", url: "https://www.who.int/health-topics/pregnancy" },
        { title: "CDC Advice", url: "https://www.cdc.gov/pregnancy/" },
        ...
      ]
    : [...]
```

**Problems:**
- Same generic URLs for ALL avoid decisions
- No specific evidence
- Not claim-level provenance
- URLs not verified
- Misleading users that specific guidance exists

**Severity:** HIGH (Medical/Legal Risk)  
**Fix Required:** Real evidence system with claim-level sources

### 6. 🟡 NO CONSUMPTION TRACKING

**Current State:** Only tracks "scans", not actual consumption

**Location:** `src/lib/api.ts` - storeScan() only saves scan metadata

**Problems:**
- No serving size tracking
- No actual consumed amount
- No meal association
- No daily/weekly/trimester aggregation
- Cannot provide "You consumed X mg iron this week"

**Severity:** MEDIUM  
**Fix Required:** Proper consumption logging system

### 7. 🟡 NO RESULT CACHING

**Current State:** Every scan = full AI + rules execution

**Location:** No caching layer exists

**Problems:**
- Expensive API calls repeated
- Slow UX
- Nondeterministic results for same product
- No analysis fingerprinting

**Severity:** MEDIUM  
**Fix Required:** Deterministic caching with input fingerprinting

### 8. 🟡 PREGNANCY CALCULATION SCATTERED

**Locations:**
- `src/lib/api.ts` - calculatePregnancyFromDueDate()
- `src/lib/api.ts` - getProfile() auto-increment
- Multiple components duplicate logic

**Problems:**
- Week calculation duplicated
- Trimester boundaries hardcoded everywhere
- No central PregnancyCalculator
- Inconsistent date handling

**Severity:** MEDIUM  
**Fix Required:** Central PregnancyCalculator module

### 9. 🟡 ALLERGEN MATCHING ISSUES

**Location:** `src/lib/rulesEngine.ts` lines 36-51

**Problems:**
- Simple substring matching
- Synonym list incomplete
- No ingredient normalization
- "lecithin" → dairy (incorrect, can be soy-based)
- AI allergen check unreliable
- No confidence scoring

**Severity:** MEDIUM (Safety Risk)  
**Fix Required:** Proper ingredient normalization + canonical allergen DB

### 10. 🟡 NUTRITION DATA QUALITY

**Location:** `src/lib/foodPipeline.ts` lines 26-37

```typescript
const safeFloat = (val: any) => (val !== null && !isNaN(parseFloat(val))) 
    ? parseFloat(val) : 0.0;
```

**Problems:**
- Missing data becomes 0.0 (misleading)
- No distinction between "0 sugar" and "unknown sugar"
- No data quality tracking
- No source versioning
- per_100g vs per_serving confusion possible

**Severity:** MEDIUM  
**Fix Required:** Structured nutrition model with data quality metadata

---

## SECURITY ISSUES

### 1. 🔐 API Keys in Frontend Code

**Location:** Multiple files reference `process.env.NEXT_PUBLIC_OPENROUTER_API_KEY`

**Problem:** NEXT_PUBLIC_ prefix = exposed to client  
**Risk:** API key abuse, quota exhaustion  
**Recommendation:** Move LLM calls to API routes or backend

### 2. 🔐 PII Handling

**Location:** Supabase stores pregnancy data, allergies, medical conditions

**Issues:**
- No explicit PII minimization
- Profile data sent to OpenRouter AI
- No data retention policy visible
- No encryption beyond Supabase default

**Recommendation:** Minimize PII in AI requests, document data handling

### 3. 🔐 Input Validation

**Location:** Multiple API endpoints

**Issues:**
- No input sanitization visible
- No rate limiting client-side
- No file size limits enforced
- No image type validation

**Recommendation:** Add validation layer

---

## DATA QUALITY ISSUES

### 1. OpenFoodFacts Reliability

**Issues:**
- Crowd-sourced data (variable quality)
- Incomplete Indian products
- No data verification
- Barcode may not match actual product

**Current Mitigation:** None  
**Recommendation:** Verification step + confidence scoring

### 2. No Data Versioning

**Issues:**
- Product data changes over time
- Nutrition updated by manufacturer
- No analysis invalidation
- Old results reference outdated data

**Recommendation:** Store data snapshots + versions with analysis

---

## UI/UX ISSUES

### 1. Result Presentation

**Location:** `src/components/FoodSafetyResult.tsx`

**Issues:**
- Displays unexplained 80% score
- No "Why 80%?" explanation
- No evidence/sources display
- No claim-level provenance
- Generic references section

**Recommendation:** Implement explainable scoring UI

### 2. Loading Experience

**Location:** `src/components/AnimatedLoadingSkeleton.tsx`

**Issues:**
- Generic "Analyzing..." messages
- No real progress indication
- Math.random() used to shuffle messages (line 54)
- May artificially delay

**Recommendation:** Real stage-based progress

### 3. No Profile Dashboard

**Current:** Basic profile page  
**Missing:**
- Nutrition aggregation
- Consumption history
- Trimester progress
- Personalized insights

### 4. Inconsistent Design System

**Issues:**
- CSS variables defined but inconsistently used
- Magic numbers for spacing/radius
- Duplicate component patterns
- No centralized design tokens

---

## TECHNICAL DEBT

### 1. Dead Code

**Files with test/debugging artifacts:**
- `frontend/snap.js`
- `frontend/test-schema.js`
- `frontend/get_images.js`
- `frontend/test_overlap*.js`
- `frontend/check_img.js`
- `frontend/measure.js`
- Multiple test PNG files

**Recommendation:** Clean up or move to separate test directory

### 2. Placeholder Code

**Location:** Multiple "placeholder" strings found  
**Recommendation:** Review and replace with production code

### 3. Console.log Statements

**Location:** Throughout codebase  
**Recommendation:** Replace with structured logging (logger.ts exists but underused)

### 4. Comment Clutter

**Multiple instances of:**
- Old commented code
- TODO markers
- Experiment remnants

---

## PERFORMANCE ISSUES

### 1. No Request Deduplication

**Issue:** Same product scanned twice = 2 full AI calls  
**Recommendation:** Implement request cache

### 2. Image Processing

**Issue:** No client-side compression before upload  
**Recommendation:** Add image optimization

### 3. State Management

**Issue:** Entire scan history in memory  
**Recommendation:** Paginate + lazy load

---

## MISSING FEATURES (Per Requirements)

### Critical Missing Features

1. **Deterministic Food Engine** ❌
2. **Product Identity System** ❌
3. **Ingredient Normalization** ❌
4. **Evidence/Source System** ❌
5. **Consumption Tracking** ❌
6. **Nutrition Aggregation** ❌
7. **Result Caching** ❌
8. **Analysis Fingerprinting** ❌
9. **Explainable Scoring** ❌
10. **Anti-Hallucination Guards** ❌

### Partially Implemented

1. **Profile System** ✓ (exists but needs enhancement)
2. **Allergen Detection** ⚠️ (basic, needs improvement)
3. **Pregnancy Rules** ⚠️ (hardcoded, needs structure)
4. **Trimester Awareness** ⚠️ (basic logic exists)

---

## RECOMMENDED ARCHITECTURE

### New System Design

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                 │
│  - Home Dashboard                                   │
│  - Scan Interface                                   │
│  - Result Display (Explainable)                     │
│  - Profile Dashboard                                │
│  - History & Consumption                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│               APPLICATION LAYER                     │
│  - ProductIdentityService                           │
│  - FoodAnalysisEngine (Deterministic)               │
│  - PregnancyRuleEngine                              │
│  - ProfilePersonalizationEngine                     │
│  - ConsumptionTrackingService                       │
│  - ResultCacheService                               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                  DATA LAYER                         │
│  - Product Repository                               │
│  - Ingredient Repository                            │
│  - Nutrition Repository                             │
│  - Evidence Repository                              │
│  - Analysis Repository                              │
│  - Consumption Repository                           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                      │
│  - OpenFoodFacts (Product Data)                     │
│  - AI Service (Explanation ONLY)                    │
│  - OCR Service (Text Extraction)                    │
│  - Barcode Service (Detection)                      │
└─────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**
   - AI NEVER determines safety
   - AI ONLY explains structured decisions
   
2. **Single Source of Truth**
   - Canonical product identity
   - Versioned rules
   - Timestamped evidence
   
3. **Determinism**
   - Same input = Same output
   - No randomness
   - Reproducible results
   
4. **Traceability**
   - Every claim has source
   - Every decision has reasoning
   - Every analysis has fingerprint
   
5. **Data Quality**
   - Confidence scores
   - Source hierarchy
   - Validation rules

---

## MIGRATION STRATEGY

### Phase 1: Foundation (Week 1)
- Create new module structure
- Implement ProductIdentityService
- Build deterministic FoodAnalysisEngine
- Create PregnancyCalculator
- Set up evidence database schema

### Phase 2: Rules Engine (Week 1-2)
- Extract hardcoded rules to data
- Build structured rule engine
- Implement evidence tracking
- Create rule versioning system
- Add claim-level provenance

### Phase 3: AI Guardrails (Week 2)
- Restrict AI to explanation only
- Implement output validation
- Add anti-hallucination checks
- Create fallback templates
- Remove AI from decision path

### Phase 4: Consumption & Caching (Week 2-3)
- Build consumption logging
- Implement aggregation engine
- Add result caching
- Create analysis fingerprinting
- Build cache invalidation

### Phase 5: UI Redesign (Week 3-4)
- New design system
- Redesign result screen
- Add explainable scoring
- Build profile dashboard
- Implement evidence display

### Phase 6: Testing & Hardening (Week 4)
- Unit tests
- Integration tests
- Determinism tests (100x same product)
- Security audit
- Performance optimization

---

## RISK ASSESSMENT

### Critical Risks (Must Fix Before Production)

1. **Medical Misinformation Risk** 🔴
   - AI hallucinations could provide dangerous advice
   - Fake sources mislead users
   - Nondeterministic results erode trust
   
2. **Legal Risk** 🔴
   - Claiming WHO/CDC/FDA guidance without specific citations
   - Medical advice without proper disclaimers
   - Inconsistent results = negligence claim
   
3. **Privacy Risk** 🟡
   - PII sent to third-party AI
   - No explicit user consent for AI processing
   - Pregnancy data sensitivity

### Reputational Risks

1. Same food gives different results
2. AI clearly inventing ingredients
3. Fake evidence citations
4. Oversimplified medical rules

---

## COMPLIANCE GAPS

### Medical Device Regulations

**Current Status:** Not compliant  
**Issues:**
- No clinical validation
- No medical review
- AI making medical decisions
- No quality management system

**Recommendation:** Add disclaimers that this is informational only, not medical advice

### Data Protection

**Current Status:** Partially compliant  
**Issues:**
- No explicit GDPR/privacy policy visible
- PII handling not documented
- No data retention policy
- No user consent for AI processing

**Recommendation:** Add privacy policy, consent flow, data handling docs

---

## ESTIMATED EFFORT

### Critical Path (4-6 weeks)

- **Architecture Refactoring:** 2 weeks
- **Food Engine Rebuild:** 1.5 weeks
- **Evidence System:** 1 week
- **UI Redesign:** 1 week
- **Testing:** 0.5 weeks

### Team Requirements

- 1x Lead Architect (full-time)
- 1x Senior Frontend Engineer (full-time)
- 1x Backend/Data Engineer (half-time)
- 1x Medical/Nutrition Domain Expert (consulting)
- 1x QA Engineer (half-time)

---

## CONCLUSION

HIRKANI has a solid technical foundation (Next.js, Supabase, good UI components) but **suffers from critical architectural flaws that make it unsuitable for production use as a medical/pregnancy guidance tool**.

The nondeterministic behavior, AI hallucination risks, fake evidence citations, and hardcoded medical rules create significant medical, legal, and reputational risks.

**Recommendation:** PROCEED WITH COMPREHENSIVE REFACTORING per the implementation plan outlined in the requirements document. The existing UI/UX direction is good and should be preserved, but the core food analysis engine must be completely rebuilt.

---

## NEXT STEPS

1. ✅ Complete this audit (DONE)
2. ⏭️ Create detailed technical design for new architecture
3. ⏭️ Begin Phase 1 implementation (Foundation)
4. ⏭️ Establish evidence database
5. ⏭️ Rebuild food analysis engine
6. ⏭️ Implement comprehensive testing
7. ⏭️ Deploy to production

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-27  
**Next Review:** After Phase 1 completion
