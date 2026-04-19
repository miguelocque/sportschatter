import type { GameData } from "@/types";

const API_BASE = "https://v3.football.api-sports.io";

// ** Helper Methods, written by Miguel Ocque **

function apiHeaders() {
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) throw new Error("API_FOOTBALL_KEY is not set in .env.local");
    return {
        "x-rapidapi-key": key,
        "x-rapidapi-host": "v3.football.api-sports.io",
    };
}

// gets the date for the current day
function getTodayDate(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// allows us to determine what the status of the fetched games are
function mapStatus(short: string): GameData["status"] {

    // we check if the short passed into this function is any one of the below, which will allow us
    // to determine if the game is live, final, or it us upcoming
    const live = ["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"];
    const final = ["FT", "AET", "PEN"];
    if (live.includes(short)) return "live";
    if (final.includes(short)) return "final";
    return "upcoming";
}

// a function that allows us to make an API call to obtain multiple matches instead of just one.
// ** written by Miguel Ocque, much of this is taken from Oscar Fang's file "getMatch.ts"
// that fetches a single match **

export async function getMatches(): Promise<GameData[]> {
    const headers = apiHeaders();
    const today = getTodayDate();

    // API call
    const res = await fetch(`${API_BASE}/fixtures?date=${today}`, {
        headers,
        next: { revalidate: 30 }, // refresh every 30s for live scores
    });

    if (!res.ok) return [];

    const data = await res.json();
    const fixtures = data.response ?? [];

    return fixtures.map((f: {
        fixture: {
            id: number;
            status: { short: string; elapsed: number | null };
            date: string;
            venue: { name: string | null };
        };
        teams: {
            home: { id: number; name: string; logo: string; winner: boolean | null };
            away: { id: number; name: string; logo: string; winner: boolean | null };
        };
        goals: { home: number | null; away: number | null };
        league: { name: string };
    }): GameData => ({
        id: String(f.fixture.id),
        sport: "soccer",
        status: mapStatus(f.fixture.status.short),
        homeTeam: {
            id: f.teams.home.id,
            name: f.teams.home.name,
            abbreviation: f.teams.home.name.slice(0, 3).toUpperCase(),
            logoUrl: f.teams.home.logo,
            score: f.goals.home ?? 0,
            winner: f.teams.home.winner ?? undefined,
        },
        awayTeam: {
            id: f.teams.away.id,
            name: f.teams.away.name,
            abbreviation: f.teams.away.name.slice(0, 3).toUpperCase(),
            logoUrl: f.teams.away.logo,
            score: f.goals.away ?? 0,
            winner: f.teams.away.winner ?? undefined,
        },
        clock: f.fixture.status.elapsed
            ? `${f.fixture.status.elapsed}'`
            : undefined,
        scheduledAt: f.fixture.date,
        venue: f.fixture.venue.name ?? undefined,
    }));
}