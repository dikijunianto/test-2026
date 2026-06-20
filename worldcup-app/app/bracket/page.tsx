import { readJSON } from "@/lib/data/data-reader";
import type { Team, Group, Standing } from "@/lib/providers/types";
import { BracketClient } from "./BracketClient";

export const dynamic = "force-static";

export default function BracketPage() {
  let teams: Team[] = []; let groups: Group[] = []; let standings: Standing[] = [];
  try { teams = readJSON<Team[]>("teams.json"); groups = readJSON<Group[]>("groups.json"); standings = readJSON<Standing[]>("standings.json"); } catch {}
  if (teams.length === 0) { return (<div className="min-h-screen bg-gray-50 p-8"><div className="mx-auto max-w-6xl"><h1 className="text-2xl font-bold mb-6">Knockout Bracket</h1><div className="bg-white rounded-lg shadow p-8 text-center"><p className="text-gray-500">No data available. Please sync data first.</p><a href="/admin/sync" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sync Data</a></div></div></div>); }
  return (<div className="min-h-screen bg-gray-50 p-8"><div className="mx-auto max-w-6xl"><h1 className="text-2xl font-bold mb-6">Knockout Bracket</h1><BracketClient teams={teams} groups={groups} standings={standings} /></div></div>);
}