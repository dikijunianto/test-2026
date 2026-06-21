// app/simulator/SimulatorClient.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Match, Team, Group, Standing } from "@/lib/providers/types";
import {
  recalculateStandings,
  calculateQualification,
  applyPredictions,
} from "@/lib/simulator/engine";
import {
  generateBracket,
  selectWinner,
  getMatchesForRound,
  type BracketState,
  type BracketMatch,
} from "@/lib/simulator/bracket";
import { StandingsTable } from "@/components/StandingsTable";
import { GroupTabs } from "@/components/GroupTabs";

interface SimulatorClientProps {
  matches: Match[];
  teams: Team[];
  groups: Group[];
}

function getTeamName(team: Team | undefined, fallbackId: number): string {
  if (team) return team.name;
  return "Team " + fallbackId;
}

function TeamBadge({ team }: { team: Team | undefined }) {
  if (team?.crest) {
    return <img src={team.crest} alt="" className="w-6 h-6" />;
  }
  return null;
}

function getRoundName(round: BracketMatch["round"]): string {
  switch (round) {
    case "roundOf16":
      return "Round of 16";
    case "quarterFinal":
      return "Quarter Final";
    case "semiFinal":
      return "Semi Final";
    case "final":
      return "Final";
  }
}

export function SimulatorClient({
  matches,
  teams,
  groups,
}: SimulatorClientProps) {
  const [predictions, setPredictions] = useState<
    Map<number, { homeScore: number; awayScore: number }>
  >(new Map());

  const [bracketWinners, setBracketWinners] = useState<
    Map<string, number>
  >(new Map());

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Apply predictions and recalculate
  const simulatedMatches = applyPredictions(matches, predictions);
  const simulatedStandings = recalculateStandings(simulatedMatches, teams);
  const qualification = calculateQualification(simulatedStandings, groups);

  // Generate bracket based on current qualification + bracket winners
  const bracketState = useMemo((): BracketState => {
    let state = generateBracket(qualification);
    // Apply bracket winner selections
    for (const [matchId, winnerId] of bracketWinners) {
      state = selectWinner(state, matchId, winnerId);
    }
    return state;
  }, [qualification, bracketWinners]);

  // Handle score change
  const handleScoreChange = useCallback(
    (matchId: number, team: "home" | "away", value: string) => {
      const numValue = value === "" ? 0 : parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0) return;

      setPredictions((prev) => {
        const newPredictions = new Map(prev);
        const existing = newPredictions.get(matchId) ?? {
          homeScore: 0,
          awayScore: 0,
        };

        if (team === "home") {
          newPredictions.set(matchId, { ...existing, homeScore: numValue });
        } else {
          newPredictions.set(matchId, { ...existing, awayScore: numValue });
        }

        return newPredictions;
      });
    },
    []
  );

  // Handle bracket winner selection
  const handleBracketWinner = useCallback(
    (matchId: string, winnerId: number) => {
      setBracketWinners((prev) => {
        const newWinners = new Map(prev);
        newWinners.set(matchId, winnerId);
        return newWinners;
      });
    },
    []
  );

  // Group matches by group
  const matchesByGroup = new Map<string, Match[]>();
  for (const match of simulatedMatches) {
    if (!match.group) continue;
    if (!matchesByGroup.has(match.group)) {
      matchesByGroup.set(match.group, []);
    }
    matchesByGroup.get(match.group)!.push(match);
  }

  // Generate shareable URL
  const shareUrl = useCallback(() => {
    const data = JSON.stringify({
      predictions: Object.fromEntries(predictions),
    });
    const encoded = btoa(data);
    return window.location.origin + "/simulator?data=" + encoded;
  }, [predictions]);

  // Load from URL
  const loadFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (!data) return;
    try {
      const decoded = JSON.parse(atob(data)) as {
        predictions?: Record<string, { homeScore: number; awayScore: number }>;
      };
      if (decoded.predictions) {
        const entries: [number, { homeScore: number; awayScore: number }][] =
          Object.entries(decoded.predictions).map(([key, value]) => [
            Number(key),
            value,
          ]);
        setPredictions(new Map(entries));
      }
    } catch {
      // Invalid data, ignore
    }
  }, []);

  // Load on mount (client-side only)
  useEffect(() => {
    loadFromUrl();
  }, [loadFromUrl]);

  // Render bracket match
  const renderBracketMatch = (match: BracketMatch) => {
    const homeTeam = match.homeTeamId ? teamMap.get(match.homeTeamId) : null;
    const awayTeam = match.awayTeamId ? teamMap.get(match.awayTeamId) : null;

    return (
      <div
        key={match.id}
        className="bg-white border rounded-lg shadow-sm p-3 min-w-[180px]"
      >
        <button
          onClick={() =>
            match.homeTeamId && handleBracketWinner(match.id, match.homeTeamId)
          }
          disabled={!match.homeTeamId || match.winnerId === match.awayTeamId}
          className={`w-full text-left px-3 py-2 rounded mb-1 text-sm ${
            match.winnerId === match.homeTeamId
              ? "bg-green-100 border border-green-300 font-bold"
              : match.homeTeamId
              ? "hover:bg-gray-100 cursor-pointer"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <TeamBadge team={homeTeam ?? undefined} />
            <span>{homeTeam?.name ?? "TBD"}</span>
          </div>
        </button>
        <button
          onClick={() =>
            match.awayTeamId && handleBracketWinner(match.id, match.awayTeamId)
          }
          disabled={!match.awayTeamId || match.winnerId === match.homeTeamId}
          className={`w-full text-left px-3 py-2 rounded text-sm ${
            match.winnerId === match.awayTeamId
              ? "bg-green-100 border border-green-300 font-bold"
              : match.awayTeamId
              ? "hover:bg-gray-100 cursor-pointer"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <TeamBadge team={awayTeam ?? undefined} />
            <span>{awayTeam?.name ?? "TBD"}</span>
          </div>
        </button>
      </div>
    );
  };

  const rounds: BracketMatch["round"][] = [
    "roundOf16",
    "quarterFinal",
    "semiFinal",
    "final",
  ];

  return (
    <div className="space-y-6">
      {/* Match Simulator */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Match Simulator</h2>
        <GroupTabs groups={groups}>
          {(groupCode) => {
            const groupMatches = matchesByGroup.get(groupCode) ?? [];
            return (
              <div className="space-y-3">
                {groupMatches.map((match) => {
                  const homeTeam = teamMap.get(match.homeTeamId);
                  const awayTeam = teamMap.get(match.awayTeamId);
                  const prediction = predictions.get(match.id);

                  return (
                    <div
                      key={match.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1 flex items-center justify-end gap-2 font-medium">
                        <span>{getTeamName(homeTeam, match.homeTeamId)}</span>
                        <TeamBadge team={homeTeam} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={prediction?.homeScore ?? match.homeScore ?? 0}
                          onChange={(e) =>
                            handleScoreChange(match.id, "home", e.target.value)
                          }
                          className="w-16 text-center border rounded px-2 py-1"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          min="0"
                          value={prediction?.awayScore ?? match.awayScore ?? 0}
                          onChange={(e) =>
                            handleScoreChange(match.id, "away", e.target.value)
                          }
                          className="w-16 text-center border rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-2 font-medium">
                        <TeamBadge team={awayTeam} />
                        <span>{getTeamName(awayTeam, match.awayTeamId)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }}
        </GroupTabs>
      </div>

      {/* Simulated Standings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Simulated Standings</h2>
        <GroupTabs groups={groups}>
          {(groupCode) => {
            const groupStandings = simulatedStandings.filter((s) => {
              const group = groups.find((g) => g.code === groupCode);
              return group?.teams.includes(s.teamId);
            });
            const groupTeams = teams.filter((t) =>
              groupStandings.some((s) => s.teamId === t.id)
            );
            return (
              <StandingsTable standings={groupStandings} teams={groupTeams} />
            );
          }}
        </GroupTabs>
      </div>

      {/* Knockout Bracket */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Knockout Bracket</h2>

        {/* Champion Display */}
        {bracketState.champion && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">
              Predicted Champion
            </h3>
            <div className="flex items-center justify-center gap-3">
              <TeamBadge team={teamMap.get(bracketState.champion)} />
              <span className="text-xl font-bold">
                {teamMap.get(bracketState.champion)?.name}
              </span>
            </div>
          </div>
        )}

        {/* Bracket Visualization */}
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {rounds.map((round) => {
              const bracketMatches = getMatchesForRound(bracketState, round);
              return (
                <div key={round} className="flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">
                    {getRoundName(round)}
                  </h3>
                  <div className="flex flex-col justify-around gap-4 flex-1">
                    {bracketMatches.map((match) => renderBracketMatch(match))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          <p>Click on a team to select them as winner. Winners advance to next round.</p>
        </div>
      </div>

      {/* Share */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Share Simulation</h2>
        <button
          onClick={() => {
            const url = shareUrl();
            navigator.clipboard.writeText(url);
            alert("URL copied to clipboard!");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Copy Shareable URL
        </button>
      </div>
    </div>
  );
}
