import { useEffect, useMemo, useState } from 'react';
import { createEntry, createWing, deleteEntry, fetchWings, updateEntry, updateWing } from '../utils/api';
import { useEntries } from '../hooks/useEntries';
import { todayInputValue } from '../utils/date';
import { resizeImage } from '../utils/imageResize';

const PALETTE = ['#0e1726', '#eef0ee', '#6a7a92'];
const MOODS = ['happy', 'melancholic', 'excited', 'grateful', 'anxious', 'peaceful', 'nostalgic'];

const DEFAULT_ROOMS = [
  { id: 'sky', no: 'I', name: 'Sky', moods: ['happy', 'excited'], tagline: 'Bright days, momentum, and weather worth remembering.' },
  { id: 'sensory', no: 'II', name: 'Sensory', moods: ['grateful'], tagline: 'Texture, food, light, touch, and small abundance.' },
  { id: 'quiet', no: 'III', name: 'Quiet', moods: ['peaceful'], tagline: 'Stillness, pauses, ordinary balance.' },
  { id: 'thoughts', no: 'IV', name: 'Thoughts', moods: ['melancholic', 'anxious'], tagline: 'Complicated weather inside the mind.' },
  { id: 'memory', no: 'V', name: 'Memory', moods: ['nostalgic'], tagline: 'Old rooms, returning places, and soft echoes.' },
];

const MOOD_HUE = {
  happy: 82,
  melancholic: 245,
  excited: 38,
  grateful: 145,
  anxious: 282,
  peaceful: 205,
  nostalgic: 28,
};

