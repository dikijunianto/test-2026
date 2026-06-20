# Architecture

## Monorepo

```text
worldcup-app/
│
├── apps/
│   ├── web/
│   └── api/
│
├── shared/
│
├── docs/
│
└── README.md
```

---

## Frontend

Framework:
- Next.js 15
- React 19
- TailwindCSS
- shadcn/ui
- Tanstack Query

Responsibilities:

- Render standings
- Render matches
- Run simulator locally
- Render bracket

---

## Backend

Framework:
- Go
- Fiber

Responsibilities:

- Fetch external data
- Normalize data
- Cache responses

---

## Cache

In memory cache

TTL:

- standings = 5 minutes
- matches = 1 minute

No database.