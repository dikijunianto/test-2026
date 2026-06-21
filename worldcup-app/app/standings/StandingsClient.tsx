// app/standings/StandingsClient.tsx
"use client";

import type { Standing, Team, Group, Match } from "@/lib/providers/types";

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
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 px-2 text-sm text-gray-500 w-6">{position}</td>
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          {team?.crest && (
            <img src={team.crest} alt="" className="w-5 h-5" />
          )}
          <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
            {team?.name ?? "Unknown"}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600">
        {standing.played}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600">
        {standing.wins}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600">
        {standing.draws}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600">
        {standing.losses}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600">
        {standing.goalsFor}
      </td>
      <td className="py-2 px-2 text-sm text-center text-gray-600">
        {standing.goalsAgainst}
      </td>
    </tr>
  );
}

function MatchRow({
  match,
  homeTeam,
  awayTeam,
}: {
  match: Match;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-1.5 px-2 text-[11px] text-gray-400 whitespace-nowrap">
        {formatDate(match.utcDate)}
      </td>
      <td className="py-1.5 px-2">
        <div className="flex items-center gap-1.5">
          {homeTeam?.crest && (
            <img src={homeTeam.crest} alt="" className="w-4 h-4" />
          )}
          <span className="text-xs text-gray-700 truncate max-w-[80px]">
            {homeTeam?.name ?? "TBD"}
          </span>
        </div>
      </td>
      <td className="py-1.5 px-2 text-xs font-bold text-gray-900 text-center whitespace-nowrap">
        {match.homeScore ?? 0} - {match.awayScore ?? 0}
      </td>
      <td className="py-1.5 px-2">
        <div className="flex items-center gap-1.5">
          {awayTeam?.crest && (
            <img src={awayTeam.crest} alt="" className="w-4 h-4" />
          )}
          <span className="text-xs text-gray-700 truncate max-w-[80px]">
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
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const matchesByGroup = new Map<string, Match[]>();
  for (const match of matches) {
    const group = match.group || "Other";
    if (!matchesByGroup.has(group)) {
      matchesByGroup.set(group, []);
    }
    matchesByGroup.get(group)!.push(match);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => {
        const groupStandings = standings
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
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="bg-purple-600 text-white px-4 py-2">
              <h3 className="font-bold">Group {group.code}</h3>
            </div>

            <div className="p-3">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-1 px-2 text-left text-[10px] text-gray-400 font-medium">#</th>
                    <th className="py-1 px-2 text-left text-[10px] text-gray-400 font-medium">Team</th>
                    <th className="py-1 px-2 text-center text-[10px] text-gray-400 font-medium">MP</th>
                    <th className="py-1 px-2 text-center text-[10px] text-gray-400 font-medium">W</th>
                    <th className="py-1 px-2 text-center text-[10px] text-gray-400 font-medium">D</th>
                    <th className="py-1 px-2 text-center text-[10px] text-gray-400 font-medium">L</th>
                    <th className="py-1 px-2 text-center text-[10px] text-gray-400 font-medium">GF</th>
                    <th className="py-1 px-2 text-center text-[10px] text-gray-400 font-medium">GA</th>
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

            <div className="border-t border-gray-100 px-3 py-2">
              <p className="text-[10px] text-gray-400 mb-1">
                Matches - Set scores manually
              </p>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-[10px] text-gray-400 font-medium w-[90px]"></th>
                    <th className="text-left text-[10px] text-gray-400 font-medium"></th>
                    <th className="text-center text-[10px] text-gray-400 font-medium w-12"></th>
                    <th className="text-left text-[10px] text-gray-400 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupMatches.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      homeTeam={teamMap.get(match.homeTeamId)}
                      awayTeam={teamMap.get(match.awayTeamId)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