const fonts = {
  display: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
  body: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

const roomForMood = (mood, rooms = DEFAULT_ROOMS) => rooms.find((room) => room.moods.includes(mood))?.id || rooms[0]?.id || 'quiet';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const dateInputValue = (value) => {
  if (!value) return todayInputValue();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayInputValue();
  return date.toISOString().slice(0, 10);
};

const toMuseumEntry = (entry, rooms = DEFAULT_ROOMS) => {
  const highlights = Array.isArray(entry.highlights) ? entry.highlights : [];
  return {
    id: entry._id,
    source: entry,
    title: entry.title || 'Untitled day',
    date: formatDate(entry.date),
    sortDate: new Date(entry.date || entry.createdAt || 0).getTime(),
    acquired: formatDate(entry.createdAt || entry.date),
    mood: entry.mood || 'peaceful',
    moodHue: MOOD_HUE[entry.mood] || 205,
    medium: entry.image ? 'Photograph and diary entry' : 'Diary entry',
    tags: highlights.length ? highlights : [entry.mood || 'peaceful'],
    body: entry.reflection || '',
    quote: highlights[0] || '',
    room: entry.room || roomForMood(entry.mood, rooms),
    hasPhoto: Boolean(entry.image),
    hasSketch: !entry.image,
    image: entry.image,
  };
};

export default function FloorPlanDiary({ onLogout, initialScreen = 'landing', initialEntryId = null }) {
  const { entries, stats, loading, error, reload } = useEntries();
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [screen, setScreen] = useState(initialScreen);
  const [lobbyView, setLobbyView] = useState('plan');
  const [roomId, setRoomId] = useState('sky');
  const [entryId, setEntryId] = useState(initialEntryId);
  const [hoverRoom, setHoverRoom] = useState(null);
  const [query, setQuery] = useState('');
  const [showWingEditor, setShowWingEditor] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [write, setWrite] = useState({
    title: '',
    date: todayInputValue(),
    mood: 'peaceful',
    room: 'quiet',
    highlights: '',
    reflection: '',
    image: null,
  });
  const [wingForm, setWingForm] = useState({ name: '', tagline: '' });
  const [editingWing, setEditingWing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const museumEntries = useMemo(() => entries.map((entry) => toMuseumEntry(entry, rooms)), [entries, rooms]);
  const activeEntry = museumEntries.find((e) => e.id === entryId) || museumEntries[0] || null;
  const activeRoom = rooms.find((r) => r.id === roomId) || rooms[0] || DEFAULT_ROOMS[0];
  const entriesByRoom = (id) => museumEntries.filter((e) => e.room === id);

  useEffect(() => {
    setScreen(initialScreen);
    setEntryId(initialEntryId);
  }, [initialScreen, initialEntryId]);

  useEffect(() => {
    refreshWings();
  }, []);

  const ink = PALETTE[0];
  const paper = PALETTE[1];
  const tan = PALETTE[2];
  const mute = `color-mix(in oklab, ${ink} 55%, ${paper})`;
  const hair = `color-mix(in oklab, ${ink} 20%, ${paper})`;
  const soft = `color-mix(in oklab, ${ink} 5%, ${paper})`;

  const css = `
    .fp-root, .fp-root * { box-sizing: border-box; }
    .fp-root { min-height: 100vh; font-family: ${fonts.body}; color: ${ink}; background: ${paper}; }
    .fp-disp { font-family: ${fonts.display}; font-weight: 400; letter-spacing: -0.01em; }
    .fp-mono { font-family: ${fonts.mono}; text-transform: uppercase; letter-spacing: 0.18em; font-size: 10.5px; }
    .fp-btn { cursor: pointer; border: 0; background: transparent; font-family: inherit; color: inherit; padding: 0; }
    .fp-chip { display:inline-flex; align-items:center; gap:6px; padding: 5px 11px; border-radius:4px; border:1px solid ${hair}; cursor:pointer; font-size:11.5px; transition:all .15s; background: ${paper}; }
    .fp-chip:hover { border-color: ${ink}; }
    .fp-chip.on { background: ${ink}; color: ${paper}; border-color: ${ink}; }
    .fp-input { background:transparent; border:0; border-bottom:1px solid ${hair}; outline:none; padding:8px 0; font-family:inherit; color:${ink}; width:100%; transition:border-color .2s; }
    .fp-input:focus { border-bottom-color:${ink}; }
    .fp-grid-bg {
      background-image:
        linear-gradient(${hair} 1px, transparent 1px),
        linear-gradient(90deg, ${hair} 1px, transparent 1px);
      background-size: 32px 32px;
      background-position: -1px -1px;
    }
    .fp-fade { animation: fpFade .28s ease-out; }
    @keyframes fpFade { from{opacity:0; transform: translateY(4px)} to{opacity:1; transform:none} }
    @media (max-width: 900px) {
      .fp-landing-grid, .fp-lobby-grid, .fp-room-grid, .fp-entry-grid, .fp-write-grid, .fp-curate-grid { grid-template-columns: 1fr !important; }
      .fp-topbar { flex-wrap: wrap; gap: 14px; padding: 16px 18px !important; }
      .fp-page { padding: 24px 18px !important; }
    }
  `;

  const openRoom = (id) => {
    setRoomId(id);
    setScreen('room');
  };

  const openEntry = (entry) => {
    setEntryId(entry.id);
    setRoomId(entry.room);
    setScreen('entry');
  };

  const normalizeWing = (wing) => ({
    id: wing.roomId || wing.id,
    no: wing.no,
    name: wing.name,
    moods: Array.isArray(wing.moods) ? wing.moods : [],
    tagline: wing.tagline || '',
  });

  const refreshWings = async () => {
    try {
      const data = await fetchWings();
      const nextRooms = (data.wings || []).map(normalizeWing);
      if (nextRooms.length) {
        setRooms(nextRooms);
        setWrite((prev) => ({
          ...prev,
          room: nextRooms.some((room) => room.id === prev.room) ? prev.room : roomForMood(prev.mood, nextRooms),
        }));
      }
    } catch {
      setRooms(DEFAULT_ROOMS);
    }
  };

  const mountInRoom = (room) => {
    setWrite((prev) => ({ ...prev, room: room.id, mood: room.moods[0] || prev.mood || 'peaceful' }));
  };

  const emptyWriteForm = () => ({
    title: '',
    date: todayInputValue(),
    mood: 'peaceful',
    room: roomForMood('peaceful', rooms),
    highlights: '',
    reflection: '',
    image: null,
  });

  const startNewEntry = () => {
    setEditingEntryId(null);
    setFormError('');
    setWrite(emptyWriteForm());
    setScreen('write');
  };

  const startEditEntry = (entry) => {
    if (!entry) return;
    const source = entry.source || {};
    setEditingEntryId(entry.id);
    setFormError('');
    setWrite({
      title: source.title || entry.title || '',
      date: dateInputValue(source.date),
      mood: source.mood || entry.mood || 'peaceful',
      room: source.room || entry.room || roomForMood(source.mood || entry.mood, rooms),
      highlights: Array.isArray(source.highlights) ? source.highlights.join('\n') : entry.tags.join('\n'),
      reflection: source.reflection || entry.body || '',
      image: source.image || entry.image || null,
    });
    setScreen('write');
  };

  const startEditWing = (room) => {
    setEditingWing(room);
    setWingForm({ name: room.name, tagline: room.tagline || '' });
  };

  const openWingEditor = () => {
    resetWingForm();
    setShowWingEditor(true);
  };

  const closeWingEditor = () => {
    resetWingForm();
    setShowWingEditor(false);
  };

  const resetWingForm = () => {
    setEditingWing(null);
    setWingForm({ name: '', tagline: '' });
  };

  const saveWing = async () => {
    const name = wingForm.name.trim();
    if (!name) return;
    const payload = { name, tagline: wingForm.tagline.trim() };
    if (editingWing) {
      await updateWing(editingWing.id, payload);
    } else {
      await createWing(payload);
    }
    resetWingForm();
    await refreshWings();
  };

  const handleImage = async (file) => {
    if (!file) return;
    setFormError('');
    try {
      const resized = await resizeImage(file, 1200, 900, 0.82);
      setWrite((prev) => ({ ...prev, image: resized }));
    } catch {
      setFormError('Could not process that image.');
    }
  };

  const saveEntry = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: write.title.trim(),
        date: write.date,
        mood: write.mood,
        room: write.room || roomForMood(write.mood, rooms),
        highlights: write.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
        reflection: write.reflection.trim(),
        image: write.image,
      };
      const saved = editingEntryId
        ? await updateEntry(editingEntryId, payload)
        : await createEntry(payload);
      await reload();
      setWrite(emptyWriteForm());
      setEditingEntryId(null);
      setEntryId(saved._id || editingEntryId);
      setRoomId(saved.room || roomForMood(saved.mood, rooms));
      setScreen('entry');
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeActiveEntry = async () => {
    if (!activeEntry || !window.confirm('Delete this entry?')) return;
    await deleteEntry(activeEntry.id);
    await reload();
    setScreen('lobby');
  };

  const TopBar = () => (
    <header className="fp-topbar" style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 36px', borderBottom:`1px solid ${hair}`, background: paper,
      position:'sticky', top:0, zIndex:5,
    }}>
      <button className="fp-btn" onClick={() => setScreen('lobby')} style={{display:'flex', alignItems:'center', gap: 14}}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={ink} strokeWidth="1.3">
          <rect x="2" y="2" width="16" height="16"/>
          <line x1="2" y1="10" x2="18" y2="10"/>
          <line x1="10" y1="2" x2="10" y2="18"/>
        </svg>
        <span className="fp-mono" style={{color: ink}}>Self Museum</span>
      </button>
      <nav style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
        {[
          ['lobby','Plan'],
          ['timeline','Timeline'],
          ['write','Acquire'],
          ['curate','Curate'],
          ['search','Search'],
        ].map(([key, label]) => (
          <button key={key} className="fp-btn fp-mono"
            onClick={() => key === 'write' ? startNewEntry() : setScreen(key)}
            style={{
              padding:'8px 14px', border:`1px solid ${screen===key ? ink : 'transparent'}`,
              color: screen===key ? ink : mute,
            }}>
            {label}
          </button>
        ))}
      </nav>
      <div style={{display:'flex', gap: 14, alignItems:'center'}}>
        <span className="fp-mono" style={{color: mute}}>{stats?.total ?? museumEntries.length} works</span>
        {onLogout && <button className="fp-btn fp-mono" onClick={onLogout} style={{color: mute}}>Log out</button>}
      </div>
    </header>
  );

  const Landing = () => {
    const latest = museumEntries[0];
    return (
      <div className="fp-fade fp-landing-grid" style={{
        display:'grid', gridTemplateColumns:'1.1fr 1fr', minHeight:'100vh',
      }}>
        <div style={{
          padding:'110px 80px', display:'flex', flexDirection:'column', justifyContent:'center', gap:36,
        }}>
          <div className="fp-mono" style={{color: tan}}>An invitation - personal collection</div>
          <h1 className="fp-disp" style={{fontSize: 76, lineHeight: 1.02, margin:0}}>
            A small museum<br/>
            <em style={{color: tan, fontWeight:400}}>for the days</em><br/>
            you keep.
          </h1>
          <p style={{maxWidth: 460, fontSize: 16.5, lineHeight: 1.6, color: mute, margin:0}}>
            Every entry becomes an exhibit. Group the day by mood, walk the wings, and return to what you noticed.
          </p>
          <div style={{display:'flex', gap:18, alignItems:'center', marginTop:12, flexWrap:'wrap'}}>
            <button className="fp-btn" onClick={() => setScreen('lobby')}
              style={{
                background: ink, color: paper, padding:'14px 26px',
                fontSize: 13, letterSpacing:'0.04em',
              }}>
              Enter the museum
            </button>
          </div>
        </div>
        <div style={{
          position:'relative', borderLeft:`1px solid ${hair}`,
          background: paper,
          padding:64, display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div className="fp-grid-bg" style={{
            width:'100%', maxWidth: 520, height:430, alignSelf:'center', marginTop:30,
            padding:24, background: paper, border:`1px solid ${hair}`,
          }}>
            <div className="fp-mono" style={{color: mute, marginBottom: 14}}>Static floor plan - floor 1</div>
            <Plan staticView/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24}}>
            <div>
              <div className="fp-mono" style={{color:mute, marginBottom:6}}>Latest exhibit</div>
              <div className="fp-disp" style={{fontSize: 22, fontStyle:'italic'}}>
                {latest?.title || 'No entries yet'}
              </div>
              <div className="fp-mono" style={{color:tan, marginTop:8}}>
                {latest ? `${rooms.find((r) => r.id === latest.room)?.name} - ${latest.mood} - ${latest.date}` : 'Begin with today'}
              </div>
            </div>
            <div className="fp-mono" style={{color:mute}}>{museumEntries.length} works</div>
          </div>
        </div>
      </div>
    );
  };

  const Plan = ({ staticView = false } = {}) => {
    const cols = 3;
    const rows = Math.ceil(rooms.length / cols);
    const roomW = 28;
    const roomH = 20;
    const gap = 3;
    const margin = 7;
    const W = margin * 2 + cols * roomW + (cols - 1) * gap;
    const H = margin * 2 + rows * roomH + Math.max(0, rows - 1) * gap + 9;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{width:'100%', height:'100%'}}>
        <rect x="4" y="4" width={W - 8} height={H - 12} fill="none" stroke={ink} strokeWidth="0.45"/>
        {rooms.map((room, i) => {
          const gx = i % cols;
          const gy = Math.floor(i / cols);
          const x = margin + gx * (roomW + gap);
          const y = margin + gy * (roomH + gap);
          const count = entriesByRoom(room.id).length;
          const isHover = !staticView && hoverRoom === room.id;
          return (
            <g key={room.id} transform={`translate(${x} ${y})`}
              onMouseEnter={staticView ? undefined : () => setHoverRoom(room.id)}
              onMouseLeave={staticView ? undefined : () => setHoverRoom(null)}
              onClick={staticView ? undefined : () => openRoom(room.id)}
              style={{cursor: staticView ? 'default' : 'pointer'}}>
              <rect width={roomW} height={roomH}
                fill={!staticView && isHover ? ink : paper}
                stroke={ink} strokeWidth={isHover ? 0.55 : 0.35}/>
              <line x1={roomW / 2 - 3} y1={roomH} x2={roomW / 2 + 3} y2={roomH}
                stroke={paper} strokeWidth="1.1"/>
              <text x={roomW / 2} y={roomH / 2 - 1.5} textAnchor="middle" dominantBaseline="middle"
                style={{fontFamily: fonts.display, fontSize: 3.2, fontStyle:'italic', fill: !staticView && isHover ? paper : ink, pointerEvents:'none'}}>
                {room.name}
              </text>
              <text x={roomW / 2} y={roomH / 2 + 3.2} textAnchor="middle"
                style={{fontFamily: fonts.mono, fontSize: 1.4, letterSpacing:'0.18em', fill: !staticView && isHover ? paper : mute, textTransform:'uppercase', pointerEvents:'none'}}>
                {room.no} - {count}
              </text>
            </g>
          );
        })}
        <line x1={W / 2 - 11} y1={H - 8} x2={W / 2 + 11} y2={H - 8} stroke={ink} strokeWidth="0.45" strokeDasharray="1.4 1.6"/>
        <text x={W / 2} y={H - 3} textAnchor="middle" style={{fontFamily: fonts.mono, fontSize: 1.8, letterSpacing:'0.2em', fill: mute}}>ENTRANCE</text>
      </svg>
    );
  };

  const Lobby = () => {
    const hovered = hoverRoom ? rooms.find((r) => r.id === hoverRoom) : null;
    return (
      <div className="fp-page" style={{padding:'28px 32px'}}>
        <div style={{display:'flex', justifyContent:'space-between', gap: 24, alignItems:'flex-end', marginBottom: 18, flexWrap:'wrap'}}>
          <div>
            <div className="fp-mono" style={{color: tan, marginBottom: 8}}>
              Floor plan - {rooms.length} wings - {museumEntries.length} works on view
            </div>
            <h1 className="fp-disp" style={{fontSize: 44, margin: 0, lineHeight:1.05}}>
              Where would you like to <em style={{color: tan, fontWeight:400}}>spend a few minutes?</em>
            </h1>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
            <button className={`fp-btn fp-chip ${lobbyView === 'plan' ? 'on' : ''}`}
              onClick={() => setLobbyView('plan')}>Floor plan</button>
            <button className={`fp-btn fp-chip ${lobbyView === 'collection' ? 'on' : ''}`}
              onClick={() => setLobbyView('collection')}>Collection</button>
            <button className="fp-btn" type="button" onClick={openWingEditor} style={{
              padding:'12px 18px', background: ink, color: paper, fontFamily: fonts.mono,
              textTransform:'uppercase', letterSpacing:'0.08em', fontSize: 11,
            }}>Edit Wing</button>
          </div>
        </div>

        {loading && <p className="fp-mono" style={{color: mute}}>Loading entries...</p>}
        {error && <p style={{color: ink}}>Error: {error}</p>}

        {lobbyView === 'collection' ? (
          <CatalogLobby/>
        ) : (
          <div className="fp-lobby-grid" style={{display:'grid', gridTemplateColumns:'1fr 300px', gap: 24, minHeight: 560}}>
            <div className="fp-grid-bg" style={{position:'relative', border:`1px solid ${hair}`, padding: 24, background: paper, overflow:'hidden'}}>
              <div className="fp-mono" style={{position:'absolute', top: 8, left: 12, color: mute}}>N up - 1:50</div>
              <Plan/>
            </div>
            <aside style={{border:`1px solid ${hair}`, padding: 22, display:'flex', flexDirection:'column', gap: 18}}>
              <div>
                <div className="fp-mono" style={{color: tan, marginBottom: 10}}>{hovered ? 'Highlighted wing' : 'Hover a wing'}</div>
                {hovered ? (
                  <>
                    <div className="fp-disp" style={{fontSize: 28, fontStyle:'italic'}}>{hovered.name}</div>
                    <div className="fp-mono" style={{color: mute, marginTop:8}}>Wing {hovered.no} - {entriesByRoom(hovered.id).length} works</div>
                    <p className="fp-disp" style={{fontSize: 15, lineHeight: 1.5, fontStyle:'italic', color: mute, marginTop:12}}>{hovered.tagline}</p>
                  </>
                ) : (
                  <div style={{fontSize:13, color: mute, lineHeight: 1.55}}>Hover the plan or choose a recent work. Rooms are assigned from each entry mood.</div>
                )}
              </div>
              <div style={{borderTop:`1px solid ${hair}`, paddingTop: 14}}>
                <div className="fp-mono" style={{color: mute, marginBottom: 10}}>Most recent</div>
                {museumEntries.slice(0, 4).map((entry) => (
                  <button key={entry.id} className="fp-btn" onClick={() => openEntry(entry)}
                    style={{display:'flex', gap: 10, alignItems:'center', padding:'7px 0', textAlign:'left', width:'100%'}}>
                    <div style={{width: 8, height: 28, background: `oklch(0.7 0.10 ${entry.moodHue})`}}/>
                    <div style={{minWidth:0}}>
                      <div className="fp-disp" style={{fontSize:14, fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{entry.title}</div>
                      <div className="fp-mono" style={{color: mute, marginTop:2}}>{entry.date}</div>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    );
  };

  const WingEditor = () => (
    <div style={{
      position:'fixed', inset:0, zIndex:30, display:'flex', justifyContent:'flex-end',
      background:`color-mix(in oklab, ${ink} 38%, transparent)`,
    }}>
      <button className="fp-btn" type="button" aria-label="Close wing editor" onClick={closeWingEditor}
        style={{position:'absolute', inset:0, cursor:'default'}}/>
      <aside style={{
        position:'relative', width:430, maxWidth:'100%', minHeight:'100%', overflowY:'auto',
        background: paper, borderLeft:`1px solid ${hair}`, padding:24,
        boxShadow:`-24px 0 60px color-mix(in oklab, ${ink} 18%, transparent)`,
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:22}}>
          <div>
            <div className="fp-mono" style={{color: tan, marginBottom:8}}>Mounting</div>
            <h2 className="fp-disp" style={{fontSize:34, lineHeight:1.05, margin:0}}>
              {editingWing ? `Edit wing ${editingWing.no}` : 'Edit wings'}
            </h2>
          </div>
          <button className="fp-btn fp-chip" type="button" onClick={closeWingEditor}>close</button>
        </div>

        <div style={{border:`1px solid ${hair}`, padding:16, marginBottom:18}}>
          <div className="fp-mono" style={{color: mute, marginBottom:12}}>
            {editingWing ? 'Update selected wing' : 'Add a new wing'}
          </div>
          <div style={{display:'grid', gap:10}}>
            <input className="fp-input" value={wingForm.name}
              onChange={(event) => setWingForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Wing name"/>
            <input className="fp-input" value={wingForm.tagline}
              onChange={(event) => setWingForm((prev) => ({ ...prev, tagline: event.target.value }))}
              placeholder="Short description"/>
            <div style={{display:'flex', gap:8, marginTop:4}}>
              <button className="fp-btn" type="button" onClick={saveWing}
                style={{
                  flex:1, padding:'11px 12px', background: ink, color: paper,
                  fontFamily: fonts.mono, textTransform:'uppercase', letterSpacing:'0.08em', fontSize:10.5,
                }}>
                {editingWing ? 'Save wing' : 'Add wing'}
              </button>
              {editingWing && (
                <button className="fp-btn fp-chip" type="button" onClick={resetWingForm}>cancel</button>
              )}
            </div>
          </div>
        </div>

        <div className="fp-mono" style={{color: tan, marginBottom:10}}>Existing wings</div>
        <div style={{display:'grid', gap:1, background: hair, border:`1px solid ${hair}`}}>
          {rooms.map((room) => (
            <button key={room.id} className="fp-btn" type="button" onClick={() => startEditWing(room)}
              style={{
                display:'grid', gridTemplateColumns:'36px 1fr auto', gap:10, alignItems:'center',
                padding:'12px 12px', background:paper, textAlign:'left',
              }}>
              <span className="fp-disp" style={{fontSize:18, color:tan, fontStyle:'italic'}}>{room.no}</span>
              <span>
                <span className="fp-disp" style={{display:'block', fontSize:17, fontStyle:'italic'}}>{room.name}</span>
                <span style={{display:'block', color:mute, fontSize:12, lineHeight:1.35, marginTop:3}}>{room.tagline}</span>
              </span>
              <span className="fp-mono" style={{color:mute}}>edit</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );

  const CatalogLobby = () => (
    <div style={{display:'grid', gap:1, background: hair, border:`1px solid ${hair}`}}>
      {rooms.map((room) => {
        const list = entriesByRoom(room.id);
        return (
          <button key={room.id} className="fp-btn" onClick={() => openRoom(room.id)}
            style={{
              display:'grid',
              gridTemplateColumns:'72px minmax(140px, 1.2fr) minmax(160px, 1fr) 210px 28px',
              alignItems:'center', gap:26, padding:'24px 26px', background:paper, textAlign:'left',
            }}
            onMouseEnter={(event) => event.currentTarget.style.background = soft}
            onMouseLeave={(event) => event.currentTarget.style.background = paper}
          >
            <div className="fp-disp" style={{fontSize:34, color:tan, fontStyle:'italic'}}>{room.no}</div>
            <div>
              <div className="fp-disp" style={{fontSize:28, marginBottom:4}}>{room.name}</div>
              <div className="fp-mono" style={{color:mute}}>{list.length} {list.length === 1 ? 'work' : 'works'} - est. 2026</div>
            </div>
            <div style={{fontSize:14, lineHeight:1.45, color:mute, fontStyle:'italic'}}>{room.tagline}</div>
            <div style={{display:'flex', gap:8, minHeight:72, alignItems:'center'}}>
              {list.slice(0, 3).map((entry) => (
                <div key={entry.id}
                  style={{
                    width:54, height:70, boxShadow:`0 0 0 1px ${hair}`,
                    background: entry.image
                      ? `center / cover url("${entry.image}")`
                      : `linear-gradient(150deg, color-mix(in oklab, oklch(0.7 0.08 ${entry.moodHue}) 45%, ${paper}), ${paper})`,
                  }}/>
              ))}
              {list.length === 0 && <span className="fp-mono" style={{color:mute}}>empty</span>}
            </div>
            <div className="fp-disp" style={{fontSize:22, color:mute}}>▸</div>
          </button>
        );
      })}
    </div>
  );

  const Room = () => {
    const list = entriesByRoom(activeRoom.id);
    return (
      <div className="fp-fade" style={{minHeight:'calc(100vh - 57px)', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'24px 36px 20px', borderBottom:`1px solid ${hair}`, display:'grid', gridTemplateColumns:'auto 1fr', gap: 28, alignItems:'center'}}>
          <button className="fp-btn fp-mono" onClick={() => setScreen('lobby')} style={{color:mute}}>Back to floor plan</button>
          <div>
            <div className="fp-mono" style={{color: tan}}>Wing {activeRoom.no} - {list.length} works on view</div>
            <h1 className="fp-disp" style={{fontSize: 38, margin:0}}>{activeRoom.name}</h1>
          </div>
        </div>
        <div style={{flex: 1, position:'relative', overflowX:'auto', background:`linear-gradient(180deg, ${paper} 0 55%, ${soft} 55% 100%)`}}>
          <div style={{position:'absolute', left:0, right:0, top: '55%', borderTop: `1px solid ${hair}`}}/>
          <div style={{display:'flex', gap: 42, padding: '56px 64px 64px', minHeight:'100%', alignItems:'flex-start'}}>
            {list.map((entry, i) => (
              <button key={entry.id} className="fp-btn" onClick={() => openEntry(entry)}
                style={{textAlign:'left', flex:'0 0 auto', position:'relative', paddingTop: 42}}>
                <div style={{position:'absolute', left:'50%', top:0, transform:'translateX(-50%)', width:30, height:8, background: tan, borderRadius:'2px 2px 6px 6px'}}/>
                <div style={{width: i % 3 === 1 ? 200 : 240, height: i % 3 === 1 ? 280 : 320, padding: 14, background: paper, boxShadow:`0 0 0 1px ${hair}`}}>
                  {entry.image ? (
                    <img src={entry.image} alt={entry.title} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : (
                    <div style={{width:'100%', height:'100%', background:`linear-gradient(160deg, color-mix(in oklab, oklch(0.68 0.10 ${entry.moodHue}) 50%, ${paper}), ${paper})`}}/>
                  )}
                </div>
                <div style={{marginTop: 28, padding:'10px 12px', background: paper, border:`1px solid ${hair}`, width: i % 3 === 1 ? 200 : 240}}>
                  <div className="fp-mono" style={{color: tan, marginBottom:4}}>{activeRoom.name} - {String(i+1).padStart(2,'0')}</div>
                  <div className="fp-disp" style={{fontSize:16, fontStyle:'italic', lineHeight:1.2}}>{entry.title}</div>
                  <div className="fp-mono" style={{color: mute, marginTop:4}}>{entry.date}</div>
                </div>
              </button>
            ))}
            {list.length === 0 && (
              <div style={{alignSelf:'center', color: mute}}>
                <div className="fp-disp" style={{fontSize:22, fontStyle:'italic'}}>This wing is empty.</div>
                <button className="fp-btn fp-chip" onClick={startNewEntry} style={{marginTop:12}}>Acquire first work</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Entry = () => {
    if (!activeEntry) return null;
    const room = rooms.find((r) => r.id === activeEntry.room) || rooms[0];
    return (
      <div className="fp-fade fp-page" style={{padding:'40px 64px 64px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 28, gap: 18}}>
          <button className="fp-btn fp-mono" style={{color:mute}} onClick={() => setScreen('room')}>Back to Wing {room.no} - {room.name}</button>
          <div style={{display:'flex', gap:12}}>
            <button className="fp-btn fp-chip" onClick={() => startEditEntry(activeEntry)}>Edit</button>
            <button className="fp-btn fp-chip" onClick={removeActiveEntry}>Delete</button>
          </div>
        </div>
        <div className="fp-entry-grid" style={{display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 64, alignItems:'start'}}>
          <div>
            <div style={{padding:22, background: paper, boxShadow:`0 0 0 1px ${hair}, 0 18px 40px -28px color-mix(in oklab, ${ink} 55%, transparent)`}}>
              {activeEntry.image ? (
                <img src={activeEntry.image} alt={activeEntry.title} style={{width:'100%', aspectRatio:'4 / 5', objectFit:'cover'}}/>
              ) : (
                <div style={{width:'100%', aspectRatio:'4 / 5', background:`linear-gradient(160deg, color-mix(in oklab, oklch(0.68 0.10 ${activeEntry.moodHue}) 50%, ${paper}), color-mix(in oklab, oklch(0.78 0.05 ${activeEntry.moodHue}) 30%, ${paper}))`}}/>
              )}
            </div>
            <div className="fp-mono" style={{color: mute, marginTop: 14, textAlign:'center'}}>{activeEntry.medium}</div>
          </div>
          <div style={{paddingTop:14}}>
            <div className="fp-mono" style={{color: tan, marginBottom:14}}>{activeEntry.acquired} - {room.name}</div>
            <h1 className="fp-disp" style={{fontSize:56, lineHeight:1.05, margin:0, fontStyle:'italic'}}>{activeEntry.title}</h1>
            <table style={{borderCollapse:'collapse', marginTop:32, fontSize:13, color: mute, width:'100%'}}>
              <tbody>
                {[
                  ['Date acquired', activeEntry.date],
                  ['Medium', activeEntry.medium],
                  ['Mood', activeEntry.mood],
                  ['On view in', `Wing ${room.no} - ${room.name}`],
                  ['Tags', activeEntry.tags.join(' - ')],
                ].map(([key, value]) => (
                  <tr key={key} style={{borderTop:`1px solid ${hair}`}}>
                    <td className="fp-mono" style={{padding:'12px 0', width:140, color: mute}}>{key}</td>
                    <td style={{padding:'12px 0', color: ink}}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:32, paddingTop:24, borderTop:`1px solid ${hair}`}}>
              <div className="fp-mono" style={{color: tan, marginBottom:16}}>Curatorial note</div>
              <p className="fp-disp" style={{fontSize:20, lineHeight:1.55, fontStyle:'italic', margin:0}}>{activeEntry.body || 'No reflection written yet.'}</p>
            </div>
            {activeEntry.quote && (
              <div style={{marginTop:28, paddingLeft:16, borderLeft:`2px solid ${tan}`}}>
                <div className="fp-mono" style={{color: tan, marginBottom:6}}>Highlight</div>
                <div className="fp-disp" style={{fontSize:16, lineHeight:1.5, fontStyle:'italic', color: mute}}>{activeEntry.quote}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Write = () => (
    <form className="fp-fade fp-write-grid" onSubmit={saveEntry} style={{display:'grid', gridTemplateColumns:'1fr 320px', minHeight:'calc(100vh - 57px)'}}>
      <div style={{padding:'40px 56px', background: paper}}>
        <div className="fp-mono" style={{color: tan, marginBottom:14}}>
          {editingEntryId ? 'Edit - existing work' : 'Acquire - new work'}
        </div>
        <input className="fp-input fp-disp" value={write.title} onChange={(e) => setWrite({...write, title:e.target.value})}
          placeholder="A working title for today's piece" required maxLength={200}
          style={{fontSize:40, fontStyle:'italic', paddingBottom:16}}/>
        <div className="fp-mono" style={{color: mute, marginTop:28, marginBottom:10}}>The piece itself</div>
        <textarea value={write.reflection} onChange={(e) => setWrite({...write, reflection:e.target.value})}
          placeholder="Start anywhere. The first sentence does not have to be a good one."
          maxLength={5000}
          style={{width:'100%', minHeight:300, resize:'vertical', border:`1px solid ${hair}`, background: paper, outline:'none', fontFamily:fonts.display, fontSize:20, lineHeight:1.55, fontStyle:'italic', padding:22, color: ink}}/>
        {formError && <p style={{marginTop:12, color: ink}}>{formError}</p>}
      </div>
      <aside style={{borderLeft:`1px solid ${hair}`, padding:'32px 24px', background: paper}}>
        <div className="fp-mono" style={{color: tan, marginBottom:16}}>Mounting</div>
        <div style={{display:'grid', gap:8, marginBottom:20}}>
          {rooms.map((room) => {
            const selected = room.id === write.room;
            return (
              <button key={room.id} type="button" className="fp-btn"
                onClick={() => mountInRoom(room)}
                style={{
                  display:'grid', gridTemplateColumns:'34px 1fr auto', gap:10, alignItems:'center',
                  padding:'11px 12px', border:`1px solid ${selected ? ink : hair}`,
                  background: selected ? soft : paper, textAlign:'left',
                }}>
                <span className="fp-disp" style={{fontSize:19, color: tan, fontStyle:'italic'}}>{room.no}</span>
                <span>
                  <span className="fp-disp" style={{fontSize:16, fontStyle:'italic'}}>{room.name}</span>
                  <span className="fp-mono" style={{display:'block', color: mute, marginTop:2}}>
                    {room.moods.join(' / ')}
                  </span>
                </span>
                <span className="fp-mono" style={{color: selected ? ink : mute}}>{selected ? 'here' : 'mount'}</span>
              </button>
            );
          })}
        </div>
        <div style={{borderTop:`1px solid ${hair}`, paddingTop:18, display:'grid', gap:16, marginBottom:20}}>
          <label>
            <div className="fp-mono" style={{color: mute, marginBottom:8}}>Date</div>
            <input className="fp-input" type="date" value={write.date} onChange={(e) => setWrite({...write, date:e.target.value})} required/>
          </label>
          <label>
            <div className="fp-mono" style={{color: mute, marginBottom:8}}>Mood</div>
            <select className="fp-input" value={write.mood} onChange={(e) => setWrite({...write, mood:e.target.value})}>
              {MOODS.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
            </select>
          </label>
          <label>
            <div className="fp-mono" style={{color: mute, marginBottom:8}}>Highlights - one per line</div>
            <textarea className="fp-input" value={write.highlights} onChange={(e) => setWrite({...write, highlights:e.target.value})}
              rows={4} placeholder={'Morning coffee\nFinished that book\nUnexpected call'}/>
          </label>
        </div>
        <label className="fp-btn fp-chip" style={{justifyContent:'center', width:'100%', marginBottom:12}}>
          {write.image ? 'Replace photo' : 'Add photo'}
          <input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => handleImage(e.target.files?.[0])}/>
        </label>
        {write.image && <img src={write.image} alt="Preview" style={{width:'100%', aspectRatio:'4 / 5', objectFit:'cover', border:`1px solid ${hair}`, marginBottom:12}}/>}
        {write.image && (
          <button className="fp-btn fp-chip" type="button" onClick={() => setWrite((prev) => ({ ...prev, image: null }))}
            style={{justifyContent:'center', width:'100%', marginBottom:12}}>
            Remove photo
          </button>
        )}
        <button className="fp-btn" disabled={saving} style={{padding:'12px 22px', background: ink, color: paper, fontFamily: fonts.mono, textTransform:'uppercase', letterSpacing:'0.1em', fontSize:11, width:'100%'}}>
          {saving ? 'Saving...' : editingEntryId ? 'Save changes' : 'Mount on wall'}
        </button>
      </aside>
    </form>
  );

  const Curate = () => {
    const [picked, setPicked] = useState(museumEntries[0]?.id || null);
    const [movingRoom, setMovingRoom] = useState('');
    const [curateError, setCurateError] = useState('');
    const pickedEntry = museumEntries.find((entry) => entry.id === picked) || museumEntries[0];

    const moveEntryToRoom = async (room) => {
      if (!pickedEntry || pickedEntry.room === room.id || movingRoom) return;
      setMovingRoom(room.id);
      setCurateError('');
      try {
        await updateEntry(pickedEntry.id, { room: room.id });
        await reload();
        setPicked(pickedEntry.id);
      } catch (err) {
        setCurateError(err.response?.data?.message || err.message || 'Could not move this entry.');
      } finally {
        setMovingRoom('');
      }
    };

    if (!pickedEntry) {
      return (
        <div className="fp-page" style={{padding:'40px 64px 64px'}}>
          <div className="fp-mono" style={{color: tan, marginBottom:14}}>Curate - move works between wings</div>
          <div style={{border:`1px solid ${hair}`, padding:28, maxWidth:460}}>
            <div className="fp-disp" style={{fontSize:24, fontStyle:'italic'}}>No works to re-hang yet.</div>
            <button className="fp-btn fp-chip" onClick={startNewEntry} style={{marginTop:14}}>Acquire first work</button>
          </div>
        </div>
      );
    }

    return (
      <div className="fp-fade fp-page" style={{padding:'40px 64px 64px'}}>
        <div className="fp-mono" style={{color: tan, marginBottom:14}}>Curate - move works between wings, open new wings</div>
        <h1 className="fp-disp" style={{fontSize:54, lineHeight:1, margin:'0 0 36px'}}>Re-hang the <em style={{color: tan, fontWeight:400}}>collection.</em></h1>
        <div className="fp-curate-grid" style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:56}}>
          <div>
            <div className="fp-mono" style={{color: mute, marginBottom:12}}>Pick a work</div>
            <div style={{display:'grid', gap:1, background: hair, border:`1px solid ${hair}`}}>
              {museumEntries.map((entry) => (
                <button key={entry.id} className="fp-btn" onClick={() => setPicked(entry.id)}
                  style={{display:'grid', gridTemplateColumns:'40px 1fr auto', gap:12, alignItems:'center', padding:'12px 14px', background:picked===entry.id ? soft : paper, textAlign:'left'}}>
                  <div style={{
                    width:36, height:46,
                    background: entry.image
                      ? `center / cover url("${entry.image}")`
                      : `linear-gradient(160deg, color-mix(in oklab, oklch(0.7 0.10 ${entry.moodHue}) 50%, ${paper}), ${paper})`,
                    boxShadow:`0 0 0 1px ${hair}`,
                  }}/>
                  <div>
                    <div className="fp-disp" style={{fontSize:15, fontStyle:'italic'}}>{entry.title}</div>
                    <div className="fp-mono" style={{color: mute, marginTop:2}}>{entry.date} - {entry.mood}</div>
                  </div>
                  <div className="fp-mono" style={{color: tan}}>{rooms.find((r) => r.id === entry.room)?.no}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="fp-mono" style={{color: mute, marginBottom:12}}>Move to wing</div>
            {pickedEntry && (
              <div style={{border:`1px solid ${hair}`, padding:24, marginBottom:14, background:soft}}>
                <div className="fp-mono" style={{color:tan, marginBottom:8}}>Currently displaying:</div>
                <div className="fp-disp" style={{fontSize:22, fontStyle:'italic', marginBottom:4}}>{pickedEntry.title}</div>
                <div className="fp-mono" style={{color: mute}}>Hangs in: Wing {rooms.find((r) => r.id === pickedEntry.room)?.no} - {rooms.find((r) => r.id === pickedEntry.room)?.name}</div>
              </div>
            )}
            {curateError && <p style={{color: ink, margin:'0 0 14px'}}>{curateError}</p>}
            <div style={{display:'grid', gap:8}}>
              {rooms.map((room) => (
                <button key={room.id} className="fp-btn" type="button" disabled={Boolean(movingRoom)}
                  onClick={() => moveEntryToRoom(room)}
                  style={{display:'grid', gridTemplateColumns:'56px 1fr auto', gap:18, alignItems:'center', padding:'16px 18px', border:`1px solid ${pickedEntry?.room===room.id ? ink : hair}`, background:pickedEntry?.room===room.id ? soft : paper, textAlign:'left'}}>
                  <div className="fp-disp" style={{fontSize:26, color: tan, fontStyle:'italic'}}>{room.no}</div>
                  <div>
                    <div className="fp-disp" style={{fontSize:18}}>{room.name}</div>
                    <div className="fp-mono" style={{color: mute, marginTop:2}}>{room.tagline}</div>
                  </div>
                  <div className="fp-mono" style={{color: pickedEntry?.room===room.id ? ink : mute}}>
                    {movingRoom === room.id ? 'moving' : pickedEntry?.room===room.id ? 'here' : 'move'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Timeline = () => {
    const ordered = [...museumEntries].sort((a, b) => a.sortDate - b.sortDate);
    return (
      <div className="fp-page" style={{padding:'42px 52px 64px', minHeight:'calc(100vh - 57px)', overflowX:'auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24, marginBottom:44, flexWrap:'wrap'}}>
          <div>
            <div className="fp-mono" style={{color: tan, marginBottom:12}}>Timeline - all entries</div>
            <h1 className="fp-disp" style={{fontSize:54, lineHeight:1, margin:0}}>
              The days in <em style={{color: tan, fontWeight:400}}>sequence.</em>
            </h1>
          </div>
          <div className="fp-mono" style={{color: mute}}>{ordered.length} {ordered.length === 1 ? 'entry' : 'entries'}</div>
        </div>

        {ordered.length === 0 ? (
          <div style={{border:`1px solid ${hair}`, padding:28, maxWidth:460}}>
            <div className="fp-disp" style={{fontSize:24, fontStyle:'italic'}}>No entries yet.</div>
            <button className="fp-btn fp-chip" onClick={startNewEntry} style={{marginTop:14}}>Acquire first work</button>
          </div>
        ) : (
          <div style={{position:'relative', minWidth: Math.max(820, ordered.length * 230), padding:'36px 10px 46px'}}>
            <div style={{position:'absolute', left:0, right:0, top:'50%', borderTop:`1px solid ${ink}`}}/>
            <div style={{display:'grid', gridTemplateColumns:`repeat(${ordered.length}, minmax(180px, 1fr))`, gap:28, alignItems:'center'}}>
              {ordered.map((entry, index) => {
                const room = rooms.find((item) => item.id === entry.room);
                const imageBlock = (
                  <div style={{
                    width:'100%', aspectRatio:'4 / 5', padding:10, background: paper,
                    border:`1px solid ${hair}`, boxShadow:`0 16px 34px -28px color-mix(in oklab, ${ink} 60%, transparent)`,
                  }}>
                    {entry.image ? (
                      <img src={entry.image} alt={entry.title} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    ) : (
                      <div style={{width:'100%', height:'100%', background:`linear-gradient(160deg, color-mix(in oklab, oklch(0.68 0.08 ${entry.moodHue}) 45%, ${paper}), ${paper})`}}/>
                    )}
                  </div>
                );
                const labelBlock = (
                  <div style={{border:`1px solid ${hair}`, background: paper, padding:'12px 12px 14px'}}>
                    <div className="fp-mono" style={{color: tan, marginBottom:6}}>{entry.date}</div>
                    <div className="fp-disp" style={{fontSize:18, lineHeight:1.15, fontStyle:'italic'}}>{entry.title}</div>
                    <div className="fp-mono" style={{color: mute, marginTop:8}}>
                      Wing {room?.no || '-'} - {entry.mood}
                    </div>
                  </div>
                );
                return (
                  <button key={entry.id} className="fp-btn" type="button" onClick={() => openEntry(entry)}
                    style={{
                      display:'grid', gridTemplateRows:'1fr 42px 1fr', gap:0, textAlign:'left',
                      minHeight:520, position:'relative',
                    }}>
                    <div style={{alignSelf:'end'}}>{index % 2 === 0 ? imageBlock : labelBlock}</div>
                    <div style={{position:'relative', display:'grid', placeItems:'center'}}>
                      <div style={{width:11, height:11, borderRadius:'50%', background: paper, border:`1px solid ${ink}`, zIndex:1}}/>
                      <div style={{position:'absolute', top:0, bottom:0, left:'50%', borderLeft:`1px solid ${hair}`}}/>
                    </div>
                    <div style={{alignSelf:'start'}}>{index % 2 === 0 ? labelBlock : imageBlock}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const Search = () => {
    const [filter, setFilter] = useState('all moods');
    const q = query.toLowerCase().trim();
    const results = museumEntries.filter((entry) => {
      if (filter !== 'all moods' && entry.mood !== filter) return false;
      if (q && !(`${entry.title} ${entry.body} ${entry.tags.join(' ')}`.toLowerCase().includes(q))) return false;
      return true;
    });
    return (
      <div className="fp-page" style={{padding:'56px 64px 64px'}}>
        <div className="fp-mono" style={{color: tan, marginBottom:14}}>Catalogue search</div>
        <h1 className="fp-disp" style={{fontSize:56, margin:'0 0 28px'}}>What are you <em style={{color: tan, fontWeight:400}}>looking for?</em></h1>
        <input className="fp-input fp-disp" autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="a feeling, a word, a colour..." style={{fontSize:32, fontStyle:'italic', borderBottom:`1px solid ${ink}`, paddingBottom:14}}/>
        <div style={{display:'flex', gap:8, marginTop:24, alignItems:'center', flexWrap:'wrap'}}>
          <span className="fp-mono" style={{color: mute, marginRight:6}}>filter</span>
          {['all moods', ...MOODS].map((mood) => (
            <button key={mood} className={`fp-btn fp-chip ${filter===mood ? 'on' : ''}`} onClick={() => setFilter(mood)}>{mood}</button>
          ))}
        </div>
        <div className="fp-mono" style={{color: mute, marginTop:32, marginBottom:12}}>{results.length} {results.length===1 ? 'work' : 'works'} found</div>
        <div style={{display:'grid', gap:1, background: hair, border:`1px solid ${hair}`}}>
          {results.map((entry) => (
            <button key={entry.id} className="fp-btn" onClick={() => openEntry(entry)}
              style={{display:'grid', gridTemplateColumns:'70px 1.4fr 1fr auto', gap:24, alignItems:'center', padding:'18px 16px', background:paper, textAlign:'left'}}
              onMouseEnter={(event) => event.currentTarget.style.background = soft}
              onMouseLeave={(event) => event.currentTarget.style.background = paper}>
              <div style={{width:54, height:68, background:`linear-gradient(160deg, color-mix(in oklab, oklch(0.7 0.10 ${entry.moodHue}) 50%, ${paper}), ${paper})`, boxShadow:`0 0 0 1px ${hair}`}}/>
              <div>
                <div className="fp-disp" style={{fontSize:20, fontStyle:'italic'}}>{entry.title}</div>
                <div className="fp-mono" style={{color: mute, marginTop:4}}>{entry.date} - {rooms.find((r) => r.id === entry.room)?.name}</div>
              </div>
              <div style={{fontSize:13, color: mute, lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>{entry.body}</div>
              <div className="fp-mono" style={{color: tan}}>{entry.mood}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fp-root">
      <style>{css}</style>
      {screen !== 'landing' && <TopBar/>}
      {screen === 'landing' && <Landing/>}
      {screen === 'lobby' && <Lobby/>}
      {screen === 'timeline' && <Timeline/>}
      {screen === 'room' && <Room/>}
      {screen === 'entry' && <Entry/>}
      {screen === 'write' && Write()}
      {screen === 'curate' && <Curate/>}
      {screen === 'search' && <Search/>}
      {showWingEditor && WingEditor()}
    </div>
  );
}
