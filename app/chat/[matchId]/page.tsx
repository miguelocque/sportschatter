import Chat from '../../components/Chat';

export default function ChatPage() {
  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ color: 'white' }}>Live Chat</h2>
      <Chat matchId="test-match-123" />
    </div>
  );
}