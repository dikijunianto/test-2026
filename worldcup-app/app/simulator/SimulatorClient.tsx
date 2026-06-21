// app/simulator/SimulatorClient.tsx
"use client";

import { useState, useCallback } from "react";
import type { Match, Team, Group } from "@/lib/providers/types";
import {
  recalculateStandings,
  calculateQualification,
  applyPredictions,
} from "@/lib/simulator/engine";
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

export function SimulatorClient({
  matches,
  teams,
  groups,
}: SimulatorClientProps) {
  const [predictions, setPredictions] = useState<
    Map<number, { homeScore: number; awayScore: number }>
  >(new Map());

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Apply predictions and recalculate
  const simulatedMatches = applyPredictions(matches, predictions);
  const simulatedStandings = recalculateStandings(simulatedMatches, teams);
  const qualification = calculateQualification(simulatedStandings, groups);

  // Handle score change
  const handleScoreChange = useCallback(
    (
      matchId: number,
      team: "home" | "away",
      value: string
    ) => {
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

  // Load on mount
  useState(() => {
    loadFromUrl();
  });

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

      {/* Qualified Teams */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Qualified Teams</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from(qualification.entries()).map(([groupCode, teamIds]) => (
            <div key={groupCode}>
              <h3 className="font-medium text-gray-700 mb-2">{groupCode}</h3>
              <ul className="space-y-1">
                {teamIds.map((teamId) => {
                  const team = teamMap.get(teamId);
                  return (
                    <li key={teamId} className="flex items-center gap-2 text-sm text-gray-600">
                      <TeamBadge team={team} />
                      <span>{getTeamName(team, teamId)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
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
