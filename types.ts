export interface TeamData {
    name: string;
    abbreviation: string;
    logoUrl?: string;
    score: number;
}

export interface GameData {
    id: string;
    sport: "nba" | "soccer";
    status: "live" | "upcoming" | "final";
    homeTeam: TeamData;
    awayTeam: TeamData;
    clock?: string;      // e.g. "4:32" 
    period?: number;     // quarter (NBA) or half (soccer)
    scheduledAt?: string;
    venue?: string;
}