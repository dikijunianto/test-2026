# SEO_CONTENT_STRATEGY.md

## Objective

Generate organic traffic from World Cup related searches.

Target:

* World Cup standings
* World Cup groups
* Team pages
* Match pages
* Simulator pages
* Prediction pages

---

# SEO Architecture

## Static Pages

```text
/
```

Homepage

```text
/standings
```

All standings

```text
/matches
```

All matches

```text
/simulator
```

World Cup simulator

```text
/bracket
```

Knockout predictor

---

# Dynamic SEO Pages

## Group Pages

```text
/group/a
/group/b
/group/c
...
```

Content:

* Current standings
* Matches
* Qualification scenarios

Meta title:

```text
World Cup 2026 Group A Standings & Fixtures
```

---

## Team Pages

```text
/team/argentina
/team/brazil
/team/france
```

Content:

* Team profile
* Current standings
* Upcoming matches
* Qualification chances

Meta title:

```text
Argentina World Cup 2026 Standings, Fixtures & Qualification Chances
```

---

## Match Pages

```text
/match/argentina-vs-brazil
```

Content:

* Match information
* Head to head
* Prediction
* Result

Meta title:

```text
Argentina vs Brazil World Cup 2026 Match Preview
```

---

# Simulator Pages

Shareable URL

Example:

```text
/simulator?state=ENCODED_DATA
```

Generated title:

```text
My World Cup 2026 Prediction
```

Generated OG image:

```text
Argentina predicted champion
```

---

# Structured Data

Use JSON-LD

## Sports Event

```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent"
}
```

For match pages.

---

## Sports Team

```json
{
  "@context": "https://schema.org",
  "@type": "SportsTeam"
}
```

For team pages.

---

# Sitemap

Generate automatically.

Routes:

```text
/
/standings
/matches
/simulator
/bracket

/group/*
/team/*
/match/*
```

Refresh every 1 hour.

---

# Robots

Allow:

```text
/
/group/*
/team/*
/match/*
```

Disallow:

```text
/api/*
```

---

# Metadata Strategy

Homepage

Title:

```text
World Cup 2026 Standings, Fixtures & Simulator
```

Description:

```text
Track World Cup 2026 standings, fixtures, results and simulate qualification scenarios.
```

---

# Long Tail Keywords

Examples:

```text
world cup group a standings
world cup group b standings
argentina qualification scenario
brazil world cup fixtures
france world cup standings
world cup simulator
world cup predictor
world cup bracket challenge
```

---

# OpenGraph

Generate dynamic image.

Examples:

```text
Argentina tops Group J
```

```text
Brazil predicted champion
```

```text
France qualifies to Round of 16
```

Size:

```text
1200x630
```

---

# Caching

Standings:

5 minutes

Matches:

1 minute

SEO pages:

30 minutes

---

# Future Content Expansion

Auto generate:

```text
/news
/news/team/*
/analysis/*
```

Examples:

* Can Argentina Qualify?
* Brazil Qualification Scenarios
* France Route to Final
* Group A Qualification Calculator

These pages can be generated from standings data without requiring a database.

```
```
