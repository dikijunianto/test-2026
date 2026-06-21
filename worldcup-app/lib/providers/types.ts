// lib/providers/types.ts
export interface Competition {
  id: number;
  name: string;
  code: string;
  season: string;
}

export interface Team {
  id: number;
  name: string;
  code: string;
  crest: string;
}

export interface Match {
  id: number;
  group: string;
  utcDate: string;
  status: "scheduled" | "live" | "finished";
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Standing {
  teamId: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Group {
  code: string;
  teams: number[];
}

export interface Metadata {
  provider: string;
  lastSync: string;
  durationMs: number;
  status: "idle" | "syncing" | "success" | "error";
  error?: string;
}