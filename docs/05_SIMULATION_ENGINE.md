# Simulation Engine

## Input

```json
{
  "matches": [
    {
      "id": "1",
      "homeScore": 2,
      "awayScore": 1
    }
  ]
}
```

---

## Rules

Win

```text
3 points
```

Draw

```text
1 point
```

Loss

```text
0 point
```

---

## Ranking Priority

1. Points
2. Goal Difference
3. Goals Scored
4. Head to Head

---

## Recalculation Flow

```text
Load Real Matches
        │
        ▼
Apply Simulated Matches
        │
        ▼
Recalculate Team Stats
        │
        ▼
Sort Standings
        │
        ▼
Generate Qualified Teams
```