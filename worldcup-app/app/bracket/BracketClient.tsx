"use client";
import { useState, useCallback } from "react";
import type { Team, Group, Standing } from "@/lib/providers/types";
import { generateBracket, selectWinner, getMatchesForRound, type BracketState, type BracketMatch } from "@/lib/simulator/bracket";
import { calculateQualification } from "@/lib/simulator/engine";

interface BracketClientProps { teams: Team[]; groups: Group[]; standings: Standing[] }

export function BracketClient({ teams, groups, standings }: BracketClientProps) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const qualification = calculateQualification(standings, groups);
  const [bracketState, setBracketState] = useState<BracketState>(() => generateBracket(qualification));

  const handleSelectWinner = useCallback((matchId: string, winnerId: number) => { setBracketState((prev) => selectWinner(prev, matchId, winnerId)); }, []);

  const getRoundName = (round: BracketMatch["round"]): string => { switch (round) { case "roundOf16": return "Round of 16"; case "quarterFinal": return "Quarter Final"; case "semiFinal": return "Semi Final"; case "final": return "Final"; } };

  const renderMatch = (match: BracketMatch) => {
    const homeTeam = match.homeTeamId ? teamMap.get(match.homeTeamId) : null;
    const awayTeam = match.awayTeamId ? teamMap.get(match.awayTeamId) : null;
    return (
      <div key={match.id} className="bg-white border rounded-lg shadow-sm p-3 min-w-[200px]"><button onClick={() => match.homeTeamId && handleSelectWinner(match.id, match.homeTeamId)} disabled={!match.homeTeamId || match.winnerId === match.awayTeamId} className={`w-full text-left px-3 py-2 rounded mb-1 text-sm ${match.winnerId === match.homeTeamId ? "bg-green-100 border border-green-300 font-bold" : match.homeTeamId ? "hover:bg-gray-100 cursor-pointer" : "bg-gray-50 text-gray-400"}`}><div className="flex items-center gap-2">{homeTeam?.crest && (<img src={homeTeam.crest} alt="" className="w-5 h-5" />)}<span>{homeTeam?.name ?? "TBD"}</span></div></button><button onClick={() => match.awayTeamId && handleSelectWinner(match.id, match.awayTeamId)} disabled={!match.awayTeamId || match.winnerId === match.homeTeamId} className={`w-full text-left px-3 py-2 rounded text-sm ${match.winnerId === match.awayTeamId ? "bg-green-100 border border-green-300 font-bold" : match.awayTeamId ? "hover:bg-gray-100 cursor-pointer" : "bg-gray-50 text-gray-400"}`}><div className="flex items-center gap-2">{awayTeam?.crest && (<img src={awayTeam.crest} alt="" className="w-5 h-5" />)}<span>{awayTeam?.name ?? "TBD"}</span></div></button></div>
    );
  };

  const rounds: BracketMatch["round"][] = ["roundOf16", "quarterFinal", "semiFinal", "final"];

  return (
    <div className="space-y-6">{bracketState.champion && (<div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center"><h2 className="text-xl font-bold text-yellow-800 mb-2">🏆 Predicted Champion</h2><div className="flex items-center justify-center gap-3">{teamMap.get(bracketState.champion)?.crest && (<img src={teamMap.get(bracketState.champion)!.crest} alt="" className="w-12 h-12" />)}<span className="text-2xl font-bold">{teamMap.get(bracketState.champion)?.name}</span></div></div>)}<div className="bg-white rounded-lg shadow p-6 overflow-x-auto"><div className="flex gap-8 min-w-max">{rounds.map((round) => { const matches = getMatchesForRound(bracketState, round); return (<div key={round} className="flex flex-col"><h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">{getRoundName(round)}</h3><div className="flex flex-col justify-around gap-4 flex-1">{matches.map((match) => renderMatch(match))}</div></div>); })}</div></div></div>
  );
}