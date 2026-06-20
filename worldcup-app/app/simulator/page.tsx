import { readJSON } from "@/lib/data/data-reader";
import type { Match, Team, Group } from "@/lib/providers/types";
import { SimulatorClient } from "./SimulatorClient";

export const dynamic = "force-static";

export default function SimulatorPage() {
  let matches: Match[] = []; let teams: Team[] = []; let groups: Group[] = [];
  try { matches = readJSON<Match[]>("matches.json"); teams = readJSON<Team[]>("teams.json"); groups = readJSON<Group[]>("groups.json"); } catch {}
  if (matches.length === 0) { return (<div className="min-h-screen bg-gray-50 p-8"><div className="mx-auto max-w-6xl"><h1 className="text-2xl font-bold mb-6">World Cup Simulator</h1><div className="bg-white rounded-lg shadow p-8 text-center"><p className="text-gray-500">No match data available. Please sync data first.</p><a href="/admin/sync" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sync Data</a></div></div></div>); }
  return (<div className="min-h-screen bg-gray-50 p-8"><div className="mx-auto max-w-6xl"><h1 className="text-2xl font-bold mb-6">World Cup Simulator</h1><SimulatorClient matches={matches} teams={teams} groups={groups} /></div></div>);
}