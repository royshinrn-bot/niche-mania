import { useState, useEffect, useRef, useCallback } from "react";

// ── Pantone palette ───────────────────────────────────────────────
// Idle page: extremely pale, max readability
const PANTONE_IDLE = {
  name: "Blanc de Blanc", bg: "#F9F6F0", text: "#1C0A00", sub: "#6B3A1F", accent: "#A0521C",
};

// Vivid Pantone Color of the Year / iconic colors — rotate on each result
// ideaBubble / inverseBubble: distinct card backgrounds for IDEA vs INVERSE
const PANTONE_VIVID = [
  { name: "Fiesta",          bg: "#DD4132", text: "#FFF8F0", sub: "#FFD4C2", accent: "#FFE8D6",
    ideaBubble:    { bg: "#1A0800", border: "#FF9966", label: "#FF9966" },
    inverseBubble: { bg: "#0A0020", border: "#FFDD66", label: "#FFDD66" } },

  { name: "Ultra Violet",    bg: "#5F4B8B", text: "#F5F0FF", sub: "#D4C6F5", accent: "#E8DEFF",
    ideaBubble:    { bg: "#120820", border: "#C8AAFF", label: "#C8AAFF" },
    inverseBubble: { bg: "#001A10", border: "#88FFCC", label: "#88FFCC" } },

  { name: "Classic Blue",    bg: "#0F4C81", text: "#EEF4FF", sub: "#B8D0F0", accent: "#D0E4FF",
    ideaBubble:    { bg: "#000D1A", border: "#66CCFF", label: "#66CCFF" },
    inverseBubble: { bg: "#1A0A00", border: "#FFB366", label: "#FFB366" } },

  { name: "Greenery",        bg: "#5E7B3A", text: "#F4FBE8", sub: "#C8E69A", accent: "#DDFAB0",
    ideaBubble:    { bg: "#0A1400", border: "#AAEE44", label: "#AAEE44" },
    inverseBubble: { bg: "#180018", border: "#FF88CC", label: "#FF88CC" } },

  { name: "Living Coral",    bg: "#FF6B6B", text: "#FFF5F0", sub: "#FFD8CC", accent: "#FFE8E0",
    ideaBubble:    { bg: "#1A0400", border: "#FF8844", label: "#FF8844" },
    inverseBubble: { bg: "#001020", border: "#44CCFF", label: "#44CCFF" } },

  { name: "Pink Yarrow",     bg: "#CE3175", text: "#FFF0F6", sub: "#FFC4DA", accent: "#FFD8E8",
    ideaBubble:    { bg: "#160010", border: "#FF66BB", label: "#FF66BB" },
    inverseBubble: { bg: "#001818", border: "#44FFEE", label: "#44FFEE" } },

  { name: "Flame",           bg: "#F2552C", text: "#FFF8F0", sub: "#FFD0B8", accent: "#FFE4D0",
    ideaBubble:    { bg: "#1A0600", border: "#FF7744", label: "#FF7744" },
    inverseBubble: { bg: "#00101A", border: "#44DDFF", label: "#44DDFF" } },

  { name: "Emerald",         bg: "#009473", text: "#EDFFF8", sub: "#A0EDD4", accent: "#C4FFE8",
    ideaBubble:    { bg: "#001510", border: "#44FFCC", label: "#44FFCC" },
    inverseBubble: { bg: "#100018", border: "#BB88FF", label: "#BB88FF" } },

  { name: "Radiant Orchid",  bg: "#B163A3", text: "#FFF0FC", sub: "#F0C4EC", accent: "#F8D8F4",
    ideaBubble:    { bg: "#150010", border: "#EE88DD", label: "#EE88DD" },
    inverseBubble: { bg: "#001008", border: "#66FFAA", label: "#66FFAA" } },

  { name: "Primrose Yellow", bg: "#C8A800", text: "#1A1000", sub: "#5C4400", accent: "#3D2C00",
    ideaBubble:    { bg: "#1A1200", border: "#CC8800", label: "#8B5500" },
    inverseBubble: { bg: "#001018", border: "#0088CC", label: "#005588" } },
];

