# HIRKANI Accessibility Guidelines

## Overview
HIRKANI is committed to providing an accessible experience for all users, including pregnant women who may have temporary disabilities or access needs. We follow WCAG 2.1 Level AA standards as our baseline.

## Target Compliance
- **WCAG 2.1 Level AA** (baseline requirement)
- **WCAG 2.1 Level AAA** (aspirational for critical features)
- **Section 508** (U.S. federal accessibility)
- **EN 301 549** (European accessibility)

---

## Perceivable

### 1.1 Text Alternatives

**Guideline:** Provide text alternatives for all non-text content.

**Requirements:**
- All images have descriptive `alt` text
- Decorative images use `alt=""` or `role="presentation"`
- Icons paired with text labels or have `aria-label`
- Food product images include product name and status
- Charts and graphs have text descriptions

**Implementation:**
```tsx
// Good
<img src="product.jpg" alt="Greek Yogurt - Generally Appropriate for Pregnancy" />
<button aria-label="Scan food barcode"><CameraIcon aria-hidden="true" /></button>

// Bad
<img src="product.jpg" alt="Product" />
<button><CameraIcon /></button>
```

### 1.2 Time-based Media

**Guideline:** Provide alternatives for time-based media.

**Requirements:**
- Video content has captions
- Audio content has transcripts
- Educational videos have audio descriptions

### 1.3 Adaptable

**Guideline:** Create content that can be presented in different ways without losing information.

**Requirements:**
- Semantic HTML (headings, lists, landmarks)
- Proper heading hierarchy (h1 → h2 → h3)
- Content order makes sense when CSS is disabled
- Forms use proper labels and fieldsets
- Tables use `<th>`, `<caption>`, and scope attributes

**Implementation:**
```tsx
// Proper structure
<main>
  <h1>Food Analysis</h1>
  <section aria-labelledby="results-heading">
    <h2 id="results-heading">Analysis Results</h2>
    <h3>Pregnancy Safety</h3>
    <h3>Nutritional Quality</h3>
  </section>
</main>
```

### 1.4 Distinguishable

**Guideline:** Make it easier for users to see and hear content.

**Requirements:**

#### Color Contrast
- **Normal text:** 4.5:1 minimum
- **Large text (18pt+):** 3:1 minimum
- **UI components:** 3:1 minimum
- **Critical indicators:** AAA level (7:1)

**Color Palette Compliance:**
```typescript
// All color combinations meet WCAG AA
primary[500] on white: 4.5:1 ✓
secondary[600] on white: 4.5:1 ✓
success[600] on white: 4.5:1 ✓
danger[600] on white: 4.5:1 ✓
```

#### Color is Not the Only Visual Means
- Food status uses color + icon + text
- Errors shown with icon + color + message
- Charts use patterns in addition to colors
- Links underlined or have other visual indicators

**Implementation:**
```tsx
// Good - Multiple indicators
<Badge color="success" icon="✓">
  Generally Appropriate
</Badge>

// Bad - Color only
<Badge color="green">OK</Badge>
```

#### Text Resize
- Text can be resized to 200% without loss of content
- No horizontal scrolling at 320px width
- Support browser zoom up to 200%

#### Images of Text
- Avoid images of text
- Use real text styled with CSS
- Exception: Logos

---

## Operable

### 2.1 Keyboard Accessible

**Guideline:** Make all functionality available from a keyboard.

**Requirements:**
- All interactive elements keyboard accessible
- No keyboard traps
- Visible focus indicators
- Logical tab order
- Skip links provided

**Focus Indicators:**
```css
/* Visible focus state */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Never remove focus outline without replacement */
/* BAD: :focus { outline: none; } */
```

**Common Keyboard Shortcuts:**
- **Tab/Shift+Tab:** Navigate between interactive elements
- **Enter/Space:** Activate buttons/links
- **Escape:** Close dialogs/modals
- **Arrow keys:** Navigate lists, menus, sliders
- **Home/End:** Jump to start/end

