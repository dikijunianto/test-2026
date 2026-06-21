// lib/simulator/bracket.ts
// Knockout bracket generation and management (32-team format for 2026 World Cup)

export interface BracketMatch {
  id: string;
  matchNumber: number;
  round: "roundOf32" | "roundOf16" | "quarterFinal" | "semiFinal" | "final";
  position: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
  winnerId: number | null;
  venue?: string;
}

export interface BracketState {
  matches: BracketMatch[];
  champion: number | null;
}

// 2026 World Cup Round of 32 matchups (16 matches)
const ROUND_OF_32_MATCHUPS = [
  { homeGroup: "A", homePos: 0, awayGroup: "C", awayPos: 2, venue: "Mexico City" },
  { homeGroup: "B", homePos: 0, awayGroup: "D", awayPos: 2, venue: "Guadalajara" },
  { homeGroup: "E", homePos: 0, awayGroup: "G", awayPos: 2, venue: "Houston" },
  { homeGroup: "F", homePos: 0, awayGroup: "H", awayPos: 2, venue: "Dallas" },
  { homeGroup: "I", homePos: 0, awayGroup: "K", awayPos: 2, venue: "Monterrey" },
  { homeGroup: "J", homePos: 0, awayGroup: "L", awayPos: 2, venue: "Toronto" },
  { homeGroup: "C", homePos: 0, awayGroup: "A", awayPos: 2, venue: "New York" },
  { homeGroup: "D", homePos: 0, awayGroup: "B", awayPos: 2, venue: "Philadelphia" },
  { homeGroup: "G", homePos: 0, awayGroup: "E", awayPos: 2, venue: "Boston" },
  { homeGroup: "H", homePos: 0, awayGroup: "F", awayPos: 2, venue: "Atlanta" },
  { homeGroup: "K", homePos: 0, awayGroup: "I", awayPos: 2, venue: "Miami" },
  { homeGroup: "L", homePos: 0, awayGroup: "J", awayPos: 2, venue: "Seattle" },
  { homeGroup: "A", homePos: 1, awayGroup: "B", awayPos: 1, venue: "Los Angeles" },
  { homeGroup: "C", homePos: 1, awayGroup: "D", awayPos: 1, venue: "San Francisco" },
  { homeGroup: "E", homePos: 1, awayGroup: "F", awayPos: 1, venue: "Kansas City" },
  { homeGroup: "G", homePos: 1, awayGroup: "H", awayPos: 1, venue: "Vancouver" },
];

export function generateBracket(
  qualified: Map<string, number[]>
): BracketState {
  const getTeamByPosition = (
    groupCode: string,
    position: number
  ): number | null => {
    const groupTeams = qualified.get(groupCode);
    if (!groupTeams || position >= groupTeams.length) return null;
    return groupTeams[position] ?? null;
  };

  const roundOf32: BracketMatch[] = ROUND_OF_32_MATCHUPS.map(
    (matchup, index) => ({
      id: "r32-" + index,
      matchNumber: 49 + index,
      round: "roundOf32" as const,
      position: index,
      homeTeamId: getTeamByPosition(matchup.homeGroup, matchup.homePos),
      awayTeamId: getTeamByPosition(matchup.awayGroup, matchup.awayPos),
      winnerId: null,
      venue: matchup.venue,
    })
  );

  const roundOf16: BracketMatch[] = Array.from({ length: 8 }, (_, i) => ({
    id: "r16-" + i,
    matchNumber: 65 + i,
    round: "roundOf16" as const,
    position: i,
    homeTeamId: null,
    awayTeamId: null,
    winnerId: null,
    venue: ["Los Angeles", "San Francisco", "Houston", "Dallas", "New York", "Philadelphia", "Miami", "Atlanta"][i],
  }));

  const quarterFinals: BracketMatch[] = Array.from({ length: 4 }, (_, i) => ({
    id: "qf-" + i,
    matchNumber: 73 + i,
    round: "quarterFinal" as const,
    position: i,
    homeTeamId: null,
    awayTeamId: null,
    winnerId: null,
    venue: ["Houston", "Philadelphia", "Los Angeles", "San Francisco"][i],
  }));

  const semiFinals: BracketMatch[] = Array.from({ length: 2 }, (_, i) => ({
    id: "sf-" + i,
    matchNumber: 77 + i,
    round: "semiFinal" as const,
    position: i,
    homeTeamId: null,
    awayTeamId: null,
    winnerId: null,
    venue: ["Dallas", "Atlanta"][i],
  }));

  const final: BracketMatch[] = [
    {
      id: "final-0",
      matchNumber: 79,
      round: "final" as const,
      position: 0,
      homeTeamId: null,
      awayTeamId: null,
      winnerId: null,
      venue: "MetLife Stadium, New York",
    },
  ];

  return {
    matches: [
      ...roundOf32,
      ...roundOf16,
      ...quarterFinals,
      ...semiFinals,
      ...final,
    ],
    champion: null,
  };
}