let lastPantoneIdx = -1;
function pickPantone() {
  let idx;
  do { idx = Math.floor(Math.random() * PANTONE_VIVID.length); } while (idx === lastPantoneIdx);
  lastPantoneIdx = idx;
  return PANTONE_VIVID[idx];
}

// ── Web Audio ─────────────────────────────────────────────────────
const ctx = typeof AudioContext !== "undefined" ? new AudioContext() : null;

function playGlitch() {
  if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sawtooth";
  o.frequency.setValueAtTime(80 + Math.random() * 400, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  o.start(); o.stop(ctx.currentTime + 0.12);
}
function playPop() {
  if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(600, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
  g.gain.setValueAtTime(0.2, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  o.start(); o.stop(ctx.currentTime + 0.06);
}
function playTypeTick() {
  if (!ctx) return;
  const b = ctx.createOscillator(); const g = ctx.createGain();
  b.connect(g); g.connect(ctx.destination);
  b.type = "square"; b.frequency.value = 1200 + Math.random() * 400;
  g.gain.setValueAtTime(0.04, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  b.start(); b.stop(ctx.currentTime + 0.03);
}
function playSuccess() {
  if (!ctx) return;
  [300, 500, 700, 1000].forEach((f, i) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "triangle"; o.frequency.value = f;
    const t = ctx.currentTime + i * 0.08;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.start(t); o.stop(t + 0.15);
  });
}

// ── Floating particles ────────────────────────────────────────────
function Particles({ palette }) {
  const symbols = ["⚡", "✦", "◈", "⊕", "≠", "∞", "⊗", "◉"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 17 + 5) % 97}%`,
          top: `${(i * 23 + 11) % 93}%`,
          fontSize: `${10 + (i % 5) * 3}px`,
          color: palette.accent,
          opacity: 0.18 + (i % 4) * 0.06,
          animation: `floatDrift ${6 + (i % 4) * 2}s ease-in-out infinite`,
          animationDelay: `${i % 6}s`,
          transition: "color 0.8s ease",
        }}>{symbols[i % symbols.length]}</div>
      ))}
    </div>
  );
}

const WARNING_TEXT = {
  en: { label: "⚠ WARNING", body: "The following content may make people with average, conformist mindsets deeply uncomfortable." },
  ko: { label: "⚠ 경고",    body: "뒤에 나올 내용은 평균적이고 순응적인 마인드셋을 가진 사람들을 매우 불편하게 만들 수도 있습니다." },
  ja: { label: "⚠ 警告",    body: "以下の内容は、平均的で順応的なマインドセットを持つ人々を非常に不快にさせる可能性があります。" },
  zh: { label: "⚠ 警告",    body: "以下内容可能会让思维平庸、随波逐流的人感到极度不适。" },
  ar: { label: "⚠ تحذير",   body: "قد تُسبّب المحتويات التالية إزعاجاً شديداً للأشخاص ذوي العقليات المتوسطة والامتثالية." },
  es: { label: "⚠ AVISO",   body: "El contenido que sigue puede incomodar profundamente a personas con mentalidades promedio y conformistas." },
  fr: { label: "⚠ AVERTISSEMENT", body: "Le contenu suivant peut profondément déranger les personnes aux mentalités moyennes et conformistes." },
  de: { label: "⚠ WARNUNG", body: "Der folgende Inhalt könnte Menschen mit durchschnittlichen, konformistischen Denkweisen sehr unwohl fühlen lassen." },
  pt: { label: "⚠ AVISO",   body: "O conteúdo a seguir pode deixar pessoas com mentalidades médias e conformistas extremamente desconfortáveis." },
};


function detectLang(text) {
  if (!text) return "en";
  const ko = (text.match(/[\uAC00-\uD7A3]/g) || []).length;
  const ja = (text.match(/[\u3040-\u30FF]/g) || []).length;
  const zh = (text.match(/[\u4E00-\u9FFF]/g) || []).length;
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const es = /[áéíóúüñ¿¡]/i.test(text);
  const fr = /[àâæçéèêëîïôùûüÿœ]/i.test(text);
  const de = /[äöüßÄÖÜ]/i.test(text);
  const pt = /[ãõâêôáéíóúçà]/i.test(text);
  const max = Math.max(ko, ja, zh, ar);
  if (max > 0) {
    if (ko >= ja && ko >= zh && ko >= ar) return "ko";
    if (ja >= zh && ja >= ar) return "ja";
    if (zh >= ar) return "zh";
    return "ar";
  }
  if (es) return "es";
  if (fr) return "fr";
  if (de) return "de";
  if (pt) return "pt";
  return "en";
}

const DOUBLE_CLICK_LABEL = {
  en: "double click to dive deeper ↓",
  ko: "더블클릭으로 더 깊이 파고들기 ↓",
  ja: "ダブルクリックでさらに深く ↓",
  zh: "双击深入探索 ↓",
  ar: "انقر مرتين للتعمق أكثر ↓",
  es: "doble clic para profundizar ↓",
  fr: "double-cliquez pour aller plus loin ↓",
  de: "doppelklick für mehr tiefe ↓",
  pt: "clique duplo para mergulhar mais fundo ↓",
};

// ── Speech Bubble ─────────────────────────────────────────────────
function Bubble({ text, index, palette, onDoubleClick, isDrillSource, lang }) {
  const [visible, setVisible]   = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [flash, setFlash]       = useState(false);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    const t = setTimeout(() => {
      playPop();
      setVisible(true);
      let i = 0;
      const iv = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          if (i % 3 === 0) playTypeTick();
          i++;
        } else clearInterval(iv);
      }, 18);
    }, index * 420);
    return () => clearTimeout(t);
  }, [text, index]);

  const handleDblClick = () => {
    if (displayed.length < text.length) return; // still typing
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    onDoubleClick(text);
  };

  const ideaStyle    = palette.ideaBubble    || { bg: "rgba(10,5,0,0.82)",  border: "#FFE066", label: "#FFE066" };
  const inverseStyle = palette.inverseBubble || { bg: "rgba(5,5,20,0.82)", border: "#FF6699", label: "#FF6699" };
  const bubbleStyle  = isLeft ? ideaStyle : inverseStyle;
  const isActive     = isDrillSource;

  return (
    <div style={{
      display: "flex",
      justifyContent: isLeft ? "flex-start" : "flex-end",
      marginBottom: "1.2rem",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.85)",
      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}>
      {isLeft && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg,#FFE066,#FF9900)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, marginRight: 10, flexShrink: 0,
          boxShadow: "0 0 14px rgba(255,200,0,0.55)",
        }}>⚡</div>
      )}
      <div
        onDoubleClick={handleDblClick}
        style={{
          maxWidth: "72%",
          background: flash ? bubbleStyle.border : bubbleStyle.bg,
          backdropFilter: "blur(10px)",
          border: `1.5px solid ${isActive ? bubbleStyle.border : bubbleStyle.border + "44"}`,
          borderRadius: isLeft ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
          padding: "14px 18px",
          position: "relative",
          boxShadow: isActive
            ? `0 0 0 3px ${bubbleStyle.border}66, 0 8px 32px rgba(0,0,0,0.3)`
            : "0 8px 32px rgba(0,0,0,0.3)",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{
          position: "absolute", top: -1,
          left: isLeft ? -1 : "auto", right: isLeft ? "auto" : -1,
          width: 6, height: 6,
          background: bubbleStyle.border, borderRadius: "50%",
          boxShadow: `0 0 8px ${bubbleStyle.border}`,
        }} />
        <div style={{
          fontSize: "0.72rem", fontFamily: "'Courier Prime', monospace",
          color: flash ? bubbleStyle.bg : bubbleStyle.label,
          marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{isLeft ? `// IDEA_${String(index + 1).padStart(2, "0")}` : `// INVERSE_${String(index + 1).padStart(2, "0")}`}</span>
          {displayed.length >= text.length && (
            <span style={{ opacity: 0.5, fontSize: "0.6rem", letterSpacing: "0.05em" }}>{DOUBLE_CLICK_LABEL[lang] || DOUBLE_CLICK_LABEL.en}</span>
          )}
        </div>
        <p style={{
          margin: 0, color: flash ? bubbleStyle.bg : "#F5F0EB",
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: "1.25rem", lineHeight: 1.65, letterSpacing: "0.01em",
          transition: "color 0.15s ease",
        }}>{displayed}<span style={{
          display: "inline-block", width: 2, height: "1em",
          background: "#FFE066", marginLeft: 2, verticalAlign: "middle",
          animation: displayed.length < text.length ? "blink 0.5s step-end infinite" : "none",
        }} /></p>
      </div>
      {!isLeft && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg,#FF6699,#AA00FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, marginLeft: 10, flexShrink: 0,
          boxShadow: "0 0 14px rgba(255,80,150,0.55)",
        }}>🔬</div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function NicheMania() {
  const [keyword, setKeyword]     = useState("");
  const [ideas, setIdeas]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [stage, setStage]         = useState("idle");
  const [palette, setPalette]     = useState(PANTONE_IDLE);
  const [glitch, setGlitch]       = useState(false);
  const [drillIdea, setDrillIdea] = useState(null);   // the selected bubble text
  const [drillItems, setDrillItems] = useState([]);   // expanded sub-ideas
  const [drillLoading, setDrillLoading] = useState(false);
  const inputRef    = useRef(null);
  const bubblesRef  = useRef(null);
  const drillRef    = useRef(null);
  const usedIdeas   = useRef([]);
  const lastKeyword = useRef("");

  const isResult = stage === "result";

  useEffect(() => {
    const iv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 130);
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  const handleBrainstorm = useCallback(async () => {
    if (!keyword.trim() || loading) return;
    playGlitch();
    setLoading(true);
    setStage("thinking");
    setIdeas([]);
    setDrillIdea(null);
    setDrillItems([]);
    setPalette(PANTONE_IDLE);

    // Reset history if keyword changed
    if (keyword.trim() !== lastKeyword.current) {
      usedIdeas.current = [];
      lastKeyword.current = keyword.trim();
    }

    const previousBlock = usedIdeas.current.length > 0
      ? `\n\nIDEAS ALREADY SHOWN (do NOT repeat or closely paraphrase any of these):\n${usedIdeas.current.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
"Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are NICHE MANIA — a radical contrarian brainstorming engine for rebellious inventors and minority-mindset thinkers.

When given a keyword, you FLIP conventional wisdom completely. You challenge every assumption, find the anti-obvious angle, the weird minority perspective, the counterintuitive truth that mainstream thinkers ignore.

Rules:
- Generate exactly 6 contrarian ideas/insights about the keyword
- Each idea must DIRECTLY contradict common sense or mainstream belief
- Be provocative, edgy, inventive — like a punk inventor's notebook
- Keep each idea concise: 1-2 sentences max, punchy and memorable
- NO bullet points, NO numbering — just separate each idea with a newline
- Detect the language of the keyword and respond in that exact same language
- Start each idea with a bold claim, then the subversive insight
- Channel the energy of Nikola Tesla meets a zine editor`,
          messages: [{ role: "user", content: `Keyword: "${keyword.trim()}"${previousBlock}` }],
        }),
      });
      const data = await response.json();
      const raw  = data.content?.[0]?.text || "";
      const parsed = raw.split("\n").map(s => s.trim()).filter(s => s.length > 20);
      const fresh = parsed.slice(0, 6);
      usedIdeas.current = [...usedIdeas.current, ...fresh];
      setIdeas(fresh);
      setPalette(pickPantone());
      setStage("result");
      playSuccess();
      setTimeout(() => bubblesRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setIdeas(["⚠ Connection to the anti-mainstream dimension failed. Try again."]);
      setPalette(pickPantone());
      setStage("result");
    } finally {
      setLoading(false);
    }
  }, [keyword, loading]);

  const handleDrill = useCallback(async (ideaText) => {
    if (drillLoading) return;
    setDrillIdea(ideaText);
    setDrillItems([]);
    setDrillLoading(true);
    playGlitch();
    setTimeout(() => drillRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
"Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system: `You are NICHE MANIA's deep-drill engine. A user has selected a specific contrarian idea and wants to go deeper.

Given the original keyword and the selected idea, generate 5 more-detailed, actionable sub-ideas that expand specifically on that idea. These should be the next level of radicalism — more concrete, more specific, more inventive than the parent idea.

Rules:
- Generate exactly 5 sub-ideas directly expanding the selected idea
- Each must be more specific and actionable than the parent
- Keep the contrarian, punk-inventor energy
- 1-2 sentences each, punchy and memorable
- NO bullet points, NO numbering — separate with a newline
- Detect the language of the keyword/idea and respond in that same language
- Label each with a symbol prefix: ◎ ◉ ◈ ⊕ ⊗`,
          messages: [{ role: "user", content: `Keyword: "${keyword}"\nSelected idea to expand: "${ideaText}"` }],
        }),
      });
      const data = await response.json();
      const raw  = data.content?.[0]?.text || "";
      const parsed = raw.split("\n").map(s => s.trim()).filter(s => s.length > 10);
      setDrillItems(parsed.slice(0, 5));
      playSuccess();
      setTimeout(() => drillRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setDrillItems(["⚠ Deep dive failed. Try again."]);
    } finally {
      setDrillLoading(false);
    }
  }, [keyword, drillLoading]);

  const handleReset = () => {
    playGlitch();
    setStage("idle");
    setPalette(PANTONE_IDLE);
    setIdeas([]);
    setKeyword("");
    setDrillIdea(null);
    setDrillItems([]);
    usedIdeas.current = [];
    lastKeyword.current = "";
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F9F6F0; }
        html, body { max-width: 100%; overflow-x: hidden; }

        @media (max-width: 480px) {
          .input-row { flex-direction: column !important; }
          .input-row .submit-btn { width: 100% !important; }
          .input-card { padding: 1.2rem !important; }
          .outer-pad { padding: 2rem 1rem 6rem !important; }
          .result-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .result-header button { align-self: flex-end !important; }
        }

        @keyframes floatDrift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%       { transform: translateY(-18px) rotate(5deg); }
          66%       { transform: translateY(10px) rotate(-3deg); }
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0   rgba(0,0,0,0.22); }
          70%  { box-shadow: 0 0 0 12px transparent; }
          100% { box-shadow: 0 0 0 0   transparent; }
        }
        @keyframes thinkSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes thinkSpinReverse { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes warningPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes titleGlitch {
          0%, 100% { clip-path: none; transform: skew(0deg); }
          20%  { clip-path: inset(20% 0 50% 0); transform: skew(-4deg) translateX(-6px); }
          40%  { clip-path: inset(60% 0 10% 0); transform: skew(3deg)  translateX(4px); }
          60%  { clip-path: none; transform: skew(0deg); }
        }

        .submit-btn:hover   { transform: scale(1.04) skew(-1deg) !important; }
        .submit-btn:active  { transform: scale(0.97) !important; }
        .input-field:focus  { outline: none; }
        .tag-btn:hover      { opacity: 1 !important; }
        .reset-btn:hover    { opacity: 1 !important; background: rgba(0,0,0,0.08) !important; }

        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }
      `}</style>

      <Particles palette={palette} />

      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.018) 2px, rgba(0,0,0,0.018) 4px)",
      }} />

      {/* Background — smooth Pantone transition */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -1,
        background: palette.bg,
        transition: "background 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />

      <div className="outer-pad" style={{
        minHeight: "100vh", position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "3rem 1.5rem 6rem",
        width: "100%", overflowX: "hidden",
      }}>

        {/* ── Header (always visible) ── */}
        <div style={{ textAlign: "center", marginBottom: "3rem", animation: "fadeUp 0.8s ease both" }}>
          <div style={{
            fontSize: "0.68rem", letterSpacing: "0.45em",
            color: palette.sub,
            textTransform: "uppercase", marginBottom: "1rem",
            fontFamily: "'Courier Prime', monospace",
            transition: "color 0.8s ease",
          }}>
            ◈ anti-mainstream brainstorming engine ◈
          </div>

          {/* Title — no reflection */}
          <h1 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(4.5rem, 13vw, 9rem)",
            letterSpacing: "0.04em",
            lineHeight: 0.88,
            color: palette.text,
            animation: glitch ? "titleGlitch 0.13s steps(2) both" : "none",
            margin: 0,
            transition: "color 0.8s ease",
          }}>
            NICHE<br />MANIA
          </h1>

          <p style={{
            color: palette.sub,
            fontFamily: "'Courier Prime', monospace",
            fontStyle: "italic",
            fontSize: "0.9rem", marginTop: "1rem",
            letterSpacing: "0.06em",
            transition: "color 0.8s ease",
          }}>
            a space for those who invent from the other side of common sense
          </p>

          {/* Pantone colour chip (result only) */}
          {isResult && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              marginTop: "1rem",
              padding: "5px 14px",
              background: "rgba(0,0,0,0.18)",
              borderRadius: 20,
              animation: "fadeUp 0.5s ease both",
            }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: palette.bg, border: "2px solid rgba(255,255,255,0.5)" }} />
              <span style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: "0.65rem", letterSpacing: "0.2em",
                textTransform: "uppercase", color: palette.text, opacity: 0.7,
              }}>PANTONE · {palette.name}</span>
            </div>
          )}
        </div>

        {/* ── Input Stage ── */}
        {stage === "idle" && (
          <div style={{ width: "100%", maxWidth: 600, animation: "fadeUp 0.8s ease 0.2s both" }}>
            <div className="input-card" style={{
              background: "rgba(10, 5, 0, 0.08)",
              border: `1.5px solid ${palette.accent}44`,
              borderRadius: 16,
              padding: "2rem",
              boxShadow: "0 12px 40px rgba(0,0,0,0.07)",
              backdropFilter: "blur(4px)",
            }}>
              <div style={{
                fontSize: "0.65rem", color: palette.accent,
                letterSpacing: "0.3em", marginBottom: "1rem",
                textTransform: "uppercase", fontFamily: "'Courier Prime', monospace",
              }}>◈ keyword input</div>

              <div className="input-row" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                <input
                  ref={inputRef}
                  className="input-field"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleBrainstorm()}
                  placeholder="ex: sleep, coffee, loneliness..."
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "rgba(255,255,255,0.55)",
                    border: `1.5px solid ${palette.accent}66`,
                    borderRadius: 10, padding: "14px 18px",
                    color: palette.text,
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: "1.1rem", letterSpacing: "0.04em",
                    transition: "all 0.3s ease",
                  }}
                />
                <button
                  className="submit-btn"
                  onClick={handleBrainstorm}
                  disabled={loading || !keyword.trim()}
                  style={{
                    background: keyword.trim() ? palette.text : `${palette.text}33`,
                    border: "none", borderRadius: 10,
                    padding: "14px 22px",
                    color: keyword.trim() ? palette.bg : `${palette.text}55`,
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1.2rem", letterSpacing: "0.1em",
                    cursor: keyword.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animation: keyword.trim() ? "pulseRing 2s infinite" : "none",
                    whiteSpace: "nowrap",
                  }}
                >FLIP IT ⚡</button>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["sleep", "reading", "teamwork", "exercise", "money", "school"].map(tag => (
                  <button
                    key={tag}
                    className="tag-btn"
                    onClick={() => { setKeyword(tag); playPop(); }}
                    style={{
                      background: "transparent",
                      border: `1px solid ${palette.accent}55`,
                      borderRadius: 20, padding: "4px 14px",
                      color: palette.accent,
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: "0.75rem", cursor: "pointer",
                      opacity: 0.75,
                      transition: "all 0.2s ease", letterSpacing: "0.05em",
                    }}
                  >{tag}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Thinking ── */}
        {stage === "thinking" && (
          <div style={{ marginTop: "3rem", textAlign: "center", animation: "fadeUp 0.5s ease both" }}>

            {/* Double counter-rotating spinner */}
            <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 1.8rem" }}>
              {/* Outer ring */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `3px solid ${palette.text}18`,
                borderTop: `3px solid ${palette.text}`,
                animation: "thinkSpin 1s linear infinite",
              }} />
              {/* Inner ring — reverse */}
              <div style={{
                position: "absolute", inset: 14, borderRadius: "50%",
                border: `2px solid ${palette.text}18`,
                borderBottom: `2px solid ${palette.accent}`,
                animation: "thinkSpinReverse 0.7s linear infinite",
              }} />
            </div>

            <div style={{
              fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem",
              letterSpacing: "0.2em", color: palette.text,
              transition: "color 0.8s ease",
            }}>FLIPPING REALITY...</div>
            <div style={{
              color: palette.sub, fontSize: "0.75rem",
              letterSpacing: "0.2em", marginTop: 8,
              fontFamily: "'Courier Prime', monospace",
              transition: "color 0.8s ease",
            }}>scanning the anti-mainstream dimension</div>

            {/* Warning message */}
            {(() => {
              const lang = detectLang(keyword);
              const w = WARNING_TEXT[lang] || WARNING_TEXT.en;
              return (
                <div style={{
                  marginTop: "2rem",
                  padding: "14px 20px",
                  background: `${palette.text}0D`,
                  border: `1px solid ${palette.text}22`,
                  borderRadius: 10,
                  maxWidth: 420,
                  marginLeft: "auto", marginRight: "auto",
                  animation: "warningPulse 2.5s ease-in-out infinite",
                }}>
                  <div style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: "0.65rem", letterSpacing: "0.25em",
                    textTransform: "uppercase", color: palette.accent,
                    marginBottom: 6,
                  }}>{w.label}</div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.88rem", lineHeight: 1.6,
                    color: palette.text, opacity: 0.75,
                    margin: 0,
                  }}>{w.body}</p>
                </div>
              );
            })()}

          </div>
        )}

        {/* ── Results ── */}
        {stage === "result" && (
          <div style={{ width: "100%", maxWidth: 680, animation: "fadeUp 0.5s ease both" }}>

            {/* Result header bar */}
            <div className="result-header" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "2rem", padding: "1rem 1.5rem",
              background: "rgba(0,0,0,0.15)",
              backdropFilter: "blur(8px)",
              border: `1px solid rgba(255,255,255,0.15)`,
              borderRadius: 12,
            }}>
              <div>
                <div style={{
                  fontSize: "0.65rem", color: palette.sub,
                  letterSpacing: "0.3em", textTransform: "uppercase",
                  marginBottom: 4, fontFamily: "'Courier Prime', monospace",
                  transition: "color 0.8s ease",
                }}>◈ flipping</div>
                <div style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "2rem", letterSpacing: "0.1em",
                  color: palette.text,
                  transition: "color 0.8s ease",
                }}>"{keyword}"</div>
              </div>
              <button
                className="reset-btn"
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: `1px solid ${palette.text}44`,
                  borderRadius: 8, padding: "8px 16px",
                  color: palette.text, opacity: 0.7,
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: "0.8rem", cursor: "pointer",
                  transition: "all 0.2s ease", letterSpacing: "0.1em",
                }}
              >← NEW FLIP</button>
            </div>

            {/* Bubbles */}
            <div ref={bubblesRef}>
              {ideas.map((idea, i) => (
                <Bubble
                  key={`${keyword}-${i}`}
                  text={idea} index={i} palette={palette}
                  onDoubleClick={handleDrill}
                  isDrillSource={drillIdea === idea}
                  lang={detectLang(keyword)}
                />
              ))}
            </div>

            {/* ── Drill-Down Section ── */}
            {drillIdea && (
              <div ref={drillRef} style={{
                marginTop: "2rem",
                animation: "fadeUp 0.5s ease both",
              }}>
                {/* Connector line */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: "1.2rem",
                }}>
                  <div style={{ flex: 1, height: 1, background: `${palette.text}22` }} />
                  <div style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: "0.65rem", letterSpacing: "0.25em",
                    textTransform: "uppercase", color: palette.sub,
                    whiteSpace: "nowrap",
                  }}>◈ deep dive</div>
                  <div style={{ flex: 1, height: 1, background: `${palette.text}22` }} />
                </div>

                {/* Source idea card */}
                <div style={{
                  background: "rgba(0,0,0,0.2)", backdropFilter: "blur(8px)",
                  border: `1px dashed ${palette.text}44`,
                  borderRadius: 10, padding: "12px 18px", marginBottom: "1.2rem",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem",
                  color: palette.text, opacity: 0.7, fontStyle: "italic",
                  lineHeight: 1.5,
                }}>"{drillIdea}"</div>

                {/* Drill loading spinner */}
                {drillLoading && (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      border: `3px solid ${palette.text}22`,
                      borderTop: `3px solid ${palette.text}`,
                      animation: "thinkSpin 0.7s linear infinite",
                      margin: "0 auto 1rem",
                    }} />
                    <div style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: "0.75rem", letterSpacing: "0.2em",
                      color: palette.sub, textTransform: "uppercase",
                    }}>going deeper...</div>
                  </div>
                )}

                {/* Drill results */}
                {drillItems.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    marginBottom: "1rem",
                    opacity: 0,
                    animation: `fadeUp 0.45s ease ${i * 0.18}s forwards`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: `${palette.text}22`,
                      border: `1px solid ${palette.text}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", color: palette.text, flexShrink: 0, marginTop: 4,
                      fontFamily: "'Courier Prime', monospace",
                    }}>{i + 1}</div>
                    <div style={{
                      background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)",
                      border: `1px solid ${palette.text}22`,
                      borderRadius: "10px 18px 18px 18px",
                      padding: "12px 16px", flex: 1,
                    }}>
                      <p style={{
                        margin: 0, color: "#F5F0EB",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "1.1rem", lineHeight: 1.6,
                      }}>{item}</p>
                    </div>
                  </div>
                ))}

                {/* Close drill */}
                {drillItems.length > 0 && (
                  <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <button
                      onClick={() => { setDrillIdea(null); setDrillItems([]); playPop(); }}
                      style={{
                        background: "transparent",
                        border: `1px solid ${palette.text}33`,
                        borderRadius: 20, padding: "6px 20px",
                        color: palette.text, opacity: 0.55,
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: "0.72rem", letterSpacing: "0.15em",
                        textTransform: "uppercase", cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "0.55"}
                    >✕ close deep dive</button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom buttons: FLIP AGAIN + NEW FLIP */}
            {ideas.length > 0 && (
              <div style={{
                display: "flex", justifyContent: "center", gap: 12,
                marginTop: "2.5rem",
                opacity: 0, animation: `fadeUp 0.6s ease ${ideas.length * 0.42 + 0.5}s forwards`,
              }}>
                <button
                  onClick={handleBrainstorm}
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: `1.5px solid ${palette.text}55`,
                    borderRadius: 30, padding: "12px 28px",
                    color: palette.text, opacity: 0.85,
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1.05rem", letterSpacing: "0.2em",
                    cursor: "pointer", transition: "all 0.25s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(0,0,0,0.32)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
                >⚡ FLIP AGAIN</button>

                <button
                  onClick={handleReset}
                  style={{
                    background: "transparent",
                    border: `1.5px solid ${palette.text}33`,
                    borderRadius: 30, padding: "12px 28px",
                    color: palette.text, opacity: 0.6,
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1.05rem", letterSpacing: "0.2em",
                    cursor: "pointer", transition: "all 0.25s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(0,0,0,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.background = "transparent"; }}
                >← NEW FLIP</button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "0.75rem",
          background: `linear-gradient(0deg, ${palette.bg} 55%, transparent)`,
          textAlign: "center",
          fontSize: "0.58rem", color: palette.sub,
          letterSpacing: "0.3em", textTransform: "uppercase",
          fontFamily: "'Courier Prime', monospace",
          opacity: 0.55,
          zIndex: 10,
          transition: "all 0.8s ease",
        }}>
          niche mania ◈ for rebels, inventors &amp; minority thinkers
        </div>
      </div>
    </>
  );
}
