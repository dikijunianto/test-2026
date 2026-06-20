import { readJSON } from "@/lib/data/data-reader";
import type { Match, Team } from "@/lib/providers/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Match Schedule & Results", description: "View all FIFA World Cup 2026 match schedules, live scores, and results." };
export const dynamic = "force-static";

export default function MatchesPage() {
  let matches: Match[] = []; let teams: Team[] = [];
  try { matches = readJSON<Match[]>("matches.json"); teams = readJSON<Team[]>("teams.json"); } catch {}
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const matchesByGroup = new Map<string, Match[]>();
  for (const match of matches) { const group = match.group || "Other"; if (!matchesByGroup.has(group)) matchesByGroup.set(group, []); matchesByGroup.get(group)!.push(match); }
  return (
    <div className="min-h-screen bg-gray-50 p-8"><div className="mx-auto max-w-6xl"><h1 className="text-2xl font-bold mb-6">Matches</h1>{matches.length === 0 ? (<div className="bg-white rounded-lg shadow p-8 text-center"><p className="text-gray-500">No match data available. Please sync data first.</p><a href="/admin/sync" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sync Data</a></div>) : (<div className="space-y-6">{Array.from(matchesByGroup.entries()).map(([group, groupMatches]) => (<div key={group} className="bg-white rounded-lg shadow p-6"><h2 className="text-lg font-semibold mb-4">{group}</h2><div className="space-y-3">{groupMatches.map((match) => { const homeTeam = teamMap.get(match.homeTeamId); const awayTeam = teamMap.get(match.awayTeamId); return (<div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md"><div className="flex-1 text-right font-medium">{homeTeam?.name ?? `Team ${match.homeTeamId}`}</div><div className="px-4 text-center"><span className="text-lg font-bold">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span><div className="text-xs text-gray-500">{match.status === "finished" ? "FT" : match.status === "live" ? "LIVE" : new Date(match.utcDate).toLocaleDateString()}</div></div><div className="flex-1 text-left font-medium">{awayTeam?.name ?? `Team ${match.awayTeamId}`}</div></div>); })}</div></div>))}</div></div>
  );
}