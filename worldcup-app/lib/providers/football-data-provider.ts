// lib/providers/football-data-provider.ts
// Football-Data.org API implementation

import type { FootballProvider } from "./football-provider";
import type { Competition, Team, Match, Standing } from "./types";

const BASE_URL = "https://api.football-data.org/v4";

// Provider response types (raw from API)
interface RawCompetition {
  id: number;
  name: string;
  code: string;
  currentSeason?: {
    startDate: string;
    endDate: string;
  };
}

interface RawTeam {
  id: number;
  name: string;
  tla: string;
  crest: string;
}

interface RawMatch {
  id: number;
  matchday?: number;
  group?: string | null;
  utcDate: string;
  status: string;
  homeTeam: { id: number };
  awayTeam: { id: number };
  score: {
    fullTime?: { home: number | null; away: number | null };
  };
}

interface RawStanding {
  stage: string;
  type: string;
  group: string;
  table: Array<{
    team: { id: number };
    playedGames: number;
    won: number;
    draw: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }>;
}

function mapStatus(raw: string): "scheduled" | "live" | "finished" {
  if (raw === "FINISHED") return "finished";
  if (raw === "SCHEDULED" || raw === "TIMED") return "scheduled";
  return "live";
}

export class FootballDataProvider implements FootballProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "X-Auth-Token": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getCompetition(id: number): Promise<Competition> {
    const raw = await this.fetch<RawCompetition>(`/competitions/${id}`);
    return {
      id: raw.id,
      name: raw.name,
      code: raw.code,
      season: raw.currentSeason?.startDate?.substring(0, 4) ?? "",
    };
  }

  async getTeams(competitionId: number): Promise<Team[]> {
    const raw = await this.fetch<{ teams: RawTeam[] }>(
      `/competitions/${competitionId}/teams`
    );
    return raw.teams.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.tla,
      crest: t.crest,
    }));
  }

  async getMatches(competitionId: number): Promise<Match[]> {
    const raw = await this.fetch<{ matches: RawMatch[] }>(
      `/competitions/${competitionId}/matches`
    );
    return raw.matches.map((m) => ({
      id: m.id,
      group: m.group ?? "",
      utcDate: m.utcDate,
      status: mapStatus(m.status),
      homeTeamId: m.homeTeam.id,
      awayTeamId: m.awayTeam.id,
      homeScore: m.score.fullTime?.home ?? null,
      awayScore: m.score.fullTime?.away ?? null,
    }));
  }

  async getStandings(competitionId: number): Promise<Standing[]> {
    const raw = await this.fetch<{ standings: RawStanding[] }>(
      `/competitions/${competitionId}/standings`
    );
    
    // Filter TOTAL type and flatten all group tables
    const totalStandings = raw.standings.filter((s) => s.type === "TOTAL");
    if (totalStandings.length === 0) {
      throw new Error("No TOTAL standings found");
    }

    // Flatten all tables from all groups
    const allStandings: Standing[] = [];
    for (const standing of totalStandings) {
      for (const t of standing.table) {
        allStandings.push({
          teamId: t.team.id,
          played: t.playedGames,
          wins: t.won,
          draws: t.draw,
          losses: t.lost,
          goalsFor: t.goalsFor,
          goalsAgainst: t.goalsAgainst,
          goalDifference: t.goalDifference,
          points: t.points,
        });
      }
    }

    return allStandings;
  }
}