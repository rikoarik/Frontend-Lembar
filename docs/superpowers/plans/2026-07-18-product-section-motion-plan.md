# Lembar Product Section Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement premium, scroll-triggered animations and a sticky steps tracker that matches the visual mockup, using Framer Motion.

**Architecture:** 
- Use React `useState` and `useEffect` with an `IntersectionObserver` to track which editorial panel is active in the viewport and highlight the sticky steps tracker.
- Use Framer Motion's `motion` elements, `AnimatePresence`, and layout animations to transition components in-view with spring offsets.
- Update `src/lib/marketing/home.ts` to match the copy and content shown in the visual mockup.

**Tech Stack:** React, Next.js, Framer Motion, CSS Variables.

## Global Constraints
- Do not remove existing layout structures or styles unless specifically required for animation.
- All interactive links and steps must have unique `id` and descriptive attributes.
- Support Reduced Motion by conditionally returning static divs when `useReducedMotion()` is active.

---

### Task 1: Update Marketing Content to Match Mockup Copy

**Files:**
- Modify: `src/lib/marketing/home.ts`

**Interfaces:**
- Consumed by: `app/(marketing)/page.tsx`

- [ ] **Step 1: Modify content fields in home.ts**
  Update the `preview` and `how` content fields to match the Indonesian text in the mockup:
  - Document Title: "Penilaian Akhir Semester"
  - Settings: "Bahasa Indonesia · Kelas 5"
  - Question 1 text & answers matching the mockup.
  - Panel visuals matching 'generate', 'review', 'export'.
- [ ] **Step 2: Verify code compiling**
  Run: `pnpm typecheck`
  Expected: Success without TS errors.
- [ ] **Step 3: Commit**
  ```bash
  git add src/lib/marketing/home.ts
  git commit -m "feat: update marketing content copy to match mockup"
  ```

### Task 2: Implement Interactive Sticky Steps Tracker

**Files:**
- Modify: `app/(marketing)/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add IntersectionObserver logic in page.tsx**
  Add state `activeStep` and attach refs to each of the three editorial panels in the `#cara-kerja` section. Use IntersectionObserver to track which step is active.
- [ ] **Step 2: Make the proof section sticky in CSS**
  Update `.proof` CSS in `app/globals.css` to be `position: sticky; top: 64px; z-index: 10;` (below the main navbar).
- [ ] **Step 3: Add smooth scroll triggers to proof step headers**
  Clicking on a step in the steps bar scrolls the user to the corresponding panel.
- [ ] **Step 4: Verify sticky steps highlight & navigation**
  Verify in browser that scrolling dynamically changes active indicator on `01`, `02`, `03` steps, and clicking them scrolls smoothly.
- [ ] **Step 5: Commit**
  ```bash
  git add app/\(marketing\)/page.tsx app/globals.css
  git commit -m "feat: implement interactive sticky steps progress tracker"
  ```

### Task 3: Build Mockup Visual Components with Staggered Entrance Animations

**Files:**
- Create: `app/components/marketing/MockupPanels.tsx`
- Modify: `app/(marketing)/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Design Visual mockup components**
  Define `Panel1Visual` (Sumber Materi grid), `Panel2Visual` (Tinjau Draft browser window), and `Panel3Visual` (Export chips Cetak, PDF, Tautan).
- [ ] **Step 2: Add staggered entrance animations using Framer Motion**
  - Panel 1: Stagger-fade list of sources on entry.
  - Panel 2: Animating key option checkmark drawing + background fade-in.
  - Panel 3: Button sequence springs.
- [ ] **Step 3: Replace placeholder visual rendering in page.tsx**
- [ ] **Step 4: Style the new visual panels in globals.css**
- [ ] **Step 5: Verify animation behavior**
  Verify panels animate smoothly as they enter the viewport.
- [ ] **Step 6: Commit**
  ```bash
  git add app/components/marketing/MockupPanels.tsx app/\(marketing\)/page.tsx app/globals.css
  git commit -m "feat: build staggered visual mockups for Cara Kerja section"
  ```

### Task 4: Animate Hero Preview & AI Trace-to-Source (Trust Section)

**Files:**
- Modify: `app/(marketing)/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add real-time generation animations to Hero Preview**
  Stagger questions 01 and 02 entrance, then pop status badges.
- [ ] **Step 2: Animate connection line / arrow pointer in trust section**
  Draw or glow path between Option A and "Sumber Kutipan" when in view.
- [ ] **Step 3: Verify the full page animations**
  Run dev server and record preview.
- [ ] **Step 4: Commit**
  ```bash
  git add app/\(marketing\)/page.tsx app/globals.css
  git commit -m "feat: animate Hero preview generation and trust trace-to-source"
  ```
