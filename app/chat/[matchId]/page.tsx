// Chat page for a specific match: displays the chat forum for that game
import Chat from '../../../components/Chat';

interface Props {
  params: Promise<{ matchId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { matchId } = await params;

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ color: 'white' }}>Match Forum</h2>
      <Chat matchId={matchId} />
    </div>
  );
}