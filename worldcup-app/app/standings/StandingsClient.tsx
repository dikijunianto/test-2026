"use client";
import type { Standing, Team, Group } from "@/lib/providers/types";
import { StandingsTable } from "@/components/StandingsTable";
import { GroupTabs } from "@/components/GroupTabs";

interface StandingsClientProps { groups: Group[]; standings: Standing[]; teams: Team[] }

export function StandingsClient({ groups, standings, teams }: StandingsClientProps) {
  const getStandingsForGroup = (groupCode: string): Standing[] => { const group = groups.find((g) => g.code === groupCode); if (!group) return []; return standings.filter((s) => group.teams.includes(s.teamId)); };
  return (<div className="bg-white rounded-lg shadow p-6"><GroupTabs groups={groups}>{(groupCode) => { const groupStandings = getStandingsForGroup(groupCode); const groupTeams = teams.filter((t) => groupStandings.some((s) => s.teamId === t.id)); return <StandingsTable standings={groupStandings} teams={groupTeams} />; }}</GroupTabs></div>);
}