### 2.2 Enough Time

**Guideline:** Provide users enough time to read and use content.

**Requirements:**
- No time limits on critical tasks (food scanning, analysis review)
- Timeout warnings with option to extend
- Ability to pause/stop auto-updating content

### 2.3 Seizures and Physical Reactions

**Guideline:** Do not design content that causes seizures or physical reactions.

**Requirements:**
- No flashing content more than 3 times per second
- No strobing effects
- Smooth animations only

### 2.4 Navigable

**Guideline:** Provide ways to help users navigate and find content.

**Requirements:**

#### Skip Links
```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

#### Page Titles
```tsx
<title>Greek Yogurt Analysis - HIRKANI</title>
```

#### Headings and Labels
- Descriptive headings
- Unique form labels
- Clear button text

#### Focus Order
- Logical tab order
- Modal traps focus inside
- Return focus when closing

#### Link Purpose
```tsx
// Good
<a href="/analysis/123">View Greek Yogurt Analysis</a>

// Bad
<a href="/analysis/123">Click here</a>
```

#### Multiple Ways
- Search functionality
- Navigation menu
- Breadcrumbs
- Site map

### 2.5 Input Modalities

**Guideline:** Make it easier for users to operate functionality through various inputs.

**Requirements:**
- Large touch targets (44x44px minimum)
- Pointer cancel (can abort gestures)
- Label in name (visible label matches accessible name)
- Motion actuation has alternative

**Touch Targets:**
```css
/* Minimum touch target size */
button, a, input {
  min-height: 44px;
  min-width: 44px;
}
```

---

## Understandable

### 3.1 Readable

**Guideline:** Make text content readable and understandable.

**Requirements:**
- Page language declared: `<html lang="en">`
- Language changes marked: `<span lang="es">Embarazo</span>`
- Plain language (8th grade reading level)
- Abbreviations explained on first use

### 3.2 Predictable

**Guideline:** Make web pages appear and operate in predictable ways.

**Requirements:**
- Consistent navigation across pages
- Consistent identification of components
- No context changes on focus
- No context changes on input (without warning)

**Examples:**
- Navigation always in same location
- "Scan" button always labeled "Scan"
- Forms don't auto-submit on field completion

### 3.3 Input Assistance

**Guideline:** Help users avoid and correct mistakes.

**Requirements:**

#### Error Identification
```tsx
<input
  type="text"
  aria-invalid="true"
  aria-describedby="name-error"
/>
<span id="name-error" role="alert">
  Name is required
</span>
```

#### Labels or Instructions
```tsx
<label htmlFor="due-date">
  Due Date
  <span className="hint">MM/DD/YYYY</span>
</label>
<input id="due-date" type="date" required />
```

#### Error Suggestion
```tsx
// Good error message
"Due date must be in the future. Please select a date after today."

// Bad error message
"Invalid date"
```

#### Error Prevention
- Confirmation for irreversible actions
- Ability to review before submit
- Ability to edit after submit

---

## Robust

### 4.1 Compatible

**Guideline:** Maximize compatibility with current and future tools.

**Requirements:**
- Valid HTML
- Proper ARIA usage
- Name, Role, Value for custom components
- Status messages announced

**ARIA Usage:**
```tsx
// Button
<button aria-label="Close" onClick={onClose}>
  <CloseIcon aria-hidden="true" />
</button>

// Loading state
<div role="status" aria-live="polite">
  Loading analysis...
</div>

// Alert
<div role="alert" aria-atomic="true">
  Food analysis complete
