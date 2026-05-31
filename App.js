import { useState, useEffect } from "react";

const MOODS = [
  { label: "开心", emoji: "😊" },
  { label: "平静", emoji: "😌" },
  { label: "焦虑", emoji: "😰" },
  { label: "低落", emoji: "😔" },
  { label: "易怒", emoji: "😤" },
  { label: "疲惫", emoji: "😩" },
];

const SYMPTOMS = [
  { label: "痛经", emoji: "🌀" },
  { label: "头痛", emoji: "🤕" },
  { label: "腰酸", emoji: "💢" },
  { label: "浮肿", emoji: "💧" },
  { label: "失眠", emoji: "🌙" },
  { label: "食欲增加", emoji: "🍫" },
];

const SKIN = [
  { label: "状态好", emoji: "✨" },
  { label: "偏油", emoji: "💦" },
  { label: "干燥", emoji: "🌵" },
  { label: "长痘", emoji: "🔴" },
  { label: "敏感", emoji: "🌸" },
  { label: "暗沉", emoji: "🌫️" },
];

const FLOW = [
  { label: "少", value: 1 },
  { label: "中", value: 2 },
  { label: "多", value: 3 },
];

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const STORAGE_KEY = "period_tracker_data_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export default function App() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [records, setRecords] = useState(loadData);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editing, setEditing] = useState(null);
  const [panel, setPanel] = useState(false);

  useEffect(() => { saveData(records); }, [records]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function openDay(day) {
    const key = dateKey(viewYear, viewMonth, day);
    setSelectedDate(key);
    setEditing(records[key] ? { ...records[key] } : {
      period: false, flow: null, moods: [], symptoms: [], skin: [], note: ""
    });
    setPanel(true);
  }

  function saveRecord() {
    if (!editing) return;
    const updated = { ...records };
    if (
      !editing.period &&
      !editing.flow &&
      editing.moods.length === 0 &&
      editing.symptoms.length === 0 &&
      editing.skin.length === 0 &&
      !editing.note
    ) {
      delete updated[selectedDate];
    } else {
      updated[selectedDate] = editing;
    }
    setRecords(updated);
    setPanel(false);
  }

  function deleteRecord() {
    const updated = { ...records };
    delete updated[selectedDate];
    setRecords(updated);
    setPanel(false);
  }

  function toggleArr(arr, val) {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isPeriodDay = (d) => {
    const r = records[dateKey(viewYear, viewMonth, d)];
    return r && r.period;
  };
  const hasRecord = (d) => !!records[dateKey(viewYear, viewMonth, d)];
  const isToday = (d) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  let periodDaysThisMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (isPeriodDay(d)) periodDaysThisMonth++;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdf4f9 0%, #f8e8f5 40%, #fce4ec 100%)",
      fontFamily: "'Noto Serif SC', 'Georgia', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px 60px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 13, letterSpacing: "0.3em", color: "#c97db5", marginBottom: 4 }}>月 · 记</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#8b3a72", letterSpacing: "0.05em" }}>经期日历</h1>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        borderRadius: 24,
        boxShadow: "0 8px 40px rgba(180,80,160,0.10)",
        width: "100%",
        maxWidth: 420,
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 14px",
          background: "linear-gradient(90deg, #e8a0d0 0%, #f4b8d8 100%)",
        }}>
          <button onClick={prevMonth} style={navBtnStyle}>‹</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#5a1a50" }}>
              {viewYear} 年 {MONTHS[viewMonth]}
            </div>
            {periodDaysThisMonth > 0 && (
              <div style={{ fontSize: 12, color: "#a04080", marginTop: 2 }}>本月经期 {periodDaysThisMonth} 天</div>
            )}
          </div>
          <button onClick={nextMonth} style={navBtnStyle}>›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "10px 12px 4px" }}>
          {WEEKDAYS.map(w => (
            <div key={w} style={{ textAlign: "center", fontSize: 12, color: "#c097b8", fontWeight: 600, padding: "2px 0" }}>{w}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 12px 16px", gap: 2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const period = isPeriodDay(d);
            const rec = hasRecord(d);
            const todayFlag = isToday(d);
            return (
              <button key={d} onClick={() => openDay(d)} style={{
                border: "none", borderRadius: 12, padding: "8px 2px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                background: period ? "linear-gradient(135deg, #f48fb1, #e91e8c22)" : todayFlag ? "#fce4ec" : "transparent",
                outline: todayFlag ? "2px solid #f48fb1" : "none",
              }}>
                <span style={{ fontSize: 15, fontWeight: period ? 700 : todayFlag ? 600 : 400, color: period ? "#b5114e" : todayFlag ? "#c2185b" : "#5a3050" }}>{d}</span>
                {rec && !period && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d4a0c0", display: "block" }} />}
                {period && <span style={{ fontSize: 9, color: "#b5114e" }}>🌸</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 12, color: "#a07090", alignItems: "center" }}>
        <span>🌸 经期</span>
        <span><span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#d4a0c0", verticalAlign:"middle", marginRight:4 }}/>有记录</span>
        <span style={{ border:"2px solid #f48fb1", borderRadius:6, padding:"1px 6px" }}>今日</span>
      </div>

      <p style={{ color: "#c097b8", fontSize: 13, marginTop: 20, textAlign:"center" }}>点击日期 · 记录今天的状态</p>

      {panel && editing && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          background: "rgba(80,20,60,0.25)", backdropFilter: "blur(4px)",
        }} onClick={e => { if (e.target === e.currentTarget) setPanel(false); }}>
          <div style={{
            background: "#fff", borderRadius: "28px 28px 0 0",
            width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto",
            padding: "28px 24px 40px",
            boxShadow: "0 -8px 40px rgba(180,80,160,0.18)",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <div>
                <div style={{ fontSize:13, color:"#c097b8" }}>记录</div>
                <div style={{ fontSize:20, fontWeight:700, color:"#8b3a72" }}>{selectedDate}</div>
              </div>
              <button onClick={() => setPanel(false)} style={{
                background:"#f8e8f5", border:"none", borderRadius:50, width:34, height:34,
                cursor:"pointer", fontSize:18, color:"#c097b8",
              }}>×</button>
            </div>

            <Section title="月经来潮">
              <ToggleBtn active={editing.period} onClick={() => setEditing(e => ({ ...e, period: !e.period }))} label="🩸 标记经期" />
              {editing.period && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:13, color:"#b070a0", marginBottom:8 }}>经量</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {FLOW.map(f => (
                      <button key={f.value} onClick={() => setEditing(e => ({ ...e, flow: f.value }))} style={{
                        padding:"6px 20px", borderRadius:20, border:"none", cursor:"pointer",
                        background: editing.flow === f.value ? "#f48fb1" : "#fce4ec",
                        color: editing.flow === f.value ? "#fff" : "#b5114e",
                        fontWeight: editing.flow === f.value ? 700 : 400, fontSize:14,
                      }}>{f.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <Section title="情绪状态">
              <ChipGroup items={MOODS} selected={editing.moods} onToggle={v => setEditing(e => ({ ...e, moods: toggleArr(e.moods, v) }))} />
            </Section>

            <Section title="身体症状">
              <ChipGroup items={SYMPTOMS} selected={editing.symptoms} onToggle={v => setEditing(e => ({ ...e, symptoms: toggleArr(e.symptoms, v) }))} />
            </Section>

            <Section title="皮肤状况">
              <ChipGroup items={SKIN} selected={editing.skin} onToggle={v => setEditing(e => ({ ...e, skin: toggleArr(e.skin, v) }))} />
            </Section>

            <Section title="备注">
              <textarea value={editing.note} onChange={e => setEditing(ed => ({ ...ed, note: e.target.value }))}
                placeholder="今天有什么想记录的..." rows={3} style={{
                  width:"100%", borderRadius:14, border:"1.5px solid #f0d0e8",
                  padding:"10px 14px", fontSize:14, color:"#6a3060", resize:"vertical",
                  fontFamily:"inherit", outline:"none", background:"#fdf4f9", boxSizing:"border-box",
                }} />
            </Section>

            <div style={{ display:"flex", gap:12, marginTop:8 }}>
              <button onClick={saveRecord} style={{
                flex:1, padding:"14px", borderRadius:18, border:"none", cursor:"pointer",
                background:"linear-gradient(90deg, #e91e8c, #f48fb1)",
                color:"#fff", fontWeight:700, fontSize:16,
              }}>保存</button>
              {records[selectedDate] && (
                <button onClick={deleteRecord} style={{
                  padding:"14px 20px", borderRadius:18, border:"none", cursor:"pointer",
                  background:"#fce4ec", color:"#c2185b", fontWeight:600, fontSize:14,
                }}>删除</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, fontWeight:600, color:"#b070a0", letterSpacing:"0.08em", marginBottom:10 }}>{title}</div>
      {children}
    </div>
  );
}

function ChipGroup({ items, selected, onToggle }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {items.map(item => {
        const active = selected.includes(item.label);
        return (
          <button key={item.label} onClick={() => onToggle(item.label)} style={{
            padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer",
            background: active ? "#f48fb1" : "#fce4ec",
            color: active ? "#fff" : "#b5114e",
            fontWeight: active ? 600 : 400, fontSize:13,
            display:"flex", alignItems:"center", gap:5,
          }}>
            <span>{item.emoji}</span><span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ToggleBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding:"8px 20px", borderRadius:20, border:"none", cursor:"pointer",
      background: active ? "linear-gradient(90deg,#e91e8c,#f48fb1)" : "#fce4ec",
      color: active ? "#fff" : "#b5114e",
      fontWeight: active ? 700 : 400, fontSize:14,
    }}>{label}</button>
  );
}

const navBtnStyle = {
  background:"rgba(255,255,255,0.4)", border:"none", borderRadius:50,
  width:36, height:36, cursor:"pointer", fontSize:22, color:"#8b3a72",
};
