// API route for fetching and posting chat messages tied to a specific match
import { NextRequest, NextResponse } from 'next/server';
import getCollection from '../../../../lib/db';

const CHAT_COLLECTION = "chat-messages";

export async function GET(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const collection = await getCollection(CHAT_COLLECTION);

  const messages = await collection
    .find({ matchId })
    .sort({ createdAt: 1 })
    .toArray();

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const { author, content } = await req.json();

  if (!author || !content) {
    return NextResponse.json({ error: 'Author and content are required.' }, { status: 400 });
  }

  const collection = await getCollection(CHAT_COLLECTION);

  const newMessage = {
    matchId,
    author,
    content,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(newMessage);
  return NextResponse.json({ _id: result.insertedId, ...newMessage }, { status: 201 });
}