"use client";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatInput from './ChatInput';

// Chat Component to display all forum posts for a specific match
// Sarah

interface Message {
  _id: string;
  matchId: string;
  author: string;
  content: string;
  createdAt: string;
}

interface ChatProps {
  matchId: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a2a;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #2a2a2a;
    border-radius: 4px;
  }
`;

const MessageCard = styled.div`
  padding: 12px 20px;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const AuthorName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #00ff87;
`;

const Timestamp = styled.span`
  font-size: 11px;
  color: #444;
`;

const MessageText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #bbb;
  line-height: 1.5;
`;

const Divider = styled.div`
  height: 1px;
  background: #1e1e1e;
  margin: 0 20px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 8px;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #444;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #444;
  font-size: 13px;
  padding: 40px 0;
`;

// matchId used to fetch and post messages for the correct game
export default function Chat({ matchId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${matchId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [matchId]);

  const handleNewMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>Match Chat</HeaderTitle>
      </Header>

      <MessageList>
        {loading ? (
          <LoadingText>Loading...</LoadingText>
        ) : messages.length === 0 ? (
          <EmptyState>
            <EmptyText>No messages yet — start the conversation</EmptyText>
          </EmptyState>
        ) : (
          messages.map((msg, index) => (
            <div key={msg._id}>
              <MessageCard>
                <MessageMeta>
                  <AuthorName>{msg.author}</AuthorName>
                  <Timestamp>{formatTime(msg.createdAt)}</Timestamp>
                </MessageMeta>
                <MessageText>{msg.content}</MessageText>
              </MessageCard>
              {index < messages.length - 1 && <Divider />}
            </div>
          ))
        )}
      </MessageList>

      <ChatInput matchId={matchId} onNewMessage={handleNewMessage} />
    </Wrapper>
  );
}