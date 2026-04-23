// this file allows us to get multiple matches instead of just one match
import type { GameData } from "@/types";

const API_BASE = "https://v3.football.api-sports.io";

// these constants will allow us to filter by the major leagues when we have a JSON response that goes over
// the threshold
const FEATURED_LEAGUES = new Set([
    39,   // Premier League
    140,  // La Liga
    135,  // Serie A
    78,   // Bundesliga
    61,   // Ligue 1
    2,    // Champions League
    3,    // Europa League
    848,  // Conference League
]);

const FIXTURE_THRESHOLD = 500;

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
// ** written by Miguel Ocque, some of this (some helper methods) is taken from Oscar Fang's file
// "getMatch.ts" that fetches a single match **

export async function getMatches(): Promise<GameData[]> {
    const headers = apiHeaders();
    const today = getTodayDate();

    // API call
    const res = await fetch(`${API_BASE}/fixtures?date=${today}`, {
        headers,
        next: { revalidate: 30 }, // refresh every 30s for live scores, implements ISR
    });

    // we get the data as JSON
    const data = await res.json();
    const all = data.response ?? [];

    // then we determine whether the total amount of matches returned is greater than 500
    // which is likely indicative of a busy fixture day, thus we only show matches for the
    // mainstream leagues, otherwise we return all the fixtures
    const fixtures = all.length > FIXTURE_THRESHOLD
        ? all.filter((f: { league: { id: number } }) => FEATURED_LEAGUES.has(f.league.id))
        : all;


    // here we map the JSON response to the appropriate types to match the GameData
    // type from "types.ts"
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