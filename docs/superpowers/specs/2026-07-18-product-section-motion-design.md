# Design Spec: Product Section Motion & Interactions

Design specification for adding rich, premium Framer Motion animations and interactive scroll-linked features to the Lembar product landing page.

## Goal

Create a premium, state-of-the-art interactive landing page experience by adding sticky scroll-highlighting steps, staggered workspace animations, and hover effects that showcase the value of Lembar (Dari materi menjadi lembar ujian yang siap ditinjau).

## Interactive & Motion Details

### 1. Hero & Preview Section
- **Entrance Animation:** Hero copy and primary/secondary CTA buttons slide up and fade in sequentially.
- **Simulated "Generate" Preview:** The preview document mockups animate in a staggered sequence to feel like AI is compiling the exam:
  1. The preview frame container slides up with a soft scale.
  2. The document title and metadata fade in.
  3. The question cards stagger-slide in from below (`y: 20` to `0`).
  4. The status badges (`Siap`, `Tinjau`) pop in with a spring scaling transition (`scale: [0.8, 1.1, 1]`).
  5. The output chips at the bottom stagger into view.

### 2. Steps Progress Tracker & Editorial Panels
- **Sticky Steps Navigation:**
  - The `proof` horizontal steps tracker (`01 Pilih materi` --- `02 Tinjau draft` --- `03 Gunakan hasil`) becomes sticky at the top of the viewport when scrolling past the Hero.
  - Clicking on any step smoothly scrolls the viewport to the corresponding section.
  - An `IntersectionObserver` updates the active step state in the tracker to highlight it as the user scrolls.
- **Editorial Visual Panels:**
  - **Panel 1 (Sumber Materi):** The "Unggah PDF" and "Buku Siswa" cards animate with a staggered slide-up when entering the viewport.
  - **Panel 2 (Tinjau Draft):** The browser mockup enters with a smooth translate. Inside it, the correct answer option choice A triggers a draw-checkmark animation and transitions to a light green background/border, representing a completed review step.
  - **Panel 3 (Gunakan Hasil):** The "Cetak", "PDF", and "Tautan" buttons stagger-scale with a spring animation.

### 3. Trust Section (Trace to Source)
- **Trace-to-Source Line Animation:**
  - A visual connecting line or highlight points from the answer choice on the left card to the source text quote block on the right card to show how AI-generated draft questions directly trace back to their source material.

---

## Verification Plan

### Manual Verification
- Deploy local dev server and open in browser.
- Verify sticky steps tracker changes highlight status correctly during scroll.
- Verify smooth scroll to sections on step clicks.
- Observe spring animations and hover state shadow/scale shifts.
