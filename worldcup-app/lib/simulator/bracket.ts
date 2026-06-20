// lib/simulator/bracket.ts
export interface BracketMatch { id: string; round: "roundOf16" | "quarterFinal" | "semiFinal" | "final"; position: number; homeTeamId: number | null; awayTeamId: number | null; winnerId: number | null; }
export interface BracketState { matches: BracketMatch[]; champion: number | null }

const BRACKET_POSITIONS = { roundOf16: [{ home: "1A", away: "2B" }, { home: "1C", away: "2D" }, { home: "1E", away: "2F" }, { home: "1G", away: "2H" }, { home: "1B", away: "2A" }, { home: "1D", away: "2C" }, { home: "1F", away: "2E" }, { home: "1H", away: "2G" }] };

export function generateBracket(qualified: Map<string, number[]>): BracketState {
  const getTeamByPosition = (groupCode: string, position: number): number | null => { const groupTeams = qualified.get(groupCode); if (!groupTeams || position >= groupTeams.length) return null; return groupTeams[position] ?? null; };
  const roundOf16: BracketMatch[] = BRACKET_POSITIONS.roundOf16.map((pos, index) => ({ id: `r16-${index}`, round: "roundOf16" as const, position: index, homeTeamId: getTeamByPosition(pos.home.charAt(1), parseInt(pos.home.charAt(0)) - 1), awayTeamId: getTeamByPosition(pos.away.charAt(1), parseInt(pos.away.charAt(0)) - 1), winnerId: null }));
  const quarterFinals: BracketMatch[] = Array.from({ length: 4 }, (_, i) => ({ id: `qf-${i}`, round: "quarterFinal" as const, position: i, homeTeamId: null, awayTeamId: null, winnerId: null }));
  const semiFinals: BracketMatch[] = Array.from({ length: 2 }, (_, i) => ({ id: `sf-${i}`, round: "semiFinal" as const, position: i, homeTeamId: null, awayTeamId: null, winnerId: null }));
  const final: BracketMatch[] = [{ id: "final-0", round: "final" as const, position: 0, homeTeamId: null, awayTeamId: null, winnerId: null }];
  return { matches: [...roundOf16, ...quarterFinals, ...semiFinals, ...final], champion: null };
}

export function selectWinner(state: BracketState, matchId: string, winnerId: number): BracketState {
  const newMatches = state.matches.map((m) => ({ ...m }));
  const matchIndex = newMatches.findIndex((m) => m.id === matchId);
  if (matchIndex === -1) return state;
  const match = newMatches[matchIndex];
  if (match.homeTeamId !== winnerId && match.awayTeamId !== winnerId) return state;
  match.winnerId = winnerId;
  const roundOrder: BracketMatch["round"][] = ["roundOf16", "quarterFinal", "semiFinal", "final"];
  const currentIndex = roundOrder.indexOf(match.round);
  if (currentIndex < roundOrder.length - 1) {
    const nextRound = roundOrder[currentIndex + 1];
    const nextPosition = Math.floor(match.position / 2);
    const slot = match.position % 2 === 0 ? "home" : "away";
    const nextMatchId = `${nextRound.charAt(0)}${nextRound.charAt(1).toUpperCase()}-${nextPosition}`;
    const nextMatch = newMatches.find((m) => m.id === nextMatchId);
    if (nextMatch) { if (slot === "home") nextMatch.homeTeamId = winnerId; else nextMatch.awayTeamId = winnerId; }
  }
  if (match.round === "final") return { matches: newMatches, champion: winnerId };
  return { matches: newMatches, champion: null };
}

export function getMatchesForRound(state: BracketState, round: BracketMatch["round"]): BracketMatch[] { return state.matches.filter((m) => m.round === round); }