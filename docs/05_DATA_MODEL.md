# Internal Data Models

The application MUST NOT expose provider-specific schemas.

Provider responses must be mapped to the following interfaces.

---

# Competition

interface Competition {
  id: number
  name: string
  code: string
  season: string
}

---

# Team

interface Team {
  id: number
  name: string
  code: string
  crest: string
}

---

# Match

interface Match {
  id: number

  group: string

  utcDate: string

  status:
    | "scheduled"
    | "live"
    | "finished"

  homeTeamId: number

  awayTeamId: number

  homeScore: number | null

  awayScore: number | null
}

---

# Standing

interface Standing {
  teamId: number

  played: number

  wins: number

  draws: number

  losses: number

  goalsFor: number

  goalsAgainst: number

  goalDifference: number

  points: number
}

---

# Group

interface Group {
  code: string

  teams: number[]
}