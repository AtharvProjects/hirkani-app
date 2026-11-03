# HIRKANI Component Guidelines

## Overview
Component design guidelines for building consistent, accessible, and user-friendly UI components in HIRKANI.

---

## Design Principles

### 1. Clarity First
- Clear, scannable information
- Essential information prominent
- Progressive disclosure for details
- No unnecessary complexity

### 2. Accessibility Always
- WCAG 2.1 AA compliance minimum
- Keyboard navigable
- Screen reader friendly
- High contrast support

### 3. Pregnancy-Focused
- Designed for fatigue and brain fog
- Large, easy-to-tap targets
- Reduced motion option
- Clear status indicators

### 4. Trust & Safety
- Transparent evidence sources
- Clear disclaimers
- No medical advice
- Professional, reassuring tone

---

## Core Components

### FoodCard
**Purpose:** Display food analysis result summary

**Structure:**
```
┌─────────────────────────────────────┐
│ [Image] Product Name          [Icon]│
│         Brand Name                   │
├─────────────────────────────────────┤
│ [●●●●○] Pregnancy Safety: 85/100    │
│ [Status Badge]                       │
├─────────────────────────────────────┤
│ ✓ Benefit 1                         │
│ ✓ Benefit 2                         │
│ ⚠ Concern (if any)                  │
├─────────────────────────────────────┤
│ [View Details →]                    │
└─────────────────────────────────────┘
```

**Key Features:**
- Status color + icon + text
- Score visualization (progress bar)
- Top 2-3 benefits/concerns
- Clear call-to-action

### StatusBadge
**Purpose:** Display food safety status

**Variants:**
- ✓ Generally Appropriate (green)
- ⚠ Use Caution (yellow)
- ⊘ Limit Intake (orange)
- ✕ Avoid (red)
- ? Insufficient Data (gray)

**Design:**
- Icon + color + text label
- Accessible (not color-only)
- Consistent sizing
- Proper contrast

### ScoreIndicator
**Purpose:** Visualize numerical scores (0-100)

**Types:**
1. **Progress Bar:** Linear visualization
2. **Circular:** Compact, prominent
3. **Number + Label:** Simple, direct

**Score Ranges:**
- 90-100: Excellent (green)
- 70-89: Good (light green)
- 50-69: Fair (yellow)
- 30-49: Poor (orange)
- 0-29: Very Poor (red)

### NutrientCard
**Purpose:** Display nutrient information

**Structure:**
```
┌─────────────────────────────────┐
│ Calcium                         │
│ 300mg (30% of daily goal)       │
│ [Progress Bar ●●●○○○○○○○]      │
│ Good source for bone development│
└─────────────────────────────────┘
```

### ConcernAlert
**Purpose:** Highlight food safety concerns

**Structure:**
```
┌─────────────────────────────────┐
│ ⚠ High Sodium Content           │
│                                 │
│ This food contains high sodium  │
│ which may affect blood pressure.│
│                                 │
│ Recommendation: Limit intake    │
│ [Learn More →]                  │
└─────────────────────────────────┘
```

**Severity Levels:**
- Critical (red, prominent)
- Caution (yellow, moderate)
- Info (blue, subtle)

### ProfileCard
**Purpose:** Display user pregnancy profile

**Structure:**
```
┌─────────────────────────────────┐
│ Week 20 • Second Trimester      │
│ Due: March 15, 2027             │
├─────────────────────────────────┤
│ Age: 28 (Optimal)               │
│ Goals: Energy, Nausea Management│
└─────────────────────────────────┘
```

### DailySummaryCard
**Purpose:** Display daily nutrition aggregation

**Structure:**
```
┌─────────────────────────────────┐
│ Today's Nutrition               │
│ 3 meals • 5 foods logged        │
├─────────────────────────────────┤
│ Protein    65g / 71g  [●●●●○]  │
│ Calcium    850mg / 1000mg [●●●●○]│
│ Iron       15mg / 27mg  [●●○○○] │
├─────────────────────────────────┤
│ ⚠ 2 nutrients below target      │
│ [View Recommendations →]        │
└─────────────────────────────────┘
```

---

## Layout Patterns

### Mobile-First Layout
```
┌─────────────────┐
│    Header       │
├─────────────────┤
│                 │
│   Main Content  │
│   (single col)  │
│                 │
├─────────────────┤
│   Bottom Nav    │
└─────────────────┘
```

### Tablet Layout
```
┌─────────────────────────┐
│       Header            │
├──────────┬──────────────┤
│          │              │
│  Sidebar │ Main Content │
│          │ (single col) │
│          │              │
└──────────┴──────────────┘
```

### Desktop Layout
```
┌───────────────────────────────┐
│         Header                │
├──────────┬────────────┬───────┤
│          │            │       │
│ Sidebar  │   Main     │ Info  │
│          │  (2 col)   │ Panel │
│          │            │       │
└──────────┴────────────┴───────┘
```

---

## Spacing System

### Vertical Rhythm
- Section spacing: 48px (12)
- Card spacing: 24px (6)
- Component spacing: 16px (4)
- Element spacing: 8px (2)

