"use client";
import { useState, useEffect } from 'react';
import styled from 'styled-components';

// ChatInput Component to handle post submission
// Random username is generated when posted
// Sarah

interface Message {
  _id: string;
  matchId: string;
  author: string;
  content: string;
  createdAt: string;
}

interface ChatInputProps {
  matchId: string;
  onNewMessage: (msg: Message) => void;
}

const InputWrapper = styled.div`
  border-top: 1px solid #2a2a2a;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #111;
`;

const UserLabel = styled.p`
  margin: 0;
  font-size: 11px;
  color: #555;
  letter-spacing: 0.04em;

  strong {
    color: #00ff87;
    font-weight: 600;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ddd;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  height: 72px;
  line-height: 1.5;
  transition: border-color 0.15s ease;
  box-sizing: border-box;

  &::placeholder { color: #444; }
  &:focus {
    outline: none;
    border-color: #444;
  }
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 8px 20px;
  background: #00ff87;
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #ff4d4d;
`;

const generateUsername = (): string => {
  const adjectives = ['Quick', 'Fierce', 'Silent', 'Golden', 'Iron', 'Bold', 'Swift', 'Crafty'];
  const nouns = ['Striker', 'Keeper', 'Winger', 'Libero', 'Anchor', 'Finisher', 'Dribbler'];
  const number = Math.floor(Math.random() * 99) + 1;
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${number}`;
};

export default function ChatInput({ matchId, onNewMessage }: ChatInputProps) {
  const [author, setAuthor] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setAuthor(generateUsername());
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please write something before posting.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/chat/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content: content.trim() }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      const newMsg: Message = await res.json();
      onNewMessage(newMsg);
      setContent('');
      setAuthor(generateUsername());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InputWrapper>
      <UserLabel>Posting as <strong>{author}</strong></UserLabel>
      <TextArea
        placeholder="Say something about the match..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <ErrorText>{error}</ErrorText>}
      <BottomRow>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </BottomRow>
    </InputWrapper>
  );
}