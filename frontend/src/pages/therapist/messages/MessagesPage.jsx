import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { getAssignedPatients, getMessages, sendTherapistMessage } from '@/services/adminService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { formatTime } from '@/utils/formatters.js';

export default function MessagesPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null); // patient object
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getAssignedPatients(user.userId)
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoadingPatients(false));
  }, [user.userId]);

  useEffect(() => {
    if (!selected) return;
    setLoadingMessages(true);
    getMessages(selected.userId)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoadingMessages(false));
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await sendTherapistMessage({ userId: selected.userId, text, fromTherapist: true });
      setMessages((prev) => [...prev, msg]);
    } catch {
      // restore input on failure
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-body" style={{ padding: 0, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 'var(--sp-5) var(--sp-6)', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>Messages</h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: 2 }}>Communicate securely with your patients.</p>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Patient list */}
        <div style={{ width: 280, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
            <input type="text" className="form-input" placeholder="Search patients…" style={{ fontSize: 'var(--text-sm)' }} readOnly />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {loadingPatients ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>
            ) : patients.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No patients assigned.</div>
            ) : (
              patients.map((p) => (
                <button
                  key={p.userId}
                  onClick={() => setSelected(p)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: selected?.userId === p.userId ? 'var(--primary-soft)' : 'transparent',
                    textAlign: 'left', marginBottom: 2,
                  }}
                >
                  <Avatar name={p.name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon="fa-comment-dots" title="Select a patient" description="Choose a patient from the list to start messaging." />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={selected.name} size="sm" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{selected.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{selected.email}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', padding: 40 }}><PageSpinner /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 'var(--text-sm)', padding: 40 }}>
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isTherapist = m.fromTherapist;
                    return (
                      <div key={m.msgId} style={{ display: 'flex', justifyContent: isTherapist ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '70%', padding: '10px 14px',
                          borderRadius: isTherapist ? '16px 16px 0 16px' : '16px 16px 16px 0',
                          background: isTherapist ? 'var(--primary)' : 'var(--surface)',
                          color: isTherapist ? '#fff' : 'var(--text)',
                          border: isTherapist ? 'none' : '1px solid var(--border)',
                          fontSize: 'var(--text-sm)', lineHeight: 1.5,
                        }}>
                          <p style={{ margin: 0 }}>{m.text}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 10, opacity: 0.7, textAlign: 'right' }}>
                            {formatTime(m.dateTime)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {sending && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ padding: '10px 14px', borderRadius: '16px 16px 0 16px', background: 'var(--primary)', opacity: 0.6 }}>
                      <div className="typing-indicator"><span></span><span></span><span></span></div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                  style={{ flex: 1, borderRadius: 999 }}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 42, height: 42, padding: 0, borderRadius: '50%', flexShrink: 0 }}
                  disabled={!input.trim() || sending}
                  aria-label="Send message"
                >
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
