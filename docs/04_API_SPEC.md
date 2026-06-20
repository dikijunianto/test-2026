# API Specification

Base URL

/api

---

## GET /groups

Response

```json
{
  "groups": [
    {
      "name": "A",
      "teams": []
    }
  ]
}
```

---

## GET /standings

Response

```json
{
  "groups": [
    {
      "group": "A",
      "teams": [
        {
          "team": "Mexico",
          "played": 2,
          "wins": 2,
          "draws": 0,
          "losses": 0,
          "gf": 4,
          "ga": 1,
          "gd": 3,
          "points": 6
        }
      ]
    }
  ]
}
```

---

## GET /matches

Query

```text
group=A
```

Response

```json
{
  "matches": [
    {
      "id": "123",
      "group": "A",
      "homeTeam": "Mexico",
      "awayTeam": "South Korea",
      "homeScore": 1,
      "awayScore": 0,
      "status": "completed",
      "date": "2026-06-18"
    }
  ]
}
```