import { NextRequest, NextResponse } from "next/server";
import { getMatch } from "@/lib/getMatch";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing required query param: id" },
            { status: 400 }
        );
    }

    try {
        const match = await getMatch(id);
        if (!match) {
            return NextResponse.json({ error: "Match not found" }, { status: 404 });
        }
        return NextResponse.json(match);
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        );
    }
}