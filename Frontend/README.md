# Smart Financial Advisor — Frontend

A responsive React frontend that collects a user's financial data (income, expenses, loans, SIPs, goals, insurance etc.), stores it in `localStorage`, and sends a structured payload to a conversational LLM (via OpenRouter/OpenAI) to generate a personalized financial plan. The app aims to provide clear, India-aware advice while keeping keys secure for production.

---

## Table of contents

1. Project overview
2. Features
3. Tech stack
4. File structure (important files)
5. Quick start — local development
6. Environment variables
7. How the app works (step-by-step)
8. Local storage & "Plan Again" behavior
9. UI notes & accessibility
10. Production checklist & security
11. Troubleshooting
12. Contributing
13. License

---

## 1. Project overview

This frontend app helps users get smart, actionable financial advice using an LLM. Users fill in a multi-section form (income, expenses, loans, investments, SIPs, goals, insurance). The app:

* Persists the form in `localStorage` so users can return and edit without losing data.
* Calculates SIP summaries and displays totals live.
* Sends a well-structured JSON payload to the LLM API and shows the AI's response on a result page (rendered with Markdown support).
* Provides a Reset button to clear stored data and reset form.

> Note: For security, **do not** embed a private API key in client code for production. Use a backend proxy to hold secrets.

---

## 2. Features

* Multi-section form with add/remove rows (Income, Expenses, Loans, Goals, Investments, SIPs, Health issues)
* Loan inputs include tenure, EMI, total EMI paid and derived remaining EMI & approximate balance
* Live SIP summary (months invested, total invested, estimated value using CAGR)
* Saves form to `localStorage` automatically and restores on page load
* Loading indicator while AI generates advice
* Result page renders AI reply with Markdown (uses `react-markdown` + `remark-gfm`)
* Buttons: Submit for Advice, Reset Form, Plan Again (navigates back with stored data)

---

## 3. Tech stack

* React (Vite)
* React Router (client routing)
* `react-markdown` + `remark-gfm` for rendering AI replies
* Plain CSS (project includes `FinancialForm.css` and `AdviceResult.css`)
* Optional: OpenRouter / OpenAI APIs for LLM calls

---

## 4. File structure (important files)

```
/src
  /components
    Section.jsx
    InputRow.jsx
    YesNo.jsx
  /pages
    FinancialForm.jsx
    AdviceResult.jsx
  /utils
    helper.js   // calculateSIPValue, monthsBetween, formatINR
  App.jsx
  main.jsx
.vite
.env
README.md
FinancialForm.css
AdviceResult.css
```

---

## 5. Quick start — local development

1. Clone the repo:

   ```bash
   git clone https://github.com/AtulPatidar1709/Financial_Advisor.git
   cd Financial_Advisor/Frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create `.env` file (see section below)
4. Run dev server:

   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` (or the address Vite prints)

---

## 6. Environment variables

Create a `.env` file in the project root (Vite expects `VITE_` prefix for client-visible env vars). Example (development only):

```
VITE_OPENAI_API_KEY=sk-xxxxxx   # for testing only; move to backend for production
VITE_FINANCIAL_ADVISOR_RULES=You are a Certified Indian Financial Advisor...  # optional prompt
```

**Important:** Never commit real API keys to source control. For production, call your backend endpoint which holds the key.

If you'd like the full multi-line prompt in `.env`, provide it as a single line (escape newlines or compress as a single-line string).

---

## 7. How the app works (step-by-step)

1. User opens `/` (FinancialForm).
2. Component loads — attempts to read `financialFormData` from `localStorage`. If present, it populates the form state.
3. User edits values (add incomes, expenses, loans, SIP entries, etc.).
4. `useEffect` hooks auto-save the `formData` to `localStorage` on change.
5. SIP summary values are recalculated whenever SIP inputs change.
6. On Submit:

   * The UI shows a loading overlay.
   * The frontend posts a JSON payload (form data + SIP summaries) to the LLM endpoint (e.g., OpenRouter / OpenAI endpoint).
   * On success: navigate to `/result`, passing the `advice` text via `state`.
   * On failure: show an error alert and keep form data intact.
7. On the Result page, the advice is rendered using Markdown. A "Plan Again" (or "Back") button returns the user to the form. Since form data is in `localStorage`, the form repopulates.

---

## 8. Local storage & "Plan Again" behavior

* The app saves the current form into `localStorage` under the key `financialFormData`. This preserves user data across navigation and reloads.
* When the user clicks "Plan Again" on the result page the app navigates back to `/` and the form loads saved data automatically.
* The Reset button clears the `financialFormData` key and resets the form back to the initial template.

---

## 9. UI notes & accessibility

* Inputs are controlled components (value always comes from React state). Avoid switching between `undefined` and defined values to prevent React warnings.
* Buttons are keyboard accessible; add `aria-*` attributes to improve accessibility further.
* The loading overlay prevents duplicate submissions while awaiting an API response.
* For responsive behavior, make the form columns collapse on smaller screens — CSS is included in `FinancialForm.css`.

---

## 10. Production checklist & security

* **Never** expose real API keys in frontend code. Use a backend proxy to make LLM requests.
* Add server-side rate limiting and authentication for backend endpoints.
* Sanitize AI output before rendering as HTML. We use `react-markdown` to render markdown safely.
* Add monitoring/logging for backend API calls and user behavior.
* Consider pagination/caching if AI replies are large.

---

## 11. Troubleshooting

* `API key undefined` — ensure `.env` was created and Vite server restarted. Keys available only at build/run time.
* `insufficient_quota` — your API plan may not have quota; check provider dashboard.
* `Uncontrolled to controlled input` warning — ensure every input value is never `undefined`. Initialize all fields in `initialData`.

---

## 12. Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: ..."`
4. Push & open a PR

Please provide tests or manual test instructions for major changes.

---

## 13. License

This project is provided as-is. Add a license file (MIT recommended) if you plan to publish.

---

If you'd like, I can also:

* Convert this README into `README.md` in the repo (one-time file creation)
* Create a secure backend example (Node/Express) that proxies requests to OpenAI/OpenRouter
* Add CSS improvements for mobile-first responsiveness

Which one should I do next?
