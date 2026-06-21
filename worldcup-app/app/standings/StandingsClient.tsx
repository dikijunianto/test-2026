// app/standings/StandingsClient.tsx
"use client";

import { useState, useMemo } from "react";
import type { Standing, Team, Group, Match } from "@/lib/providers/types";
import { recalculateStandings, calculateQualification } from "@/lib/simulator/engine";

interface StandingsClientProps {
  groups: Group[];
  standings: Standing[];
  teams: Team[];
  matches: Match[];
}

function formatDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function TeamRow({
  position,
  team,
  standing,
}: {
  position: number;
  team: Team | undefined;
  standing: Standing;
}) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <td className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400 w-6">{position}</td>
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          {team?.crest && (
            <img src={team.crest} alt="" className="w-5 h-5" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
            {team?.name ?? "Unknown"}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600 dark:text-gray-300">
        {standing.played}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600 dark:text-gray-300">
        {standing.wins}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600 dark:text-gray-300">
        {standing.draws}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600 dark:text-gray-300">
        {standing.losses}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600 dark:text-gray-300">
        {standing.goalsFor}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600 dark:text-gray-300">
        {standing.goalsAgainst}
      </td>
    </tr>
  );
}

function MatchRow({
  match,
  homeTeam,
  awayTeam,
  isSimulating,
  onScoreChange,
}: {
  match: Match;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  isSimulating: boolean;
  onScoreChange: (matchId: number, homeScore: number, awayScore: number) => void;
}) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <td className="py-1.5 px-2 text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
        {formatDate(match.utcDate)}
      </td>
      <td className="py-1.5 px-2">
        <div className="flex items-center gap-1.5">
          {homeTeam?.crest && (
            <img src={homeTeam.crest} alt="" className="w-4 h-4" />
          )}
          <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
            {homeTeam?.name ?? "TBD"}
          </span>
        </div>
      </td>
      <td className="py-1.5 px-2 text-center whitespace-nowrap">
        {isSimulating ? (
          <div className="flex items-center justify-center gap-1">
            <input
              type="number"
              min={0}
              max={99}
              value={match.homeScore ?? 0}
              onChange={(e) =>
                onScoreChange(match.id, parseInt(e.target.value) || 0, match.awayScore ?? 0)
              }
              className="w-8 h-6 text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
            <input
              type="number"
              min={0}
              max={99}
              value={match.awayScore ?? 0}
              onChange={(e) =>
                onScoreChange(match.id, match.homeScore ?? 0, parseInt(e.target.value) || 0)
              }
              className="w-8 h-6 text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        ) : (
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {match.homeScore ?? 0} - {match.awayScore ?? 0}
          </span>
        )}
      </td>
      <td className="py-1.5 px-2">
        <div className="flex items-center gap-1.5">
          {awayTeam?.crest && (
            <img src={awayTeam.crest} alt="" className="w-4 h-4" />
          )}
          <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
            {awayTeam?.name ?? "TBD"}
          </span>
        </div>
      </td>
    </tr>
  );
}

export function StandingsClient({
  groups,
  standings,
  teams,
  matches,
}: StandingsClientProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedMatches, setSimulatedMatches] = useState<Match[]>(matches);

  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const matchesByGroup = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const match of simulatedMatches) {
      const group = match.group || "Other";
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(match);
    }
    return map;
  }, [simulatedMatches]);

  const simulatedStandings = useMemo(() => {
    return recalculateStandings(simulatedMatches, teams);
  }, [simulatedMatches, teams]);

  const qualifiedTeams = useMemo(() => {
    const qualifiedMap = calculateQualification(simulatedStandings, groups);
    const allQualified: number[] = [];
    for (const teamIds of qualifiedMap.values()) {
      allQualified.push(...teamIds);
    }
    return allQualified;
  }, [simulatedStandings, groups]);

  const handleScoreChange = (matchId: number, homeScore: number, awayScore: number) => {
    setSimulatedMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, homeScore, awayScore } : m
      )
    );
  };

  const handleSimulate = () => {
    setIsSimulating(true);
  };

  const handleSaveToKnockout = () => {
    const params = new URLSearchParams();
    params.set("teams", JSON.stringify(teams));
    params.set("standings", JSON.stringify(simulatedStandings));
    params.set("groups", JSON.stringify(groups));
    params.set("matches", JSON.stringify(simulatedMatches));
    params.set("qualified", JSON.stringify(qualifiedTeams));
    window.location.href = `/standings?tab=knockout&${params.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {!isSimulating ? (
          <button
            onClick={handleSimulate}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
          >
            🎮 Simulate Scores
          </button>
        ) : (
          <>
            <button
              onClick={handleSaveToKnockout}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
            >
              ✅ Save to Knockout Stage
            </button>
            <button
              onClick={() => {
                setIsSimulating(false);
                setSimulatedMatches(matches);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 text-sm font-medium"
            >
              ↩️ Reset
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => {
          const groupStandings = simulatedStandings
            .filter((s) => group.teams.includes(s.teamId))
            .sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.goalDifference !== a.goalDifference)
                return b.goalDifference - a.goalDifference;
              return b.goalsFor - a.goalsFor;
            });

          const groupMatches = matchesByGroup.get(group.code) ?? [];

          return (
            <div
              key={group.code}
              className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/10 overflow-hidden"
            >
              <div className="bg-purple-600 text-white px-4 py-2">
                <h3 className="font-bold">Group {group.code}</h3>
              </div>

              <div className="p-3">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-1 px-2 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium">#</th>
                      <th className="py-1 px-2 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium">Team</th>
                      <th className="py-1 px-2 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">MP</th>
                      <th className="py-1 px-2 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">W</th>
                      <th className="py-1 px-2 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">D</th>
                      <th className="py-1 px-2 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">L</th>
                      <th className="py-1 px-2 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">GF</th>
                      <th className="py-1 px-2 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">GA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupStandings.map((standing, index) => (
                      <TeamRow
                        key={standing.teamId}
                        position={index + 1}
                        team={teamMap.get(standing.teamId)}
                        standing={standing}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                  Matches - Set scores manually
                </p>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium w-[90px]"></th>
                      <th className="text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium"></th>
                      <th className="text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium w-20"></th>
                      <th className="text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupMatches.map((match) => (
                      <MatchRow
                        key={match.id}
                        match={match}
                        homeTeam={teamMap.get(match.homeTeamId)}
                        awayTeam={teamMap.get(match.awayTeamId)}
                        isSimulating={isSimulating}
                        onScoreChange={handleScoreChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
