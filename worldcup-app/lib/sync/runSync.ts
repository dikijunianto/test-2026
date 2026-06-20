// lib/sync/runSync.ts
import { FootballDataProvider } from "@/lib/providers/football-data-provider";
import type { Competition, Team, Match, Standing, Group, Metadata } from "@/lib/providers/types";
import { writeJSON, readJSON } from "@/lib/data/data-reader";

const WORLD_CUP_ID = 2000;

interface SyncResult { success: boolean; durationMs: number; error?: string }

function groupMatchesByGroup(matches: Match[]): Group[] {
  const groupMap = new Map<string, Set<number>>();
  for (const match of matches) {
    if (!match.group) continue;
    if (!groupMap.has(match.group)) groupMap.set(match.group, new Set());
    const teams = groupMap.get(match.group)!;
    teams.add(match.homeTeamId);
    teams.add(match.awayTeamId);
  }
  return Array.from(groupMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([code, teams]) => ({ code, teams: Array.from(teams) }));
}

export async function runSync(apiKey: string): Promise<SyncResult> {
  const startTime = Date.now();
  try {
    const provider = new FootballDataProvider(apiKey);
    const competition = await provider.getCompetition(WORLD_CUP_ID);
    const teams = await provider.getTeams(WORLD_CUP_ID);
    const matches = await provider.getMatches(WORLD_CUP_ID);
    const standings = await provider.getStandings(WORLD_CUP_ID);
    const groups = groupMatchesByGroup(matches);
    if (!competition.id || !competition.name) throw new Error("Invalid competition data");
    if (teams.length === 0) throw new Error("No teams found");
    if (matches.length === 0) throw new Error("No matches found");
    if (standings.length === 0) throw new Error("No standings found");
    writeJSON("competition.json", competition);
    writeJSON("teams.json", teams);
    writeJSON("matches.json", matches);
    writeJSON("standings.json", standings);
    writeJSON("groups.json", groups);
    const metadata: Metadata = { provider: "football-data", lastSync: new Date().toISOString(), durationMs: Date.now() - startTime, status: "success" };
    writeJSON("metadata.json", metadata);
    return { success: true, durationMs: Date.now() - startTime };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const metadata: Metadata = { provider: "football-data", lastSync: readJSON<Metadata>("metadata.json").lastSync, durationMs: Date.now() - startTime, status: "error", error: errorMessage };
    writeJSON("metadata.json", metadata);
    return { success: false, durationMs: Date.now() - startTime, error: errorMessage };
  }
}