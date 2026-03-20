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

function resumeCtx() { if (ctx && ctx.state === "suspended") ctx.resume(); }

function playGlitch() {
  resumeCtx(); if (!ctx) return;
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
  resumeCtx(); if (!ctx) return;
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
  resumeCtx(); if (!ctx) return;
  const b = ctx.createOscillator(); const g = ctx.createGain();
  b.connect(g); g.connect(ctx.destination);
  b.type = "square"; b.frequency.value = 1200 + Math.random() * 400;
  g.gain.setValueAtTime(0.04, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  b.start(); b.stop(ctx.currentTime + 0.03);
}
function playSuccess() {
  resumeCtx(); if (!ctx) return;
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
// Hover woosh — soft sweep up
function playHover() {
  resumeCtx(); if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(200, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.07);
  g.gain.setValueAtTime(0.05, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
  o.start(); o.stop(ctx.currentTime + 0.07);
}
// Dive — deep thud + high ping (double-click drill)
function playDive() {
  resumeCtx(); if (!ctx) return;
  // low thud
  const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
  o1.connect(g1); g1.connect(ctx.destination);
  o1.type = "sine"; o1.frequency.setValueAtTime(120, ctx.currentTime);
  o1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18);
  g1.gain.setValueAtTime(0.25, ctx.currentTime);
  g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  o1.start(); o1.stop(ctx.currentTime + 0.2);
  // high ping
  const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
  o2.connect(g2); g2.connect(ctx.destination);
  o2.type = "triangle"; o2.frequency.value = 1800;
  g2.gain.setValueAtTime(0.1, ctx.currentTime + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
  o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.22);
}
// Whoosh back — sweep down
function playWhooshBack() {
  resumeCtx(); if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sawtooth";
  o.frequency.setValueAtTime(800, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  o.start(); o.stop(ctx.currentTime + 0.15);
}
// Dismiss — soft downward blip
function playDismiss() {
  resumeCtx(); if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(400, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.09);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
  o.start(); o.stop(ctx.currentTime + 0.09);
}
// Charge — rising energy for FLIP AGAIN
function playCharge() {
  resumeCtx(); if (!ctx) return;
  [200, 350, 550, 800].forEach((f, i) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "square"; o.frequency.value = f;
    const t = ctx.currentTime + i * 0.04;
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.start(t); o.stop(t + 0.07);
  });
}
// Input focus — subtle electronic hum
function playFocus() {
  resumeCtx(); if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(320, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(360, ctx.currentTime + 0.12);
  g.gain.setValueAtTime(0.04, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
  o.start(); o.stop(ctx.currentTime + 0.14);
}
// Error buzz
function playError() {
  resumeCtx(); if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sawtooth";
  o.frequency.setValueAtTime(180, ctx.currentTime);
  o.frequency.setValueAtTime(90, ctx.currentTime + 0.05);
  o.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.13, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  o.start(); o.stop(ctx.currentTime + 0.18);
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
  en: "double click for business ideas ↓",
  ko: "더블클릭으로 비즈니스 아이디어 보기 ↓",
  ja: "ダブルクリックでビジネスアイデアへ ↓",
  zh: "双击查看商业创意 ↓",
  ar: "انقر مرتين لأفكار الأعمال ↓",
  es: "doble clic para ideas de negocio ↓",
  fr: "double-cliquez pour les idées business ↓",
  de: "doppelklick für business-ideen ↓",
  pt: "clique duplo para ideias de negócio ↓",
};

// ── Share popup ───────────────────────────────────────────────────
function ShareMenu({ text, keyword, bubbleStyle, isLeft, onClose, onThreadsCopy }) {
  const shareText = `💡 ${text}\n\n— via NICHE MANIA\nniche-mania.vercel.app\n\n#NicheMania #StartupIdea`;
  const siteUrl = "https://niche-mania.vercel.app";

  const handleX = () => {
    playPop();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    onClose();
  };

  const handleThreads = () => {
    playPop();
    onThreadsCopy("threads");
  };

  const handleFacebook = () => {
    playPop();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    onClose();
  };

  const handleInstagram = () => {
    playPop();
    onThreadsCopy("instagram");
  };

  const btnStyle = {
    display: "flex", alignItems: "center", gap: 8,
    background: "transparent",
    border: "none", borderRadius: 8,
    padding: "8px 12px", cursor: "pointer",
    color: "#F5F0EB",
    fontFamily: "'Courier Prime', monospace",
    fontSize: "0.78rem", letterSpacing: "0.08em",
    transition: "background 0.15s ease",
    textAlign: "left",
    width: "100%",
  };

  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 8px)",
      right: 0,
      background: "rgba(10,8,6,0.95)",
      backdropFilter: "blur(16px)",
      border: `1px solid ${bubbleStyle.border}66`,
      borderRadius: 12,
      padding: "8px",
      display: "flex", flexDirection: "column", gap: 2,
      zIndex: 100,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${bubbleStyle.border}22`,
      animation: "fadeUp 0.15s ease both",
      minWidth: 180,
    }}>
      <button onClick={handleX}
        onMouseEnter={e => { playHover(); e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        style={btnStyle}>
        <span style={{ fontSize: "1rem", lineHeight: 1, width: 18, textAlign: "center" }}>𝕏</span>
        <span>Post on X</span>
      </button>

      <button onClick={handleThreads}
        onMouseEnter={e => { playHover(); e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        style={btnStyle}>
        <span style={{ fontSize: "1rem", lineHeight: 1, width: 18, textAlign: "center" }}>◉</span>
        <span>Copy for Threads</span>
      </button>

      <button onClick={handleFacebook}
        onMouseEnter={e => { playHover(); e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        style={btnStyle}>
        <span style={{ fontSize: "1rem", lineHeight: 1, width: 18, textAlign: "center" }}>f</span>
        <span>Share on Facebook</span>
      </button>

      <button onClick={handleInstagram}
        onMouseEnter={e => { playHover(); e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        style={btnStyle}>
        <span style={{ fontSize: "1rem", lineHeight: 1, width: 18, textAlign: "center" }}>◎</span>
        <span>Copy for Instagram</span>
      </button>
    </div>
  );
}

// ── Toast notification ─────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 48, left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(10,8,6,0.92)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 24, padding: "10px 22px",
      color: "#F5F0EB",
      fontFamily: "'Courier Prime', monospace",
      fontSize: "0.78rem", letterSpacing: "0.12em",
      zIndex: 999,
      animation: "fadeUp 0.2s ease both",
      whiteSpace: "nowrap",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>{message}</div>
  );
}

// ── Speech Bubble ─────────────────────────────────────────────────
function Bubble({ text, index, palette, onDoubleClick, isDrillSource, lang, keyword, onToast, isSaved, onSave }) {
  const [visible, setVisible]     = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [flash, setFlash]         = useState(false);
  const [showShare, setShowShare] = useState(false);
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

  // Close share menu on outside click
  useEffect(() => {
    if (!showShare) return;
    const handler = () => setShowShare(false);
    setTimeout(() => document.addEventListener("click", handler), 10);
    return () => document.removeEventListener("click", handler);
  }, [showShare]);

  const handleDblClick = () => {
    if (displayed.length < text.length) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    playDive();
    onDoubleClick(text);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    playPop();
    setShowShare(v => !v);
  };

  const handleThreadsShare = (platform) => {
    const shareText = `💡 ${text}\n\n— via NICHE MANIA\nniche-mania.vercel.app\n\n#NicheMania #StartupIdea`;
    navigator.clipboard.writeText(shareText).then(() => {
      setShowShare(false);
      const msg = platform === "instagram"
        ? "✓ copied — paste into Instagram!"
        : "✓ copied — paste into Threads!";
      onToast(msg);
    });
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
      alignItems: "flex-start",
    }}>
      {isLeft && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg,#FFE066,#FF9900)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, marginRight: 10, flexShrink: 0, marginTop: 4,
          boxShadow: "0 0 14px rgba(255,200,0,0.55)",
        }}>⚡</div>
      )}

      {/* Bubble */}
      <div
        onDoubleClick={handleDblClick}
        onMouseEnter={() => { playHover(); }}
        onMouseLeave={() => {}}
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

        {/* Share menu popup */}
        {showShare && (
          <div onClick={e => e.stopPropagation()}>
            <ShareMenu
              text={text}
              keyword={keyword}
              bubbleStyle={bubbleStyle}
              isLeft={isLeft}
              onClose={() => setShowShare(false)}
              onThreadsCopy={handleThreadsShare}
            />
          </div>
        )}

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

      {/* Action buttons — always visible, side of bubble */}
      {displayed.length >= text.length && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 5,
          justifyContent: "center",
          marginLeft: isLeft ? 8 : 0,
          marginRight: isLeft ? 0 : 8,
          order: isLeft ? 1 : -1,
        }}>
          <button
            onClick={e => { e.stopPropagation(); onSave(text); }}
            onMouseEnter={() => playHover()}
            style={{
              background: isSaved ? "rgba(255,220,80,0.25)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${isSaved ? "rgba(255,220,80,0.6)" : "rgba(255,255,255,0.25)"}`,
              borderRadius: 20, padding: "5px 12px",
              color: isSaved ? "#FFE066" : "#E0D8CE",
              fontFamily: "'Courier Prime', monospace",
              fontSize: "0.6rem", letterSpacing: "0.1em",
              cursor: "pointer", transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >{isSaved ? "★ Saved" : "☆ Save"}</button>

          <button
            onClick={handleShareClick}
            style={{
              background: showShare ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${showShare ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)"}`,
              borderRadius: 20, padding: "5px 12px",
              color: "#E0D8CE",
              fontFamily: "'Courier Prime', monospace",
              fontSize: "0.6rem", letterSpacing: "0.1em",
              cursor: "pointer", transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >↗ Share</button>
        </div>
      )}

      {!isLeft && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg,#FF6699,#AA00FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, marginLeft: 10, flexShrink: 0, marginTop: 4,
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
  const [toast, setToast]             = useState(null);
  const [savedIdeas, setSavedIdeas]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("nm_saved") || "[]"); } catch { return []; }
  });
  const [showSaved, setShowSaved]     = useState(false);
  const [showGuide, setShowGuide]     = useState(false);
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

    const ANGLES = [
      "Focus on the BIOLOGICAL / evolutionary angle — what does nature or the body reveal that contradicts mainstream belief?",
      "Focus on the ECONOMIC / incentive angle — who profits from keeping the mainstream belief alive?",
      "Focus on the HISTORICAL angle — when did this belief NOT exist, and why did it suddenly start?",
      "Focus on the PHILOSOPHICAL / existential angle — what deep assumptions about reality does this completely shatter?",
      "Focus on the ANTHROPOLOGICAL angle — how do other cultures live the exact opposite of this norm?",
      "Focus on the SYSTEMS / second-order effects angle — what hidden consequences does mainstream thinking deliberately ignore?",
      "Focus on the PSYCHOLOGICAL angle — what cognitive biases and social pressures manufacture this belief?",
      "Focus on the TECHNOLOGICAL / future angle — how will this mainstream belief look embarrassingly absurd in 50 years?",
      "Focus on the MINORITY REPORT angle — who are the fringe thinkers already living the radical opposite, and thriving?",
      "Focus on the ARTISTIC / subcultural angle — how do rebels, artists, and outsiders subvert and expose this norm?",
    ];
    const randomAngle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
    const sessionSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const angleBlock = `\n\nANGLE FOR THIS SESSION: ${randomAngle}\nSESSION SEED (use this to vary your output): ${sessionSeed}`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
