import type { MatchData, MatchEvent, MatchStatus } from "@/types";

const API_BASE = "https://v3.football.api-sports.io";

//  API-Football raw types 

interface RawEvent {
    time: { elapsed: number };
    team: { id: number; name: string };
    player: { id: number; name: string };
    type: string;
    detail: string;
}

//  Helpers 

function mapStatus(short: string): MatchStatus {
    const live = ["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"];
    const final = ["FT", "AET", "PEN"];
    if (live.includes(short)) return "live";
    if (final.includes(short)) return "final";
    return "upcoming";
}

function mapEventType(type: string, detail: string): MatchEvent["type"] | null {
    if (type === "Goal") return "goal";
    if (type === "Card" && detail === "Yellow Card") return "yellow_card";
    if (type === "Card" && detail === "Red Card") return "red_card";
    if (type === "subst") return "substitution";
    return null;
}

function apiHeaders() {
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) throw new Error("API_FOOTBALL_KEY is not set in .env.local");
    return {
        "x-rapidapi-key": key,
        "x-rapidapi-host": "v3.football.api-sports.io",
    };
}

//  getMatch 

export async function getMatch(id: string): Promise<MatchData | null> {
    const headers = apiHeaders();

    const [fixtureRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/fixtures?id=${id}`, {
            headers,
            next: { revalidate: 30 }, // revalidate every 30s — good for live scores
        }),
        fetch(`${API_BASE}/fixtures/events?fixture=${id}`, {
            headers,
            next: { revalidate: 30 },
        }),
    ]);

    if (!fixtureRes.ok || !eventsRes.ok) return null;

    const [fixtureData, eventsData] = await Promise.all([
        fixtureRes.json(),
        eventsRes.json(),
    ]);

    const f = fixtureData.response?.[0];
    if (!f) return null;

    const events: MatchEvent[] = (eventsData.response ?? [])
        .map((e: RawEvent) => {
            const type = mapEventType(e.type, e.detail);
            if (!type) return null;
            return {
                minute: e.time.elapsed,
                team: e.team.id === f.teams.home.id ? "home" : "away",
                type,
                playerName: e.player.name,
                detail: e.detail,
            } satisfies MatchEvent;
        })
        .filter(Boolean);

    return {
        id: String(f.fixture.id),
        status: mapStatus(f.fixture.status.short),
        elapsed: f.fixture.status.elapsed ?? undefined,
        scheduledAt: f.fixture.date,
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
        league: {
            name: f.league.name,
            country: f.league.country,
            logoUrl: f.league.logo,
            round: f.league.round ?? undefined,
        },
        venue: {
            name: f.fixture.venue?.name ?? "Unknown Venue",
            city: f.fixture.venue?.city ?? "",
        },
        score: {
            halftime: { home: f.score.halftime.home, away: f.score.halftime.away },
            fulltime: { home: f.score.fulltime.home, away: f.score.fulltime.away },
        },
        events,
    };
}