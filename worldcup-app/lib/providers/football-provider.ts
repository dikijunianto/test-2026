// lib/providers/football-provider.ts
import type { Competition, Team, Match, Standing } from "./types";

export interface FootballProvider {
  getCompetition(id: number): Promise<Competition>;
  getTeams(competitionId: number): Promise<Team[]>;
  getMatches(competitionId: number): Promise<Match[]>;
  getStandings(competitionId: number): Promise<Standing[]>;
}