- Channel the energy of Nikola Tesla meets a zine editor
- IMPORTANT: Each run must feel completely fresh and different — never repeat patterns from previous sessions`,
          messages: [{ role: "user", content: `Keyword: "${keyword.trim()}"${previousBlock}${angleBlock}` }],
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
      playError();
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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system: `You are NICHE MANIA's business opportunity engine. A contrarian insight has been selected — now turn it into REAL business opportunities.

Given the original keyword and the selected contrarian insight, generate 5 concrete startup / business / marketing ideas that DIRECTLY exploit this insight. These are for solo developers, startup founders, and marketers who want to build something nobody else is building.

Rules:
- Generate exactly 5 business ideas directly born from the selected insight
- Each must be a real, actionable opportunity: a product, service, startup, niche brand, or marketing campaign
- For each idea, make clear: WHO the target customer is, WHAT the product/service is, WHY it works because of the contrarian insight
- Keep the punk-inventor energy but make it MONETIZABLE and specific
- 1-2 sentences each, punchy and concrete
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
      playError();
      setDrillItems(["⚠ Deep dive failed. Try again."]);
    } finally {
      setDrillLoading(false);
    }
  }, [keyword, drillLoading]);

  const handleSave = (text) => {
    setSavedIdeas(prev => {
      const already = prev.find(s => s.text === text);
      let next;
      if (already) {
        next = prev.filter(s => s.text !== text);
        playDismiss();
      } else {
        next = [{ text, keyword, savedAt: Date.now() }, ...prev];
        playSuccess();
      }
      localStorage.setItem("nm_saved", JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteSaved = (text) => {
    setSavedIdeas(prev => {
      const next = prev.filter(s => s.text !== text);
      localStorage.setItem("nm_saved", JSON.stringify(next));
      playDismiss();
      return next;
    });
  };

  const handleDrillFromSaved = (item) => {
    // Switch to result stage with the saved keyword, then drill
    setShowSaved(false);
    setKeyword(item.keyword);
    setStage("result");
    setIdeas([item.text]);
    setPalette(pickPantone());
    playDive();
    setTimeout(() => {
      handleDrill(item.text);
    }, 100);
  };

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
                  onFocus={() => playFocus()}
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
                  onMouseEnter={() => playHover()}
                >FLIP IT ⚡</button>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["sleep", "reading", "teamwork", "exercise", "money", "school"].map(tag => (
                  <button
                    key={tag}
                    className="tag-btn"
                    onClick={() => { setKeyword(tag); playPop(); }}
                    onMouseEnter={() => playHover()}
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
                onMouseEnter={() => playHover()}
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
                  keyword={keyword}
                  onToast={(msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); }}
                  isSaved={savedIdeas.some(s => s.text === idea)}
                  onSave={handleSave}
                />
              ))}
            </div>

            {/* ── Drill-Down Section ── */}
            {drillIdea && (
              <div ref={drillRef} style={{
                marginTop: "2rem",
                animation: "fadeUp 0.5s ease both",
              }}>
                {/* Back button */}
                <button
                  onClick={() => {
                    setDrillIdea(null);
                    setDrillItems([]);
                    playWhooshBack();
                    setTimeout(() => bubblesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "transparent",
                    border: `1px solid ${palette.text}33`,
                    borderRadius: 20, padding: "6px 16px",
                    color: palette.text, opacity: 0.6,
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: "0.72rem", letterSpacing: "0.15em",
                    textTransform: "uppercase", cursor: "pointer",
                    transition: "all 0.2s ease",
                    marginBottom: "1.2rem",
                  }}
                  onMouseEnter={e => { playHover(); e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
                >↑ back to ideas</button>

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
                  }}>◈ business ideas</div>
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
                    }}>building business angles...</div>
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
                      onClick={() => { setDrillIdea(null); setDrillItems([]); playDismiss(); }}
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
                    >✕ close business ideas</button>
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
                  onMouseEnter={e => { playHover(); e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(0,0,0,0.32)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
                  onMouseDown={() => playCharge()}
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
                  onMouseEnter={e => { playHover(); e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(0,0,0,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.background = "transparent"; }}
                >← NEW FLIP</button>
              </div>
            )}
          </div>
        )}

        {/* ── Guide Overlay ── */}
        {showGuide && (() => {
          const guideLang = detectLang(keyword);
          const GUIDE_TEXT = {
            en: {
              how: "◈ how to use",
              start: "LET'S FLIP REALITY ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "Type any keyword and hit FLIP IT. You'll get 6 contrarian insights that completely shatter mainstream thinking." },
                { icon: "🔬", title: "DOUBLE CLICK", desc: "Double-click any idea card to unlock 5 real business opportunities built directly from that contrarian insight." },
                { icon: "★", title: "SAVE", desc: "Hit ☆ Save to keep ideas you love. Access them anytime from the ★ saved button — double-click to regenerate business ideas." },
                { icon: "↗", title: "SHARE", desc: "Hit ↗ Share to post directly to X, Threads, Facebook, or Instagram." },
              ],
            },
            ko: {
              how: "◈ 사용 방법",
              start: "현실을 뒤집어보자 ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "키워드를 입력하고 FLIP IT을 누르면 상식을 완전히 뒤집는 6가지 반mainstream 인사이트가 나와요." },
                { icon: "🔬", title: "더블클릭", desc: "마음에 드는 아이디어 카드를 더블클릭하면 그 인사이트를 기반으로 한 실제 비즈니스 아이디어 5가지를 보여줘요." },
                { icon: "★", title: "저장", desc: "☆ Save 버튼으로 아이디어를 저장하세요. 우하단 ★ saved 버튼에서 언제든 꺼내볼 수 있고, 더블클릭하면 비즈니스 아이디어도 다시 볼 수 있어요." },
                { icon: "↗", title: "공유", desc: "↗ Share 버튼으로 X, Threads, Facebook, Instagram에 바로 공유할 수 있어요." },
              ],
            },
            ja: {
              how: "◈ 使い方",
              start: "現実をひっくり返そう ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "キーワードを入力してFLIP ITを押すと、常識を完全に覆す6つの逆張りインサイトが生成されます。" },
                { icon: "🔬", title: "ダブルクリック", desc: "気に入ったアイデアカードをダブルクリックすると、そのインサイトをもとにした5つのビジネスアイデアが表示されます。" },
                { icon: "★", title: "保存", desc: "☆ SaveボタンでアイデアをローカルStorageに保存。右下の★ savedボタンでいつでも確認でき、ダブルクリックでビジネスアイデアも再表示できます。" },
                { icon: "↗", title: "シェア", desc: "↗ ShareボタンでX・Threads・Facebook・Instagramに直接シェアできます。" },
              ],
            },
            zh: {
              how: "◈ 使用说明",
              start: "颠覆现实，开始吧 ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "输入关键词并点击 FLIP IT，获得6个完全颠覆主流思维的逆向洞察。" },
                { icon: "🔬", title: "双击", desc: "双击任意想法卡片，即可解锁基于该洞察的5个真实商业机会。" },
                { icon: "★", title: "保存", desc: "点击 ☆ Save 保存喜欢的想法。随时从右下角 ★ saved 按钮查看，双击可重新生成商业点子。" },
                { icon: "↗", title: "分享", desc: "点击 ↗ Share 直接分享到 X、Threads、Facebook 或 Instagram。" },
              ],
            },
            es: {
              how: "◈ cómo usar",
              start: "VOLTEEMOS LA REALIDAD ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "Escribe una palabra clave y presiona FLIP IT. Obtendrás 6 ideas contrarias que destruyen el pensamiento convencional." },
                { icon: "🔬", title: "DOBLE CLIC", desc: "Haz doble clic en cualquier tarjeta para desbloquear 5 oportunidades de negocio reales basadas en ese insight." },
                { icon: "★", title: "GUARDAR", desc: "Pulsa ☆ Save para guardar ideas. Accede desde el botón ★ saved — haz doble clic para regenerar ideas de negocio." },
                { icon: "↗", title: "COMPARTIR", desc: "Pulsa ↗ Share para publicar directamente en X, Threads, Facebook o Instagram." },
              ],
            },
            fr: {
              how: "◈ comment utiliser",
              start: "RENVERSONS LA RÉALITÉ ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "Saisissez un mot-clé et appuyez sur FLIP IT. Obtenez 6 idées contrariennes qui brisent la pensée conventionnelle." },
                { icon: "🔬", title: "DOUBLE CLIC", desc: "Double-cliquez sur une carte pour débloquer 5 opportunités business réelles basées sur cet insight." },
                { icon: "★", title: "SAUVEGARDER", desc: "Cliquez ☆ Save pour conserver vos idées. Accédez-y via le bouton ★ saved — double-cliquez pour régénérer les idées business." },
                { icon: "↗", title: "PARTAGER", desc: "Cliquez ↗ Share pour publier sur X, Threads, Facebook ou Instagram." },
              ],
            },
            de: {
              how: "◈ anleitung",
              start: "REALITÄT UMKEHREN ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "Gib ein Stichwort ein und drücke FLIP IT. Du erhältst 6 konträre Einsichten, die konventionelles Denken völlig auf den Kopf stellen." },
                { icon: "🔬", title: "DOPPELKLICK", desc: "Doppelklicke auf eine Karte, um 5 echte Geschäftsmöglichkeiten basierend auf diesem Insight freizuschalten." },
                { icon: "★", title: "SPEICHERN", desc: "Klicke ☆ Save zum Speichern. Zugriff über den ★ saved Button — Doppelklick regeneriert Geschäftsideen." },
                { icon: "↗", title: "TEILEN", desc: "Klicke ↗ Share, um direkt auf X, Threads, Facebook oder Instagram zu teilen." },
              ],
            },
            pt: {
              how: "◈ como usar",
              start: "VAMOS VIRAR A REALIDADE ⚡",
              steps: [
                { icon: "⚡", title: "FLIP IT", desc: "Digite uma palavra-chave e clique em FLIP IT. Você receberá 6 insights contrários que destroem o pensamento convencional." },
                { icon: "🔬", title: "DUPLO CLIQUE", desc: "Dê duplo clique em qualquer card para desbloquear 5 oportunidades de negócio reais baseadas nesse insight." },
                { icon: "★", title: "SALVAR", desc: "Clique ☆ Save para guardar ideias. Acesse pelo botão ★ saved — duplo clique regenera as ideias de negócio." },
                { icon: "↗", title: "COMPARTILHAR", desc: "Clique ↗ Share para publicar no X, Threads, Facebook ou Instagram." },
              ],
            },
          };
          const g = GUIDE_TEXT[guideLang] || GUIDE_TEXT.en;
          return (
            <div
              onClick={() => { setShowGuide(false); playDismiss(); }}
              style={{
                position: "fixed", inset: 0, zIndex: 300,
                background: "rgba(6,4,2,0.96)",
                backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "2rem",
                animation: "fadeUp 0.4s ease both",
              }}>
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  width: "100%", maxWidth: 480,
                  display: "flex", flexDirection: "column", gap: "1.6rem",
                }}>
                {/* Logo + X button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "clamp(3rem, 10vw, 5rem)",
                      letterSpacing: "0.06em", lineHeight: 0.9,
                      color: "#F5F0EB",
                    }}>NICHE<br />MANIA</div>
                    <div style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: "0.65rem", letterSpacing: "0.3em",
                      color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                      marginTop: "0.5rem",
                    }}>{g.how}</div>
                  </div>
                  <button
                    onClick={() => { setShowGuide(false); playDismiss(); }}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "50%", width: 36, height: 36,
                      color: "#F5F0EB", fontSize: "1rem",
                      cursor: "pointer", transition: "all 0.2s ease",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 4,
                    }}
                    onMouseEnter={e => { playHover(); e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  >✕</button>
                </div>

                {/* Steps */}
                {g.steps.map((step, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "1rem", alignItems: "flex-start",
                    animation: `fadeUp 0.4s ease ${0.1 + i * 0.08}s both`,
                    opacity: 0,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem",
                    }}>{step.icon}</div>
                    <div>
                      <div style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: "0.65rem", letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
                        marginBottom: 4,
                      }}>{step.title}</div>
                      <p style={{
                        margin: 0, color: "rgba(255,255,255,0.75)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.9rem", lineHeight: 1.6,
                      }}>{step.desc}</p>
                    </div>
                  </div>
                ))}

                {/* Close button */}
                <button
                  onClick={() => { setShowGuide(false); playDismiss(); }}
                  style={{
                    background: "#F5F0EB",
                    border: "none", borderRadius: 30,
                    padding: "14px 0", width: "100%",
                    color: "#1C0A00",
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1.3rem", letterSpacing: "0.2em",
                    cursor: "pointer", transition: "all 0.2s ease",
                    marginTop: "0.5rem",
                    animation: "fadeUp 0.4s ease 0.5s both", opacity: 0,
                  }}
                  onMouseEnter={e => { playHover(); e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >✕ CLOSE</button>
              </div>
            </div>
          );
        })()}

        {/* ? Help button — always visible */}
        <button
          onClick={() => { setShowGuide(true); playPop(); }}
          style={{
            position: "fixed", top: 20, right: 20,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Courier Prime', monospace",
            fontSize: "0.85rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 198, transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { playHover(); e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#F5F0EB"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        >?</button>

        {/* ── Saved Ideas Panel ── */}
        {/* Overlay */}
        {showSaved && (
          <div
            onClick={() => { setShowSaved(false); playDismiss(); }}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
            }}
          />
        )}

        {/* Slide panel */}
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(380px, 92vw)",
          background: "rgba(12,8,4,0.97)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          zIndex: 201,
          transform: showSaved ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex", flexDirection: "column",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.5)",
        }}>
          {/* Panel header */}
          <div style={{
            padding: "1.4rem 1.4rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.6rem", letterSpacing: "0.08em",
                color: "#F5F0EB",
              }}>SAVED IDEAS</div>
              <div style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: "0.62rem", letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                marginTop: 2,
              }}>{savedIdeas.length} idea{savedIdeas.length !== 1 ? "s" : ""} saved</div>
            </div>
            <button
              onClick={() => { setShowSaved(false); playDismiss(); }}
              onMouseEnter={() => playHover()}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "50%", width: 34, height: 34,
                color: "#F5F0EB", fontSize: "1rem",
                cursor: "pointer", transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.4rem" }}>
            {savedIdeas.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "3rem 1rem",
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'Courier Prime', monospace",
                fontSize: "0.8rem", letterSpacing: "0.1em",
                lineHeight: 1.8,
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.3 }}>☆</div>
                no saved ideas yet<br />
                hover a card and hit ☆ save
              </div>
            ) : (
              savedIdeas.map((item, i) => (
                <div
                  key={item.savedAt}
                  onDoubleClick={() => handleDrillFromSaved(item)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, padding: "12px 14px",
                    marginBottom: "0.8rem",
                    animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={e => { playHover(); e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                >
                  <div style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: "0.58rem", letterSpacing: "0.2em",
                    color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                    marginBottom: 6,
                    display: "flex", justifyContent: "space-between",
                  }}>
                    <span>◈ {item.keyword}</span>
                    <span style={{ opacity: 0.4 }}>double click ↗</span>
                  </div>
                  <p style={{
                    margin: 0, color: "#F0EBE3",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.95rem", lineHeight: 1.6,
                    paddingRight: 28,
                  }}>{item.text}</p>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteSaved(item.text); }}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      background: "transparent",
                      border: "none", color: "rgba(255,255,255,0.2)",
                      fontSize: "0.9rem", cursor: "pointer",
                      transition: "color 0.2s ease", lineHeight: 1,
                      padding: 2,
                    }}
                    onMouseEnter={e => { playHover(); e.currentTarget.style.color = "#FF6666"; }}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Floating saved button */}
        <button
          onClick={() => { setShowSaved(v => !v); playPop(); }}
          onMouseEnter={() => playHover()}
          style={{
            position: "fixed", bottom: 28, right: 24,
            background: savedIdeas.length > 0 ? palette.text : "rgba(20,14,8,0.85)",
            border: `1.5px solid ${savedIdeas.length > 0 ? palette.text : "rgba(255,255,255,0.2)"}`,
            borderRadius: 28, padding: "10px 18px",
            color: savedIdeas.length > 0 ? palette.bg : "rgba(255,255,255,0.5)",
            fontFamily: "'Courier Prime', monospace",
            fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: "pointer", zIndex: 199,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: savedIdeas.length > 0 ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span>★</span>
          <span>saved</span>
          {savedIdeas.length > 0 && (
            <span style={{
              background: "#FF4444",
              color: "#fff",
              borderRadius: "50%",
              width: 18, height: 18,
              fontSize: "0.6rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "bold",
            }}>{savedIdeas.length}</span>
          )}
        </button>

        {/* Toast */}
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}

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
