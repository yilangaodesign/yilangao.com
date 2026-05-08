# Edra Take-Home Assignment

## Organizing a Messy Workspace with AI

**Time:** 3–4 hours

---

## Context

You're designing for a note-taking/docs app similar to Notion. Your users — a team of ~25 people — have been using the tool for 2 years. They now have 600+ documents (wiki pages, meeting notes, project specs, one-pagers, personal drafts) scattered across the workspace with inconsistent naming and minimal folder structure.

A new team lead, **Maya**, wants to bring order to the chaos.

Your engineering team has built a **clustering model** that can group documents by similarity and suggest labels for each group. The model is powerful but needs some guidance from the user — it can cluster along different dimensions (topic, project, team, document type, recency) and produces better results when it understands what kind of organization the user is looking for. It can also take similar documents as "example data" and infer the dimensions.

---

## The Brief

Design the end-to-end experience for Maya. This has two parts:

1. **Input** — How does Maya tell the AI what she wants? How does the system gather enough context to produce useful clusters without making it feel like a chore?
2. **Output** — The AI produces a proposed reorganization. How does Maya understand, evaluate, and act on what the AI has suggested across hundreds of documents?

**A key design decision is yours to make:** Does the AI propose changes for Maya to review before applying, or does it apply changes that Maya can then adjust? Justify your choice.

---

## AI Capabilities

Treat these as given capabilities — don't design the model:

- **Group documents by similarity** across dimensions the user cares about
- **Learn organization patterns from examples** — if a user groups a few documents together or labels a cluster, the model can infer the underlying logic and apply it across the full workspace
- **Suggest human-readable labels** for each group
- **Flag likely duplicates and stale documents**
- **Re-cluster if given feedback** ("these two don't belong together")

---

## Deliverables

1. **User Flow** (1 page) — Maya's journey from deciding to organize through to a reorganized workspace. Show key decision points.
2. **Key Screens** (3–5 screens, mid-fidelity, annotated) — The most important moments across both input and output. Annotate your design reasoning.
3. **One Key Moment in High Fidelity** (1–2 screens) — Pick the single most critical interaction in your flow and design it at high fidelity. This is your chance to show craft — layout, hierarchy, micro-interactions, copy. Tell us why you chose this moment.
4. **Rationale** (half page max) — Key trade-offs, the biggest open question you'd want to test with users, and what you'd explore next.

---

## Evaluation Criteria

- How you shape a complex AI capability into an **intuitive user experience**
- Your instinct for **progressive disclosure** — communicating large amounts of information simply
- How you think about **trust, control, and the human-AI handoff**
- **Flow design** — does the journey feel coherent from start to finish?
