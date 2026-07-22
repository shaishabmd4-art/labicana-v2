import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

function LimeSliceIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="29" fill="#F2FFF6" stroke="#0D1F17" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="22" fill="#B9F5CD" stroke="#22C55E" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          d="M32 32 L32 11 A21 21 0 0 1 50.2 21.5 Z"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1.4"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="4" fill="#22C55E" />
    </svg>
  );
}

function toLocalDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDateKey(key) {
  const [y, m, day] = key.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayNum = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - dayNum + 1);
  return toLocalDateKey(d);
}

function formatWeekLabel(weekKey) {
  const start = parseLocalDateKey(weekKey);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

function shiftWeek(weekKey, dir) {
  const d = parseLocalDateKey(weekKey);
  d.setDate(d.getDate() + dir * 7);
  return toLocalDateKey(d);
}

function setYear(weekKey, year) {
  const d = parseLocalDateKey(weekKey);
  d.setFullYear(year);
  return getWeekKey(d);
}

const COLORS = {
  bg: '#0D1F17',
  surface: '#153826',
  surfaceAlt: '#1B4530',
  border: '#255C3F',
  borderSoft: '#1E4A32',
  accent: '#4ADE80',
  accentDeep: '#22C55E',
  text: '#EAF7EF',
  textMuted: '#8FBFA2',
  textFaint: '#5E8C71',
  amber: '#D9B26A',
};

const EDIT_PASSWORD = 'Shaishab';

export default function App() {
  const [currentWeek, setCurrentWeek] = useState(getWeekKey(new Date()));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [swaps, setSwaps] = useState('');
  const [amount, setAmount] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [showPwPrompt, setShowPwPrompt] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'payments', currentWeek));
        setRows(snap.exists() ? snap.data().rows || [] : []);
      } catch (e) {
        console.error('Load failed', e);
        setRows([]);
      }
      setLoading(false);
    })();
  }, [currentWeek]);

  const persist = async (next) => {
    setRows(next);
    try {
      await setDoc(doc(db, 'payments', currentWeek), { rows: next });
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const addRow = () => {
    if (!name.trim()) return;
    const row = {
      id: Date.now(),
      name: name.trim(),
      swaps: Number(swaps) || 0,
      amount: amount.trim(),
      paid: false,
    };
    persist([...rows, row]);
    setName('');
    setSwaps('');
    setAmount('');
  };

  const togglePaid = (id) => {
    persist(rows.map((r) => (r.id === id ? { ...r, paid: !r.paid } : r)));
  };

  const removeRow = (id) => {
    persist(rows.filter((r) => r.id !== id));
  };

  const submitPassword = () => {
    if (pwInput === EDIT_PASSWORD) {
      setUnlocked(true);
      setShowPwPrompt(false);
      setPwInput('');
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const paidCount = rows.filter((r) => r.paid).length;
  const progressPct = rows.length ? (paidCount / rows.length) * 100 : 0;
  const totalSwaps = rows.reduce((sum, r) => sum + (Number(r.swaps) || 0), 0);
  const thisYear = new Date().getFullYear();
  const yearOptions = [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(circle at 15% 0%, ${COLORS.surfaceAlt} 0%, ${COLORS.bg} 55%)`,
      color: COLORS.text,
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '28px 16px 20px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', width: '100%', flex: 1 }}>

        <div style={{
          textAlign: 'center', fontSize: 12, color: COLORS.textMuted,
          fontWeight: 600, letterSpacing: '0.04em', marginBottom: 14,
        }}>
          © Copyright by Shaishab
        </div>

        <header style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 18px rgba(74, 222, 128, 0.28)`,
            marginBottom: 10,
          }}>
            <LimeSliceIcon size={56} />
          </div>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              background: COLORS.accentDeep,
              color: '#0D1F17',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '3px 16px',
              borderRadius: 4,
              marginBottom: -3,
              boxShadow: `0 2px 8px rgba(0,0,0,0.25)`,
            }}>
              Team
            </div>
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '-0.01em',
            lineHeight: 1.1, color: COLORS.text,
            textShadow: `0 2px 0 ${COLORS.accentDeep}55`,
          }}>
            LABICANA
          </h1>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 7, fontWeight: 500 }}>
            Weekly Payment Board
          </div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          {unlocked ? (
            <button
              onClick={() => setUnlocked(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(74,222,128,0.15)', color: '#B9F5CD',
                border: `1px solid ${COLORS.accentDeep}55`, borderRadius: 20,
                padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Unlock size={13} /> Edit mode on
            </button>
          ) : (
            <button
              onClick={() => { setShowPwPrompt(true); setPwError(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', color: COLORS.textMuted,
                border: `1px solid ${COLORS.border}`, borderRadius: 20,
                padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Lock size={13} /> View only — unlock to edit
            </button>
          )}
        </div>

        {showPwPrompt && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, zIndex: 50,
          }}>
            <div style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 22, maxWidth: 320, width: '100%',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Enter edit password</div>
              <input
                type="password"
                autoFocus
                value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
                placeholder="Password"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: 8 }}
              />
              {pwError && (
                <div style={{ fontSize: 12, color: '#F87171', marginBottom: 8 }}>
                  Wrong password, try again.
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => { setShowPwPrompt(false); setPwInput(''); setPwError(false); }}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 9, border: `1px solid ${COLORS.border}`,
                    background: 'transparent', color: COLORS.textMuted, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitPassword}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDeep})`,
                    color: '#0D1F17', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: COLORS.surface, borderRadius: 14, padding: '12px 14px', marginBottom: 18,
          border: `1px solid ${COLORS.border}`,
        }}>
          <button onClick={() => setCurrentWeek(shiftWeek(currentWeek, -1))} style={navBtnStyle}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{formatWeekLabel(currentWeek)}</div>
            <select
              value={parseLocalDateKey(currentWeek).getFullYear()}
              onChange={(e) => setCurrentWeek(setYear(currentWeek, Number(e.target.value)))}
              style={{
                marginTop: 4, background: 'transparent', color: COLORS.textMuted,
                border: `1px solid ${COLORS.border}`, borderRadius: 8,
                fontSize: 11, fontWeight: 600, padding: '2px 8px', outline: 'none',
              }}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} style={{ background: COLORS.surface, color: COLORS.text }}>
                  {y}
                </option>
              ))}
            </select>
            {!loading && rows.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{
                  height: 5, borderRadius: 3, background: COLORS.bg,
                  overflow: 'hidden', maxWidth: 180, margin: '0 auto'
                }}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${COLORS.accentDeep}, ${COLORS.accent})`,
                    borderRadius: 3, transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
                  {paidCount}/{rows.length} paid
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setCurrentWeek(shiftWeek(currentWeek, 1))} style={navBtnStyle}>
            <ChevronRight size={18} />
          </button>
        </div>

        {unlocked && (
        <div style={{
          background: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 20,
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              style={{ ...inputStyle, flex: '1 1 120px' }}
            />
            <input
              value={swaps} onChange={(e) => setSwaps(e.target.value)}
              placeholder="Swaps" type="number"
              style={{ ...inputStyle, flex: '0 1 80px' }}
            />
            <input
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="€ amount"
              style={{ ...inputStyle, flex: '0 1 100px' }}
            />
          </div>
          <button onClick={addRow} style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDeep})`,
            color: '#0D1F17', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer',
          }}>
            <Plus size={16} /> Add person
          </button>
        </div>
        )}

        {loading ? (
          <div style={{ opacity: 0.6, textAlign: 'center', padding: 40 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px', color: COLORS.textFaint,
            border: `1px dashed ${COLORS.border}`, borderRadius: 14
          }}>
            No one added for this week yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((r) => (
              <div key={r.id} style={{
                background: COLORS.surface, borderRadius: 12, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                border: `1px solid ${r.paid ? COLORS.accentDeep + '55' : COLORS.borderSoft}`,
              }}>
                <button
                  onClick={() => unlocked && togglePaid(r.id)}
                  disabled={!unlocked}
                  style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    border: `1px solid ${r.paid ? COLORS.accent : '#3A5C48'}`,
                    background: r.paid ? COLORS.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: unlocked ? 'pointer' : 'default',
                    opacity: unlocked ? 1 : 0.85,
                  }}
                >
                  {r.paid ? <Check size={15} color="#0D1F17" /> : null}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                    {r.swaps} swaps{r.amount ? ` · €${r.amount}` : ''}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  color: r.paid ? '#B9F5CD' : COLORS.amber,
                  background: r.paid ? 'rgba(74,222,128,0.15)' : 'rgba(217,178,106,0.15)',
                }}>
                  {r.paid ? 'Paid' : 'Pending'}
                </span>
                {unlocked && (
                  <button onClick={() => removeRow(r.id)}
                    style={{ background: 'none', border: 'none', color: COLORS.textFaint, cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', marginTop: 4, borderRadius: 12,
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
            }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>
                Total swaps
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>
                {totalSwaps}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '9px 10px', borderRadius: 9, border: `1px solid ${COLORS.border}`,
  background: COLORS.bg, color: COLORS.text, fontSize: 13, outline: 'none',
};

const navBtnStyle = {
  background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer',
  padding: 4, display: 'flex',
};
