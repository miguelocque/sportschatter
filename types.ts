// ─── Shared ───────────────────────────────────────────────────────────────────

export interface TeamData {
    id: number;
    name: string;
    abbreviation: string;
    logoUrl?: string;
    score: number;
    winner?: boolean;
}

// ─── GameCard (list view) ─────────────────────────────────────────────────────

export interface GameData {
    id: string;
    sport: "nba" | "soccer";
    status: "live" | "upcoming" | "final";
    homeTeam: TeamData;
    awayTeam: TeamData;
    clock?: string;       // e.g. "4:32"
    period?: number;      // quarter (NBA) or half (soccer)
    scheduledAt?: string; // ISO date string — upcoming games only
    venue?: string;
}

// ─── MatchData (detail view) ──────────────────────────────────────────────────

export type MatchStatus = "live" | "upcoming" | "final";

export interface HalftimeScore {
    home: number | null;
    away: number | null;
}

export interface MatchEvent {
    minute: number;
    team: "home" | "away";
    type: "goal" | "yellow_card" | "red_card" | "substitution";
    playerName: string;
    detail?: string; // e.g. "Normal Goal", "Penalty"
}

export interface MatchData {
    id: string;
    status: MatchStatus;
    elapsed?: number;      // minutes elapsed (live only)
    scheduledAt: string;   // ISO date string
    homeTeam: TeamData;
    awayTeam: TeamData;
    league: {
        name: string;
        country: string;
        logoUrl?: string;
        round?: string;
    };
    venue: {
        name: string;
        city: string;
    };
    score: {
        halftime: HalftimeScore;
        fulltime: HalftimeScore;
    };
    events: MatchEvent[];
}