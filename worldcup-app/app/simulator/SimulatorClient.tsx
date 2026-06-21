// app/simulator/SimulatorClient.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Match, Team, Group } from "@/lib/providers/types";
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

function TeamBadge({ team, size = "md" }: { team: Team | undefined; size?: "sm" | "md" }) {
  if (!team?.crest) return null;
  const sizeClass = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  return <img src={team.crest} alt="" className={sizeClass} />;
}

function getRoundName(round: BracketMatch["round"]): string {
  switch (round) {
    case "roundOf32":
      return "ROUND OF 32";
    case "roundOf16":
      return "ROUND OF 16";
    case "quarterFinal":
      return "QUARTER-FINAL";
    case "semiFinal":
      return "SEMI-FINAL";
    case "final":
      return "FINAL";
  }
}

export function SimulatorClient({
  matches,
  teams,
  groups,
}: SimulatorClientProps) {
  const [activeTab, setActiveTab] = useState<"group" | "knockout">("group");
  const [predictions, setPredictions] = useState<
    Map<number, { homeScore: number; awayScore: number }>
  >(new Map());

  const [bracketWinners, setBracketWinners] = useState<Map<string, number>>(
    new Map()
  );

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
    if (typeof window === "undefined") return;
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

  // Render bracket match card
  const renderBracketMatch = (match: BracketMatch) => {
    const homeTeam = match.homeTeamId ? teamMap.get(match.homeTeamId) : null;
    const awayTeam = match.awayTeamId ? teamMap.get(match.awayTeamId) : null;

    return (
      <div
        key={match.id}
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-w-[220px]"
      >
        {/* Match Header */}
        <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200">
          <span className="text-xs text-gray-500">
            Match {match.matchNumber}
            {match.venue && ` · ${match.venue}`}
          </span>
        </div>

        {/* Home Team */}
        <button
          onClick={() =>
            match.homeTeamId && handleBracketWinner(match.id, match.homeTeamId)
          }
          disabled={!match.homeTeamId || match.winnerId === match.awayTeamId}
          className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
            match.winnerId === match.homeTeamId
              ? "bg-green-50 border-l-4 border-green-500"
              : match.homeTeamId
              ? "hover:bg-gray-50 cursor-pointer"
              : "bg-gray-50"
          }`}
        >
          <TeamBadge team={homeTeam ?? undefined} size="sm" />
          <span
            className={`flex-1 text-sm ${
              match.winnerId === match.homeTeamId
                ? "font-bold text-green-700"
                : match.homeTeamId
                ? "font-medium"
                : "text-gray-400"
            }`}
          >
            {homeTeam?.name ?? "Awaiting winner"}
          </span>
        </button>

        {/* Divider */}
        <div className="h-px bg-gray-200" />

        {/* Away Team */}
        <button
          onClick={() =>
            match.awayTeamId && handleBracketWinner(match.id, match.awayTeamId)
          }
          disabled={!match.awayTeamId || match.winnerId === match.homeTeamId}
          className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
            match.winnerId === match.awayTeamId
              ? "bg-green-50 border-l-4 border-green-500"
              : match.awayTeamId
              ? "hover:bg-gray-50 cursor-pointer"
              : "bg-gray-50"
          }`}
        >
          <TeamBadge team={awayTeam ?? undefined} size="sm" />
          <span
            className={`flex-1 text-sm ${
              match.winnerId === match.awayTeamId
                ? "font-bold text-green-700"
                : match.awayTeamId
                ? "font-medium"
                : "text-gray-400"
            }`}
          >
            {awayTeam?.name ?? "Awaiting winner"}
          </span>
        </button>
      </div>
    );
  };

  const rounds: BracketMatch["round"][] = [
    "roundOf32",
    "roundOf16",
    "quarterFinal",
    "semiFinal",
    "final",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("group")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "group"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              ⚽ Group Stage
            </button>
            <button
              onClick={() => setActiveTab("knockout")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "knockout"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🏆 Knockout Stage
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Group Stage Tab */}
        {activeTab === "group" && (
          <div className="space-y-6">
            {/* Match Simulator */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Match Simulator
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Edit scores to simulate group stage results
              </p>
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
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 flex items-center justify-end gap-2 font-medium">
                              <span className="text-sm">
                                {getTeamName(homeTeam, match.homeTeamId)}
                              </span>
                              <TeamBadge team={homeTeam} />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={
                                  prediction?.homeScore ??
                                  match.homeScore ??
                                  0
                                }
                                onChange={(e) =>
                                  handleScoreChange(
                                    match.id,
                                    "home",
                                    e.target.value
                                  )
                                }
                                className="w-14 text-center border rounded px-2 py-1.5 text-sm"
                              />
                              <span className="text-gray-400">-</span>
                              <input
                                type="number"
                                min="0"
                                value={
                                  prediction?.awayScore ??
                                  match.awayScore ??
                                  0
                                }
                                onChange={(e) =>
                                  handleScoreChange(
                                    match.id,
                                    "away",
                                    e.target.value
                                  )
                                }
                                className="w-14 text-center border rounded px-2 py-1.5 text-sm"
                              />
                            </div>
                            <div className="flex-1 flex items-center gap-2 font-medium">
                              <TeamBadge team={awayTeam} />
                              <span className="text-sm">
                                {getTeamName(awayTeam, match.awayTeamId)}
                              </span>
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
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Group Standings
              </h2>
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
                    <StandingsTable
                      standings={groupStandings}
                      teams={groupTeams}
                    />
                  );
                }}
              </GroupTabs>
            </div>
          </div>
        )}

        {/* Knockout Stage Tab - Bracket Only */}
        {activeTab === "knockout" && (
          <div className="space-y-6">
            {/* Champion Display */}
            {bracketState.champion && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-center shadow-lg">
                <h2 className="text-2xl font-bold text-yellow-900 mb-2">
                  🏆 Predicted Champion
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <TeamBadge team={teamMap.get(bracketState.champion)} />
                  <span className="text-3xl font-bold text-yellow-900">
                    {teamMap.get(bracketState.champion)?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Bracket Only - No Simulator, No Standings */}
            <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
              <div className="flex gap-6 min-w-max pb-4">
                {rounds.map((round) => {
                  const bracketMatches = getMatchesForRound(
                    bracketState,
                    round
                  );
                  const roundName = getRoundName(round);
                  const isFinalRound = round === "final";

                  return (
                    <div key={round} className="flex flex-col">
                      {/* Round Header */}
                      <div
                        className={`text-center mb-4 px-4 py-2 rounded-lg ${
                          isFinalRound
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        <h3 className="text-xs font-bold tracking-wider">
                          {roundName}
                        </h3>
                      </div>

                      {/* Matches */}
                      <div
                        className={`flex flex-col gap-4 flex-1 ${
                          isFinalRound ? "justify-center" : "justify-around"
                        }`}
                      >
                        {bracketMatches.map((match) =>
                          renderBracketMatch(match)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-800">
              <p className="font-medium mb-1">How to use:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Click on a team name to select them as the winner
                </li>
                <li>Winners advance to the next round automatically</li>
                <li>Complete all rounds to predict the champion</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