### Content Width
- Mobile: 100% (with padding)
- Tablet: 768px max
- Desktop: 1200px max
- Reading width: 65ch (optimal)

---

## Interactive States

### Button States
```
Default   → Normal appearance
Hover     → Slightly darker, subtle scale
Focus     → 2px outline, outline-offset: 2px
Active    → Pressed appearance
Disabled  → 40% opacity, no pointer events
Loading   → Spinner, disabled state
```

### Input States
```
Default   → Border: neutral-300
Focus     → Border: primary-500, ring
Error     → Border: danger-500, error message
Success   → Border: success-500, checkmark
Disabled  → Background: neutral-100, opacity: 60%
```

---

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Full-width components
- Bottom navigation
- Larger touch targets (48px)

### Tablet (640px - 1024px)
- 2 column option for lists
- Sidebar navigation
- Larger content area

### Desktop (> 1024px)
- Multi-column layouts
- Side panels
- Hover interactions
- Keyboard shortcuts

---

## Animation Guidelines

### Performance
- Use `transform` and `opacity` only
- Avoid animating layout properties
- 60fps target
- Reduced motion option

### Timing
- Micro-interactions: 150ms
- Component transitions: 200ms
- Page transitions: 300ms
- Loading states: 500ms

### Easing
- Ease-out: Elements entering
- Ease-in: Elements exiting
- Ease-in-out: Elements moving

---

## Icon System

### Icon Sizes
- xs: 16px (inline text)
- sm: 20px (buttons)
- md: 24px (default)
- lg: 32px (prominent)
- xl: 48px (hero)

### Icon Usage
- Always with accessible label
- Decorative icons: aria-hidden="true"
- Interactive icons: aria-label or visible text
- Consistent style (outlined or filled)

### Pregnancy-Specific Icons
- ✓ Safe/Appropriate
- ⚠ Caution
- ⊘ Limit
- ✕ Avoid
- ? Unknown
- 🤰 Pregnancy profile
- 📊 Nutrition stats
- 📸 Scan food

---

## Color Usage

### Semantic Colors
- **Success:** Safe foods, positive indicators
- **Warning:** Caution foods, moderate concerns
- **Danger:** Avoid foods, critical concerns
- **Info:** Neutral information
- **Primary:** Brand, CTAs, interactive elements

### Pregnancy Context
- **Trimester 1:** Light pink tones
- **Trimester 2:** Medium pink tones
- **Trimester 3:** Deep pink tones

### Accessibility
- Minimum 4.5:1 contrast for text
- 3:1 for UI components
- Color never sole indicator
- Test with color blindness simulators

---

## Typography Scale

### Headings
- **H1:** 3xl (30px) - Page title
- **H2:** 2xl (24px) - Section title
- **H3:** xl (20px) - Subsection
- **H4:** lg (18px) - Component title
- **H5:** base (16px) - Small heading
- **H6:** sm (14px) - Label heading

### Body Text
- **Large:** lg (18px) - Emphasis
- **Base:** base (16px) - Standard
- **Small:** sm (14px) - Secondary
- **Extra Small:** xs (12px) - Labels

### Line Height
- Headings: 1.2 (tight)
- Body: 1.5 (comfortable)
- Small text: 1.4 (readable)

---

## Form Patterns

### Input with Label
```tsx
<label htmlFor="due-date">
  Due Date
  <span className="required">*</span>
</label>
<input
  id="due-date"
  type="date"
  required
  aria-describedby="due-date-hint"
/>
<span id="due-date-hint" className="hint">
  Your estimated due date
</span>
```

### Error State
```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert" className="error">
  Please enter a valid email address
</span>
```

### Multi-Step Form
- Progress indicator
- Save progress
- Back navigation
- Clear step labels

---

## Loading States

### Skeleton Screens
- Show structure while loading
- Pulse animation
- Match final content layout

### Spinners
- Small: Inline buttons
- Medium: Card content
- Large: Full page

### Progress Indicators
- Determinate: When duration known
- Indeterminate: When duration unknown
- Percentage: For long operations

---

## Empty States

### No Data
```
┌─────────────────────────────┐
│         [Icon]              │
│                             │
│   No foods scanned yet      │
│                             │
│   Scan your first food to   │
│   get personalized insights │
│                             │
│   [Scan Food Button]        │
└─────────────────────────────┘
```

### Error State
```
┌─────────────────────────────┐
│         [Icon]              │
│                             │
│   Something went wrong      │
│                             │
│   We couldn't load your data│
│   Please try again          │
│                             │
│   [Retry Button]            │
└─────────────────────────────┘
```

---

## Best Practices

### Do ✓
- Use semantic HTML
- Provide keyboard navigation
- Include loading states
- Show clear error messages
- Test with screen readers
- Support dark mode (future)
- Optimize for performance

### Don't ✗
- Use color as only indicator
- Remove focus outlines
- Auto-play animations
- Hide important information
- Use small touch targets (<44px)
- Rely on hover for critical info
- Overcomplicate interfaces

---

**Status:** Guidelines defined, ready for Phase 7 implementation  
**Next:** Component implementation in React/TypeScript