export function selectWinner(
  state: BracketState,
  matchId: string,
  winnerId: number
): BracketState {
  const newMatches = state.matches.map((m) => ({ ...m }));
  const matchIndex = newMatches.findIndex((m) => m.id === matchId);

  if (matchIndex === -1) return state;

  const match = newMatches[matchIndex];

  if (match.homeTeamId !== winnerId && match.awayTeamId !== winnerId) {
    return state;
  }

  match.winnerId = winnerId;

  const nextRoundMatch = getNextRoundMatch(match);

  if (nextRoundMatch) {
    const nextMatch = newMatches.find((m) => m.id === nextRoundMatch.id);
    if (nextMatch) {
      if (nextRoundMatch.slot === "home") {
        nextMatch.homeTeamId = winnerId;
      } else {
        nextMatch.awayTeamId = winnerId;
      }
      resetDownstreamSelections(newMatches, nextMatch);
    }
  }

  if (match.round === "final") {
    return {
      matches: newMatches,
      champion: winnerId,
    };
  }

  return {
    matches: newMatches,
    champion: null,
  };
}

function getNextRoundMatch(
  match: BracketMatch
): { id: string; slot: "home" | "away" } | null {
  const roundOrder: BracketMatch["round"][] = [
    "roundOf32",
    "roundOf16",
    "quarterFinal",
    "semiFinal",
    "final",
  ];

  const currentIndex = roundOrder.indexOf(match.round);
  if (currentIndex >= roundOrder.length - 1) return null;

  const nextRound = roundOrder[currentIndex + 1];
  const nextPosition = Math.floor(match.position / 2);
  const slot = match.position % 2 === 0 ? "home" : "away";

  let nextRoundPrefix: string;
  switch (nextRound) {
    case "roundOf32":
      nextRoundPrefix = "r32";
      break;
    case "roundOf16":
      nextRoundPrefix = "r16";
      break;
    case "quarterFinal":
      nextRoundPrefix = "qf";
      break;
    case "semiFinal":
      nextRoundPrefix = "sf";
      break;
    case "final":
      nextRoundPrefix = "final";
      break;
  }

  return {
    id: nextRoundPrefix + "-" + nextPosition,
    slot,
  };
}

function resetDownstreamSelections(
  matches: BracketMatch[],
  changedMatch: BracketMatch
): void {
  if (
    changedMatch.winnerId &&
    changedMatch.winnerId !== changedMatch.homeTeamId &&
    changedMatch.winnerId !== changedMatch.awayTeamId
  ) {
    changedMatch.winnerId = null;

    const nextRoundMatch = getNextRoundMatch(changedMatch);
    if (nextRoundMatch) {
      const nextMatch = matches.find((m) => m.id === nextRoundMatch.id);
      if (nextMatch) {
        if (nextRoundMatch.slot === "home") {
          nextMatch.homeTeamId = null;
        } else {
          nextMatch.awayTeamId = null;
        }
        resetDownstreamSelections(matches, nextMatch);
      }
    }
  }
}

export function getMatchesForRound(
  state: BracketState,
  round: BracketMatch["round"]
): BracketMatch[] {
  return state.matches.filter((m) => m.round === round);
}

export function isBracketComplete(state: BracketState): boolean {
  return state.champion !== null;
}