</div>
```

---

## Pregnancy-Specific Accessibility

### Temporary Disabilities
Pregnant women may experience:
- **Fatigue:** Need for clear, scannable content
- **Nausea:** Sensitivity to motion/animation
- **Swelling:** Difficulty with fine motor control
- **Vision changes:** Need for good contrast
- **Brain fog:** Need for simple, clear language

### Design Accommodations
- Large, easy-to-tap buttons
- Minimal required scrolling
- Clear, simple language
- Reduced motion option
- High contrast mode
- Scannable content structure

---

## Screen Reader Guidelines

### Announcement Patterns

**Food Analysis Result:**
```tsx
<div role="region" aria-label="Analysis results">
  <h2>Greek Yogurt</h2>
  <div role="status">
    <span className="sr-only">
      Analysis complete. Food is generally appropriate for pregnancy.
      Pregnancy safety score: 85 out of 100. Good.
    </span>
  </div>
</div>
```

**Loading States:**
```tsx
<button aria-busy="true" aria-live="polite">
  <span>Analyzing...</span>
  <span className="sr-only">
    Food analysis in progress. Please wait.
  </span>
</button>
```

**Dynamic Content:**
```tsx
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

---

## Testing Requirements

### Automated Testing
- **axe-core:** Run on every page
- **Lighthouse:** Accessibility score 90+
- **pa11y:** CI/CD integration
- **eslint-plugin-jsx-a11y:** Lint rules

### Manual Testing
- **Keyboard navigation:** Tab through all interactions
- **Screen reader:** Test with NVDA/JAWS/VoiceOver
- **Zoom:** Test at 200% zoom
- **Color contrast:** Check all combinations
- **Focus indicators:** Verify visibility

### User Testing
- Test with pregnant women
- Test with screen reader users
- Test with keyboard-only users
- Test with low vision users

---

## Common Patterns

### Modal Dialog
```tsx
<dialog
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
  <button onClick={onConfirm}>Confirm</button>
  <button onClick={onCancel}>Cancel</button>
</dialog>
```

### Form with Errors
```tsx
<form aria-labelledby="form-title">
  <h2 id="form-title">Profile Information</h2>
  
  {errors.length > 0 && (
    <div role="alert" aria-live="assertive">
      <h3>Please correct the following errors:</h3>
      <ul>
        {errors.map(error => (
          <li key={error.field}>{error.message}</li>
        ))}
      </ul>
    </div>
  )}
  
  {/* Form fields */}
</form>
```

### Data Table
```tsx
<table>
  <caption>Daily Nutrition Summary</caption>
  <thead>
    <tr>
      <th scope="col">Nutrient</th>
      <th scope="col">Amount</th>
      <th scope="col">Daily Goal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Protein</th>
      <td>65g</td>
      <td>71g</td>
    </tr>
  </tbody>
</table>
```

---

## Resources

### Standards
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508](https://www.section508.gov/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [pa11y](https://pa11y.org/)

### Screen Readers
- **Windows:** NVDA (free), JAWS
- **macOS:** VoiceOver (built-in)
- **iOS:** VoiceOver (built-in)
- **Android:** TalkBack (built-in)

---

## Compliance Checklist

### Phase 7 (UI Implementation)
- [ ] All images have alt text
- [ ] Color contrast meets 4.5:1 (AA)
- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators on all focusable elements
- [ ] Skip links provided
- [ ] Semantic HTML throughout
- [ ] Proper heading hierarchy
- [ ] Forms have labels and error messages
- [ ] ARIA attributes used correctly
- [ ] No keyboard traps
- [ ] Touch targets 44x44px minimum
- [ ] Text resizable to 200%
- [ ] No horizontal scroll at 320px
- [ ] Consistent navigation
- [ ] Valid HTML
- [ ] Screen reader tested

### Phase 9 (Testing)
- [ ] Automated testing with axe-core
- [ ] Manual keyboard testing
- [ ] Screen reader testing (NVDA + VoiceOver)
- [ ] Zoom testing (200%)
- [ ] Color contrast verified
- [ ] User testing with target audience

---

**Status:** Guidelines defined, ready for Phase 7 implementation  
**Compliance Target:** WCAG 2.1 Level AA  
**Testing Required:** Automated + Manual + User Testing
