# Architecture

## Overview

The application is a static-data-first architecture.

No database.

No Redis.

No cron jobs.

No external API calls from the frontend.

All World Cup data is stored locally in JSON files.

---

# System Flow

Football-Data.org
        │
        ▼
Manual Sync
        │
        ▼
Normalization Layer
        │
        ▼
data/*.json
        │
        ▼
Next.js Pages

---

# Rules

Frontend MUST NOT call Football-Data.org.

Frontend MUST ONLY read local JSON files.

Simulator MUST NEVER modify local JSON files.

Simulator state MUST exist only in browser memory.

Sync operation MUST overwrite JSON files only after successful completion.

Failed sync MUST NOT destroy existing data.

---

# Source Of Truth

The source of truth for football data is:

Football-Data.org API

The source of truth for application rendering is:

data/*.json