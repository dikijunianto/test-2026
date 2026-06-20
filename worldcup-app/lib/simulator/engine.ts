// lib/simulator/engine.ts
import type { Match, Standing, Team, Group } from "@/lib/providers/types";

export function recalculateStandings(matches: Match[], teams: Team[]): Standing[] {
  const standingsMap = new Map<number, Standing>();
  for (const team of teams) { standingsMap.set(team.id, { teamId: team.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }); }
  for (const match of matches) {
    if (match.status !== "finished" || match.homeScore === null || match.awayScore === null) continue;
    const homeStanding = standingsMap.get(match.homeTeamId);
    const awayStanding = standingsMap.get(match.awayTeamId);
    if (!homeStanding || !awayStanding) continue;
    homeStanding.played++; awayStanding.played++;
    homeStanding.goalsFor += match.homeScore; homeStanding.goalsAgainst += match.awayScore;
    awayStanding.goalsFor += match.awayScore; awayStanding.goalsAgainst += match.homeScore;
    if (match.homeScore > match.awayScore) { homeStanding.wins++; homeStanding.points += 3; awayStanding.losses++; }
    else if (match.homeScore < match.awayScore) { awayStanding.wins++; awayStanding.points += 3; homeStanding.losses++; }
    else { homeStanding.draws++; awayStanding.draws++; homeStanding.points += 1; awayStanding.points += 1; }
    homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
    awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;
  }
  return Array.from(standingsMap.values());
}

export function calculateQualification(standings: Standing[], groups: Group[]): Map<string, number[]> {
  const qualified = new Map<string, number[]>();
  for (const group of groups) {
    const groupStandings = standings.filter((s) => group.teams.includes(s.teamId)).sort((a, b) => { if (b.points !== a.points) return b.points - a.points; if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference; return b.goalsFor - a.goalsFor; });
    qualified.set(group.code, groupStandings.slice(0, 2).map((s) => s.teamId));
  }
  return qualified;
}

export function applyPredictions(originalMatches: Match[], predictions: Map<number, { homeScore: number; awayScore: number }>): Match[] {
  return originalMatches.map((match) => { const prediction = predictions.get(match.id); if (!prediction) return match; return { ...match, status: "finished" as const, homeScore: prediction.homeScore, awayScore: prediction.awayScore }; });
}