"use client";
import { useState, useCallback } from "react";
import type { Match, Team, Group } from "@/lib/providers/types";
import { recalculateStandings, calculateQualification, applyPredictions } from "@/lib/simulator/engine";
import { StandingsTable } from "@/components/StandingsTable";
import { GroupTabs } from "@/components/GroupTabs";

interface SimulatorClientProps { matches: Match[]; teams: Team[]; groups: Group[] }

export function SimulatorClient({ matches, teams, groups }: SimulatorClientProps) {
  const [predictions, setPredictions] = useState<Map<number, { homeScore: number; awayScore: number }>>(new Map());
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const simulatedMatches = applyPredictions(matches, predictions);
  const simulatedStandings = recalculateStandings(simulatedMatches, teams);
  const qualification = calculateQualification(simulatedStandings, groups);

  const handleScoreChange = useCallback((matchId: number, team: "home" | "away", value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;
    setPredictions((prev) => { const newPredictions = new Map(prev); const existing = newPredictions.get(matchId) ?? { homeScore: 0, awayScore: 0 }; if (team === "home") newPredictions.set(matchId, { ...existing, homeScore: numValue }); else newPredictions.set(matchId, { ...existing, awayScore: numValue }); return newPredictions; });
  }, []);

  const matchesByGroup = new Map<string, Match[]>();
  for (const match of simulatedMatches) { if (!match.group) continue; if (!matchesByGroup.has(match.group)) matchesByGroup.set(match.group, []); matchesByGroup.get(match.group)!.push(match); }

  return (
    <div className="space-y-6"><div className="bg-white rounded-lg shadow p-6"><h2 className="text-lg font-semibold mb-4">Match Simulator</h2><GroupTabs groups={groups}>{(groupCode) => { const groupMatches = matchesByGroup.get(groupCode) ?? []; return (<div className="space-y-3">{groupMatches.map((match) => { const homeTeam = teamMap.get(match.homeTeamId); const awayTeam = teamMap.get(match.awayTeamId); const prediction = predictions.get(match.id); return (<div key={match.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"><div className="flex-1 text-right font-medium">{homeTeam?.name ?? `Team ${match.homeTeamId}`}</div><div className="flex items-center gap-2"><input type="number" min="0" value={prediction?.homeScore ?? match.homeScore ?? 0} onChange={(e) => handleScoreChange(match.id, "home", e.target.value)} className="w-16 text-center border rounded px-2 py-1" /><span className="text-gray-500">-</span><input type="number" min="0" value={prediction?.awayScore ?? match.awayScore ?? 0} onChange={(e) => handleScoreChange(match.id, "away", e.target.value)} className="w-16 text-center border rounded px-2 py-1" /></div><div className="flex-1 font-medium">{awayTeam?.name ?? `Team ${match.awayTeamId}`}</div></div>); })}</div>); }}</GroupTabs></div><div className="bg-white rounded-lg shadow p-6"><h2 className="text-lg font-semibold mb-4">Simulated Standings</h2><GroupTabs groups={groups}>{(groupCode) => { const groupStandings = simulatedStandings.filter((s) => { const group = groups.find((g) => g.code === groupCode); return group?.teams.includes(s.teamId); }); const groupTeams = teams.filter((t) => groupStandings.some((s) => s.teamId === t.id)); return <StandingsTable standings={groupStandings} teams={groupTeams} />; }}</GroupTabs></div></div>
  );
}