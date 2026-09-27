import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { sendMessage, getChatHistory } from '@/services/chatService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import Spinner from '@/components/ui/Spinner.jsx';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const h = await getChatHistory(user.userId);
        const flattened = [];
        h.forEach(turn => {
          flattened.push({ id: turn.chatId + '-u', sender: 'user', text: turn.message, timestamp: turn.dateTime });
          if (turn.reply) {
            flattened.push({ id: turn.chatId + '-b', sender: 'bot', text: turn.reply, timestamp: turn.dateTime });
          }
        });
        setMessages(flattened);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');
    const newMsg = { id: Date.now().toString() + '-u', sender: 'user', text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);
    setSending(true);

    try {
      const reply = await sendMessage({ userId: user.userId, message: text });
      const replyMsg = { id: reply.chatId + '-b', sender: 'bot', text: reply.reply, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.error(err);
      // In a real app we might show an error inline
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Chat Header */}
      <header style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          <i className="fa-solid fa-robot" />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--text-base)', margin: 0 }}>Mind Mate AI</h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--success)' }}>Online · Ready to listen</p>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}><Spinner /></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p>Hi {user.name.split(' ')[0]}, I'm your AI companion.</p>
            <p>How are you feeling today?</p>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {!isUser && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                    <i className="fa-solid fa-robot" />
                  </div>
                )}
                <div style={{
                  background: isUser ? 'var(--primary)' : 'var(--surface)',
                  color: isUser ? '#fff' : 'inherit',
                  padding: '10px 14px',
                  borderRadius: isUser ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.5,
                  border: isUser ? 'none' : '1px solid var(--border)'
                }}>
                  {m.text}
                </div>
                {isUser && <Avatar name={user.name} size="sm" />}
              </div>
            );
          })
        )}
        {sending && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
              <i className="fa-solid fa-robot" />
            </div>
            <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', border: '1px solid var(--border)' }}>
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, borderRadius: 999, padding: '10px 20px' }}
            disabled={loading || sending}
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', flexShrink: 0 }}
            disabled={!input.trim() || sending || loading}
            aria-label="Send message"
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </form>
      </div>
    </div>
  );
}
