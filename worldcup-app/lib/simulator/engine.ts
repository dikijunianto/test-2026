// lib/simulator/engine.ts
// Simulation engine - in-memory only, never writes files

import type { Match, Standing, Team, Group } from "@/lib/providers/types";

// Simulation state
export interface SimulationState {
  matches: Match[];
  predictions: Map<number, { homeScore: number; awayScore: number }>;
}

// Calculate standings from matches
export function recalculateStandings(
  matches: Match[],
  teams: Team[]
): Standing[] {
  const standingsMap = new Map<number, Standing>();

  for (const team of teams) {
    standingsMap.set(team.id, {
      teamId: team.id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== "finished") continue;
    if (match.homeScore === null || match.awayScore === null) continue;

    const homeStanding = standingsMap.get(match.homeTeamId);
    const awayStanding = standingsMap.get(match.awayTeamId);
    if (!homeStanding || !awayStanding) continue;

    homeStanding.played++;
    awayStanding.played++;

    homeStanding.goalsFor += match.homeScore;
    homeStanding.goalsAgainst += match.awayScore;
    awayStanding.goalsFor += match.awayScore;
    awayStanding.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeStanding.wins++;
      homeStanding.points += 3;
      awayStanding.losses++;
    } else if (match.homeScore < match.awayScore) {
      awayStanding.wins++;
      awayStanding.points += 3;
      homeStanding.losses++;
    } else {
      homeStanding.draws++;
      awayStanding.draws++;
      homeStanding.points += 1;
      awayStanding.points += 1;
    }

    homeStanding.goalDifference =
      homeStanding.goalsFor - homeStanding.goalsAgainst;
    awayStanding.goalDifference =
      awayStanding.goalsFor - awayStanding.goalsAgainst;
  }

  return Array.from(standingsMap.values());
}

// Calculate which teams qualify from each group
// 2026 World Cup: Top 2 from each group (24) + 8 best 3rd place = 32 teams
export function calculateQualification(
  standings: Standing[],
  groups: Group[]
): Map<string, number[]> {
  const qualified = new Map<string, number[]>();

  for (const group of groups) {
    const groupStandings = standings
      .filter((s) => group.teams.includes(s.teamId))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    const qualifiedTeams = groupStandings.slice(0, 2).map((s) => s.teamId);
    qualified.set(group.code, qualifiedTeams);
  }

  const thirdPlaceTeams: Array<{ teamId: number; points: number; gd: number; gf: number }> = [];

  for (const group of groups) {
    const groupStandings = standings
      .filter((s) => group.teams.includes(s.teamId))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    if (groupStandings.length >= 3) {
      const third = groupStandings[2];
      thirdPlaceTeams.push({
        teamId: third.teamId,
        points: third.points,
        gd: third.goalDifference,
        gf: third.goalsFor,
      });
    }
  }

  thirdPlaceTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  const bestThirdPlace = thirdPlaceTeams.slice(0, 8);

  for (const third of bestThirdPlace) {
    for (const [groupCode, teams] of qualified) {
      const group = groups.find((g) => g.code === groupCode);
      if (group && group.teams.includes(third.teamId)) {
        teams.push(third.teamId);
        break;
      }
    }
  }

  return qualified;
}

// Apply user predictions to matches
export function applyPredictions(
  originalMatches: Match[],
  predictions: Map<number, { homeScore: number; awayScore: number }>
): Match[] {
  return originalMatches.map((match) => {
    const prediction = predictions.get(match.id);
    if (!prediction) return match;

    return {
      ...match,
      status: "finished" as const,
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
    };
  });
}

// Get group standings for a specific group
export function getGroupStandings(
  standings: Standing[],
  groupCode: string,
  groups: Group[]
): Standing[] {
  const group = groups.find((g) => g.code === groupCode);
  if (!group) return [];

  return standings
    .filter((s) => group.teams.includes(s.teamId))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
}
