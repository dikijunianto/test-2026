// app/standings/KnockoutStageClient.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Standing, Team, Group, Match } from "@/lib/providers/types";
import { calculateQualification } from "@/lib/simulator/engine";
import { generateBracket, type BracketMatch } from "@/lib/simulator/bracket";

interface KnockoutStageClientProps {
  standings: Standing[];
  teams: Team[];
  groups: Group[];
  matches: Match[];
}

export function KnockoutStageClient({
  standings,
  teams,
  groups,
  matches,
}: KnockoutStageClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>([]);

  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  useEffect(() => {
    const qualifiedMap = calculateQualification(standings, groups);
    const bracketState = generateBracket(qualifiedMap);
    setBracketMatches(bracketState.matches);
  }, [standings, groups]);

  const renderBracketRound = (roundName: string, roundMatches: BracketMatch[]) => (
    <div className="flex flex-col gap-4">
      <div className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">
        {roundName}
      </div>
      {roundMatches.map((match) => (
        <div
          key={match.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/10 p-3 w-48"
        >
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">
            Match {match.matchNumber} - {match.venue}
          </div>
          <div className="space-y-1">
            {match.homeTeamId && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {teamMap.get(match.homeTeamId)?.crest && (
                    <img
                      src={teamMap.get(match.homeTeamId)!.crest}
                      alt=""
                      className="w-4 h-4"
                    />
                  )}
                  <span className="text-xs truncate max-w-[100px]">
                    {teamMap.get(match.homeTeamId)?.name ?? "TBD"}
                  </span>
                </div>
                {match.winnerId === match.homeTeamId && (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">✓</span>
                )}
              </div>
            )}
            {match.awayTeamId && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {teamMap.get(match.awayTeamId)?.crest && (
                    <img
                      src={teamMap.get(match.awayTeamId)!.crest}
                      alt=""
                      className="w-4 h-4"
                    />
                  )}
                  <span className="text-xs truncate max-w-[100px]">
                    {teamMap.get(match.awayTeamId)?.name ?? "TBD"}
                  </span>
                </div>
                {match.winnerId === match.awayTeamId && (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">✓</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const roundOf32 = bracketMatches.filter((m) => m.round === "roundOf32");
  const roundOf16 = bracketMatches.filter((m) => m.round === "roundOf16");
  const quarterFinals = bracketMatches.filter((m) => m.round === "quarterFinal");
  const semiFinals = bracketMatches.filter((m) => m.round === "semiFinal");
  const final = bracketMatches.filter((m) => m.round === "final");

  return (
    <div>
      {bracketMatches.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/10 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No knockout matches available. Run simulation in Group Stage first.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-8 items-start min-w-max pb-4">
            {renderBracketRound("Round of 32", roundOf32)}
            {renderBracketRound("Round of 16", roundOf16)}
            {renderBracketRound("Quarter-Finals", quarterFinals)}
            {renderBracketRound("Semi-Finals", semiFinals)}
            {renderBracketRound("Final", final)}
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              {selectedTeam.crest && (
                <img src={selectedTeam.crest} alt="" className="w-10 h-10" />
              )}
              <div>
                <h3 className="font-bold text-lg">{selectedTeam.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTeam.code}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTeam(null)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
