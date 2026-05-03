# Car Recommendation App

## What did you build and why? What did you deliberately cut?

I built a car recommendation engine for the Indian market. Users fill in their preferences — budget, fuel type, body type, usage pattern, priorities, and seating requirements — and the app returns the top three matching cars along with AI-generated explanations and a summary powered by the Mistral API.

The core of the recommendation logic is a weighted scoring system that normalises mileage, safety ratings, and price efficiency across the filtered car pool, then ranks candidates based on the user's stated priority.

**Deliberate cuts:**
- **Authentication and user accounts** — out of scope for the core recommendation use case and would have added significant infrastructure overhead without improving the demonstration of the main idea.
- **Persistent storage** — preferences and results are stateless per session. Adding a database would have shifted focus away from the recommendation logic itself.
- **Polished UI** — the frontend is functional and clean but not production-finished. The priority was a working end-to-end flow rather than pixel-perfect design.

---

## What's your tech stack and why did you pick it?

| Layer | Technology | Reason |
|---|---|---|
| Backend | Go + Gin | Strongly typed, fast to compile, and well-suited for building lightweight HTTP APIs. Gin's minimal overhead made it easy to wire up routes and middleware quickly. |
| LLM | Mistral API (`mistral-small`) | Provides natural-language explanations and summaries without requiring a self-hosted model. The chat completions API is straightforward to call over plain `net/http`. |
| Frontend | React + TypeScript + Vite | TypeScript keeps the frontend aligned with the backend's data shapes. Vite gives fast HMR during development. |
| Styling | Tailwind CSS v3 | Utility-first approach allows rapid iteration on layout and components without maintaining a separate stylesheet. |

---

## What did you delegate to AI tools vs. do manually? Where did the tools help most?

I used Claude Code to scaffold and implement the majority of the codebase, keeping my role focused on direction, review, and testing.

**Delegated to AI:**
- Go struct definitions and JSON serialisation
- The filtering and scoring logic in the recommender
- Gin handler boilerplate and CORS setup
- React component structure, Tailwind styling, and TypeScript types
- The Mistral API integration

**Done manually:**
- Reviewing every generated file before accepting it
- Catching and correcting a prompt-engineering bug where the LLM was appending the summary into the explanations array
- Deciding the overall architecture — what packages to create, where responsibilities should live, and what to cut

**Where tools helped most:** The scaffolding and boilerplate phases. Setting up a Go module with the right package structure, wiring Gin middleware, and producing a type-safe React form with a double-range slider would have taken significantly longer by hand.

---

## Where did they get in the way?

The main friction came from the model making changes beyond the scope of what was asked. On a few occasions it would refactor surrounding code, add comments that weren't requested, or introduce abstractions that weren't needed for the task at hand. This required careful review to ensure nothing was silently changed in a way that introduced inconsistencies — for example, the `Recommendation` model was modified by the editor while the service layer still referenced the old struct, causing a compile error that needed manual diagnosis.

The iterative nature of prompt-based development also meant that context from earlier decisions wasn't always carried forward, occasionally requiring re-correction of something that had already been agreed on.

---

## If you had another 4 hours, what would you add?

1. **Conversational interface** — replace the static form with a chat-style UI where the user describes what they want in natural language, similar to talking to a car showroom sales agent. The preferences would be extracted from the conversation and fed into the same scoring engine.
2. **Smarter recommendation logic** — the current scoring weights are fixed. A better approach would dynamically adjust weights based on the combination of usage pattern and priorities, and factor in real-world ownership costs (insurance, servicing) rather than just sticker price.
3. **Richer UI** — add car images, links to detailed spec sheets, and a side-by-side comparison toggle so users can dig deeper into any car they're interested in.
