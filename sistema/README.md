# Sistema

**Sistema** is a full-stack web application for **managing exam questions**, **generating printable exams (PDF)** with power-of-2 alternative scores, **exporting an official answer key (CSV)**, and **grading student responses** (strict or flexible modes) with a simple **Grading & Reports** UI.

It is built as an **npm workspaces monorepo** for a university experiment: `client/` (React + TypeScript + Tailwind) and `server/` (Node + TypeScript + Express + Cucumber acceptance tests).

---

## Features

- **Questions**: Create, list, update, and delete questions. Each question has a **description** and **alternatives** with `description` and `isCorrect` (boolean).
- **Exam generation**: Select questions and generate a **student-facing PDF** (question text, alternatives, and bitmask scores 1, 2, 4, 8… by **order**). The PDF does **not** expose correct answers or internal “question values.”
- **Gabarito (answer key)**: After generation, download the **official CSV** keyed by a unique **Exam ID** (expected sums per question).
- **Grading & Reports**: Upload the official key CSV and a **student responses** CSV (Exam ID, Student Name, Answer1, Answer2, …), choose **Strict** or **Flexible** grading, view results, and export a **grades CSV**.

---

## Repository layout

```
sistema/
  package.json          # workspaces + shared scripts
  client/               # Vite + React + Tailwind
  server/               # Express API + Cucumber features
    features/           # Gherkin (.feature) files
    features-step-definitions/
    features-support/
    src/
```

---

## Prerequisites

- **Node.js** (LTS recommended, e.g. 20+)
- **npm** (workspaces are used at the repo root)

---

## Install

From the `sistema/` directory:

```bash
npm install
```

This installs dependencies for **both** `client` and `server` workspaces.

---

## Development

### Run backend and frontend together (recommended)

From `sistema/`:

```bash
npm run dev
```

- **Backend**: `http://localhost:4000` (default; override with `PORT`)
- **Frontend**: `http://localhost:5173` (Vite)

The Vite dev server **proxies** `/api` to the backend, so the browser uses same-origin API calls and avoids CORS issues during development.

### Run services separately

```bash
npm run dev:server
npm run dev:client
```

### Environment

- **Server port**: `PORT` (default `4000`).

  Example (PowerShell):

  ```powershell
  $env:PORT=4000; npm run dev:server
  ```

---

## API overview (server)

Base URL in development: `http://localhost:4000` (or via Vite: `/api/...`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/questions` | List all questions |
| `POST` | `/api/questions` | Create a question (JSON body) |
| `PUT` | `/api/questions/:id` | Update a question |
| `DELETE` | `/api/questions/:id` | Delete a question |
| `POST` | `/api/exams/generate` | Generate exam: body `{ questionIds: string[] }` or `{ quantity: number }`, optional `disciplina`, `professor`, `data`. Returns **PDF** by default; use `Accept: application/json` or `?format=json` for JSON. Response header `X-Exam-Id` identifies the exam. |
| `GET` | `/api/exams/:examId/key.csv` | Download the **gabarito** (answer key) CSV for that exam |

**Power-of-2 scores**: the \(n\)-th alternative (1-based order in the list) has score \(2^{n-1}\). The expected sum per question (used in the gabarito and grading) is the sum of scores of **correct** alternatives.

---

## Acceptance tests (Cucumber)

Gherkin features live in `server/features/`. Step definitions call the real Express app via `supertest`.

From `sistema/`:

```bash
npm run test:acceptance
```

---

## Build (production)

From `sistema/`:

```bash
npm run build:server
npm run build:client
```

- Server output: `server/dist/`
- Client output: `client/dist/`

Run the compiled server (after `build:server`):

```bash
cd server
npm start
```

Serve the client build with any static file server, or `npm run preview` inside `client/`.

---

## Grading CSV formats

- **Official key (gabarito)**: columns `ExamId`, `Q1`, `Q2`, … (expected sum per question).
- **Student responses**: columns `Exam ID`, `Student Name`, `Answer1`, `Answer2`, … (student’s sum per question, as entered from the exam).

**Strict** mode: full credit only if the student sum equals the expected sum for that question. **Flexible** mode: proportional credit using bitmask overlap (see application logic in the Grading & Reports page).

---

## License

This project is for **educational / experimental** use. Add a license if you distribute it publicly.
