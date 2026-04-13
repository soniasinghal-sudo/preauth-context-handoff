import { useState, useEffect, useRef } from "react";

const C = {
  mcYellow: "#FFE01B", mcBlack: "#241C15", mcWhite: "#FFFFFF",
  mcCoconut: "#F6F1EB", mcGraphite: "#3D3935",
  mcGray100: "#F7F4F0", mcGray200: "#E8E4DF", mcGray400: "#9B9490", mcGray600: "#6B6560",
  mcBlue: "#007C89", mcBlueDark: "#005F69",
  chatBg: "#F9F8F6", chatUser: "#E3F1F2", chatBot: "#FFFFFF", daBlueSoft: "#E3F1F2",
  successGreen: "#2E7D32", successBg: "#E8F5E9",
  errorRed: "#C62828", errorBg: "#FFEBEE",
  warnOrange: "#E65100", warnBg: "#FFF3E0",
};

const SCENARIOS = [
  {
    id: "ecommerce", label: "Which plan is right for me?", icon: "🛍", isNewUser: true,
    preAuthMessages: [
      { role: "user", text: "which plan should I get?" },
      { role: "bot", text: "Depends on what you're trying to do! Are you running an online store, sending newsletters, or something else?" },
      { role: "user", text: "online store, shopify" },
      { role: "bot", text: "Standard plan. It has Shopify sync, abandoned cart emails, and product recommendations built in. How many contacts do you have?" },
      { role: "user", text: "like 2000" },
      { role: "bot", text: "You're well within Standard's limits. Want to sign up? I can help you connect Shopify once you're in." },
    ],
    todayGreeting: "Hi there! Welcome to Mailchimp. How can I help you today?",
    proposedGreeting: "I see you're setting up Mailchimp for a Shopify store with about 2K contacts. Let's connect your store first.",
    tags: ["Shopify", "Standard plan", "~2K contacts"],
  },
  {
    id: "newsletter", label: "How do I get started?", icon: "📰", isNewUser: true,
    preAuthMessages: [
      { role: "user", text: "how do I get started" },
      { role: "bot", text: "Happy to help! What are you looking to do with Mailchimp? Send newsletters, set up automations, run ads?" },
      { role: "user", text: "just a newsletter for now" },
      { role: "bot", text: "Got it. Do you already have a list of contacts, or are you starting from scratch?" },
      { role: "user", text: "I have a list in a spreadsheet" },
      { role: "bot", text: "Perfect. You can import that after you sign up. The Free plan works great for getting started with newsletters." },
    ],
    todayGreeting: "Hi there! Welcome to Mailchimp. How can I help you today?",
    proposedGreeting: "I see you want to start a newsletter and import contacts from a spreadsheet. Let's do that import first.",
    tags: ["CSV import", "Newsletter", "Getting started"],
  },
  {
    id: "deliverability", label: "Something's wrong with my emails", icon: "📩", isNewUser: false,
    preAuthMessages: [
      { role: "user", text: "nobody is opening my emails anymore" },
      { role: "bot", text: "That's frustrating. A few things could cause that. When did you notice the drop?" },
      { role: "user", text: "last couple weeks" },
      { role: "bot", text: "Could be a deliverability issue. Have you checked if your sending domain is authenticated? That's the most common cause of sudden drops." },
      { role: "user", text: "how do I check that" },
      { role: "bot", text: "It's under Settings > Domains in your account. Log in and I'll walk you through it." },
    ],
    todayGreeting: "Welcome back! How can I help you today?",
    proposedGreeting: "I see your open rates dropped recently. Let's check your domain authentication first -- that's the most likely cause.",
    tags: ["Deliverability", "Domain auth", "Open rates"],
  },
  {
    id: "segmentation", label: "How do I send to specific people?", icon: "👥", isNewUser: false,
    preAuthMessages: [
      { role: "user", text: "I want to send different emails to different people on my list" },
      { role: "bot", text: "You're looking for segmentation. What do you want to split them by? Location, how engaged they are, what they bought?" },
      { role: "user", text: "engagement I guess, some people never open anything" },
      { role: "bot", text: "Smart move. You can create a segment of people who opened in the last 90 days. Log in and I'll help you build it." },
    ],
    todayGreeting: "Welcome back! How can I help you today?",
    proposedGreeting: "I see you want to segment by engagement. Let's build that segment now -- we'll split by who opened emails in the last 90 days.",
    tags: ["Segmentation", "Engagement", "90-day openers"],
  },
];

function useTyping(text, active, speed = 14) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setOut(""); setDone(false); return; }
    setOut(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) { clearInterval(iv); setDone(true); } }, speed);
    return () => clearInterval(iv);
  }, [text, active]);
  return { out, done };
}

function ChatBubble({ role, text, animate, onDone }) {
  const isBot = role === "bot";
  const { out, done } = useTyping(text, animate, 12);
  useEffect(() => { if (done && onDone) onDone(); }, [done]);
  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: 10 }}>
      {isBot && <div style={{ width: 26, height: 26, borderRadius: 13, background: C.mcBlue, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 7, flexShrink: 0, marginTop: 2 }}><span style={{ color: C.mcWhite, fontSize: 12, fontWeight: 700 }}>M</span></div>}
      <div style={{
        background: isBot ? C.chatBot : C.chatUser, border: isBot ? `1px solid ${C.mcGray200}` : "none",
        borderRadius: isBot ? "2px 13px 13px 13px" : "13px 2px 13px 13px",
        padding: "9px 12px", maxWidth: "84%", fontSize: 13, lineHeight: 1.5, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif",
        boxShadow: isBot ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
      }}>
        {animate ? out : text}{animate && !done && <span style={{ opacity: 0.3 }}>|</span>}
      </div>
    </div>
  );
}

// mc.com header
function McHeader({ onSignUp }) {
  return (
    <div style={{ background: C.mcYellow, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 700, color: C.mcBlack }}>Mailchimp</span>
        <div style={{ display: "flex", gap: 20, marginLeft: 16 }}>{["Products", "Solutions", "Resources", "Pricing"].map(t => <span key={t} style={{ fontSize: 14, color: C.mcBlack, cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 500 }}>{t}</span>)}</div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button style={{ background: "none", border: "none", fontSize: 14, color: C.mcBlack, cursor: "pointer", fontWeight: 500, fontFamily: "'Helvetica Neue', sans-serif" }}>Log In</button>
        <button onClick={onSignUp} style={{ background: C.mcBlack, color: C.mcWhite, border: "none", borderRadius: 24, padding: "8px 20px", fontSize: 14, cursor: "pointer", fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>Sign Up Free</button>
      </div>
    </div>
  );
}

function McHero() {
  return (
    <div style={{ background: C.mcYellow, padding: "60px 48px 80px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 46, fontWeight: 700, color: C.mcBlack, margin: 0, lineHeight: 1.15, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>Turn Emails into Revenue</h1>
      <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 17, color: C.mcGraphite, marginTop: 16, maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Win new customers with the #1 email marketing and automations platform.</p>
    </div>
  );
}

// Scenario picker in chat widget
function ScenarioPicker({ onPick }) {
  const [hov, setHov] = useState(null);
  const newS = SCENARIOS.filter(s => s.isNewUser);
  const existS = SCENARIOS.filter(s => !s.isNewUser);
  const btn = (s) => (
    <button key={s.id} onClick={() => onPick(s)} onMouseOver={() => setHov(s.id)} onMouseOut={() => setHov(null)}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: hov === s.id ? C.daBlueSoft : C.mcWhite, border: `1px solid ${hov === s.id ? C.mcBlue : C.mcGray200}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'Helvetica Neue', sans-serif" }}>
      <span style={{ fontSize: 20 }}>{s.icon}</span><span style={{ fontSize: 13, fontWeight: 500, color: C.mcBlack }}>{s.label}</span>
    </button>
  );
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, width: 370, background: C.chatBg, borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", zIndex: 100, border: `1px solid ${C.mcGray200}`, overflow: "hidden" }}>
      <div style={{ background: C.mcBlue, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: C.mcWhite, fontSize: 15, fontWeight: 700 }}>M</span></div>
        <div><div style={{ color: C.mcWhite, fontSize: 14, fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>Mailchimp Assistant</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "'Helvetica Neue', sans-serif" }}>Online</div></div>
      </div>
      <div style={{ padding: "16px 14px", maxHeight: 400, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: C.mcBlue, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: C.mcWhite, fontSize: 12, fontWeight: 700 }}>M</span></div>
          <div style={{ background: C.mcWhite, border: `1px solid ${C.mcGray200}`, borderRadius: "2px 13px 13px 13px", padding: "9px 13px", fontSize: 13, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif" }}>Hi! How can I help you today?</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.mcGray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginLeft: 2, fontFamily: "'Helvetica Neue', sans-serif" }}>New to Mailchimp</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>{newS.map(btn)}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.mcGray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginLeft: 2, fontFamily: "'Helvetica Neue', sans-serif" }}>Already have an account</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{existS.map(btn)}</div>
      </div>
    </div>
  );
}

// Pre-auth chat window
function PreAuthChat({ scenario, visible, onCTA }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [animIdx, setAnimIdx] = useState(0);
  const scrollRef = useRef(null);
  useEffect(() => { if (visible) { setMsgIdx(0); setAnimIdx(0); } }, [visible, scenario?.id]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgIdx]);
  const msgs = scenario?.preAuthMessages || [];
  const shown = msgs.slice(0, msgIdx + 1);
  const allShown = msgIdx >= msgs.length - 1;

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, width: 370, height: 480, background: C.chatBg, borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: visible ? "flex" : "none", flexDirection: "column", zIndex: 100, border: `1px solid ${C.mcGray200}`, overflow: "hidden" }}>
      <div style={{ background: C.mcBlue, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: C.mcWhite, fontSize: 15, fontWeight: 700 }}>M</span></div>
        <div><div style={{ color: C.mcWhite, fontSize: 14, fontWeight: 600, fontFamily: "'Helvetica Neue', sans-serif" }}>Mailchimp Assistant</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "'Helvetica Neue', sans-serif" }}>Online</div></div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, padding: "16px 14px", overflowY: "auto" }}>
        {shown.map((m, i) => <ChatBubble key={i} role={m.role} text={m.text} animate={i === animIdx} onDone={() => { if (i < msgs.length - 1) setTimeout(() => { setMsgIdx(i + 1); setAnimIdx(i + 1); }, 500); }} />)}
      </div>
      {allShown && (
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.mcGray200}`, background: C.mcWhite, display: "flex", gap: 8 }}>
          <button onClick={onCTA} style={{ flex: 1, background: C.mcBlue, color: C.mcWhite, border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif" }}>
            {scenario?.isNewUser ? "Sign Up Free \u2192" : "Log In to Continue \u2192"}
          </button>
        </div>
      )}
    </div>
  );
}

function ChatFAB({ onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseOver={() => setH(true)} onMouseOut={() => setH(false)}
      style={{ position: "fixed", bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, background: C.mcBlue, border: "none", cursor: "pointer", boxShadow: h ? "0 6px 24px rgba(0,124,137,0.4)" : "0 4px 16px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, transition: "all 0.2s", transform: h ? "scale(1.08)" : "scale(1)" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/></svg>
    </button>
  );
}

// Login transition
function LoginScreen({ onComplete, isNewUser }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2000);
    const t3 = setTimeout(() => setStep(3), 3200);
    const t4 = setTimeout(() => onComplete(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);
  const steps = isNewUser
    ? ["Redirecting to sign up...", "Creating your account...", "Transferring conversation context...", "Taking you to your dashboard..."]
    : ["Redirecting to log in...", "Authenticating...", "Transferring conversation context...", "Taking you to your account..."];
  return (
    <div style={{ width: "100%", height: "100%", background: C.mcCoconut, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Georgia', serif", fontSize: 26, fontWeight: 700, color: C.mcBlack }}>Mailchimp</span>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16, minWidth: 300 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: step >= i ? 1 : 0.25, transition: "opacity 0.4s" }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: step > i ? C.successGreen : step === i ? C.mcBlue : C.mcGray200, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s" }}>
              {step > i ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                : step === i ? <div style={{ width: 8, height: 8, borderRadius: 4, border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> : null}
            </div>
            <span style={{ fontSize: 14, fontFamily: "'Helvetica Neue', sans-serif", color: step >= i ? C.mcBlack : C.mcGray400, fontWeight: step === i ? 600 : 400 }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: "12px 20px", background: C.successBg, borderRadius: 8, border: `1px solid ${C.successGreen}33`, opacity: step >= 2 ? 1 : 0, transition: "opacity 0.4s", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8L7 11L12 5" stroke={C.successGreen} strokeWidth="2" strokeLinecap="round"/></svg>
        <span style={{ fontSize: 13, color: C.successGreen, fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 500 }}>Conversation context saved</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// MC App Shell (sidebar + top bar)
function AppShell({ scenario, children, topRight }) {
  return (
    <div style={{ width: "100%", height: "100%", background: C.mcGray100, display: "flex" }}>
      <div style={{ width: 200, background: C.mcBlack, padding: "20px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 20px", marginBottom: 28 }}><span style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 700, color: C.mcYellow }}>Mailchimp</span></div>
        {["Home", "Audience", "Campaigns", "Automations", "Content", "Analytics"].map((item, i) => (
          <div key={item} style={{ padding: "10px 20px", fontSize: 13, color: i === 0 ? C.mcWhite : C.mcGray400, fontFamily: "'Helvetica Neue', sans-serif", cursor: "pointer", fontWeight: i === 0 ? 600 : 400, background: i === 0 ? "rgba(255,255,255,0.08)" : "transparent", borderLeft: i === 0 ? `3px solid ${C.mcYellow}` : "3px solid transparent" }}>{item}</div>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 56, background: C.mcWhite, borderBottom: `1px solid ${C.mcGray200}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif" }}>{scenario.isNewUser ? "Welcome to Mailchimp" : "Welcome back"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {topRight}
            <div style={{ width: 32, height: 32, borderRadius: 16, background: C.mcGray200, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 13, fontWeight: 600, color: C.mcGray600 }}>JS</span></div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}

// Main content area (onboarding or dashboard)
function MainContent({ scenario }) {
  if (scenario.isNewUser) {
    return (
      <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
        <div style={{ maxWidth: 520 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.mcBlack, margin: "0 0 4px", fontFamily: "'Georgia', serif" }}>Let's get you set up</h2>
          <p style={{ fontSize: 13, color: C.mcGray600, margin: "0 0 20px", fontFamily: "'Helvetica Neue', sans-serif" }}>Complete these steps to start sending emails.</p>
          {["Connect your store", "Import your contacts", "Design your first email", "Set up an automation"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.mcWhite, borderRadius: 10, marginBottom: 6, border: `1px solid ${i === 0 ? C.mcBlue : C.mcGray200}` }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${i === 0 ? C.mcBlue : C.mcGray200}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{i === 0 && <div style={{ width: 8, height: 8, borderRadius: 4, background: C.mcBlue }} />}</div>
              <span style={{ fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? C.mcBlack : C.mcGray600, fontFamily: "'Helvetica Neue', sans-serif" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
      <div style={{ maxWidth: 520 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.mcBlack, margin: "0 0 4px", fontFamily: "'Georgia', serif" }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: C.mcGray600, margin: "0 0 20px", fontFamily: "'Helvetica Neue', sans-serif" }}>Here's what's happening with your account.</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {[{ l: "Contacts", v: "10,241", c: "+124 this month" }, { l: "Open rate", v: "38.2%", c: "-2.1% vs last month" }, { l: "Campaigns", v: "12", c: "Last 30 days" }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: C.mcWhite, borderRadius: 10, padding: 14, border: `1px solid ${C.mcGray200}` }}>
              <div style={{ fontSize: 10, color: C.mcGray400, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "'Helvetica Neue', sans-serif", marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.mcGray600, fontFamily: "'Helvetica Neue', sans-serif", marginTop: 2 }}>{s.c}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// DA panel -- "today" version (no context, generic)
function DAPanelToday({ scenario }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t); }, [scenario.id]);
  const { out, done } = useTyping(scenario.todayGreeting, show, 14);
  return (
    <div style={{ width: 340, background: C.mcWhite, borderLeft: `1px solid ${C.mcGray200}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.mcGray200}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: C.mcBlue, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: C.mcWhite, fontSize: 13, fontWeight: 700 }}>M</span></div>
        <div><div style={{ fontSize: 13, fontWeight: 600, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif" }}>Mailchimp Assistant</div></div>
      </div>
      <div style={{ margin: "10px 10px 0", padding: "8px 10px", background: C.errorBg, borderRadius: 6, border: `1px solid ${C.errorRed}22` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 12 }}>&#x274C;</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.errorRed, fontFamily: "'Helvetica Neue', sans-serif" }}>No pre-auth context available</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
        {show && (
          <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: C.mcBlue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}><span style={{ color: C.mcWhite, fontSize: 11, fontWeight: 700 }}>M</span></div>
            <div style={{ background: C.mcWhite, border: `1px solid ${C.mcGray200}`, borderRadius: "2px 12px 12px 12px", padding: "9px 12px", fontSize: 13, lineHeight: 1.5, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif" }}>
              {out}{!done && <span style={{ opacity: 0.3 }}>|</span>}
            </div>
          </div>
        )}
        {done && (
          <div style={{ textAlign: "center", padding: "16px 8px" }}>
            <div style={{ fontSize: 11, color: C.mcGray400, fontStyle: "italic", fontFamily: "'Helvetica Neue', sans-serif", lineHeight: 1.6 }}>
              User must re-explain what they were asking about on mc.com...
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px", background: C.warnBg, borderTop: `1px solid ${C.warnOrange}22` }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.warnOrange, fontFamily: "'Helvetica Neue', sans-serif" }}>User starts from zero. Prior conversation is lost.</span>
      </div>
    </div>
  );
}

// DA panel -- "proposed" version (with context)
function DAPanelProposed({ scenario }) {
  const [show, setShow] = useState(false);
  const [showCtx, setShowCtx] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t); }, [scenario.id]);
  const { out, done } = useTyping(scenario.proposedGreeting, show, 14);
  useEffect(() => { if (done) { const t = setTimeout(() => setShowCtx(true), 300); return () => clearTimeout(t); } }, [done]);
  return (
    <div style={{ width: 340, background: C.mcWhite, borderLeft: `1px solid ${C.mcGray200}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.mcGray200}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: C.mcBlue, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: C.mcWhite, fontSize: 13, fontWeight: 700 }}>M</span></div>
        <div><div style={{ fontSize: 13, fontWeight: 600, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif" }}>Mailchimp Assistant</div></div>
      </div>
      <div style={{ margin: "10px 10px 0", padding: "8px 10px", background: C.successBg, borderRadius: 6, border: `1px solid ${C.successGreen}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6L5 8L9 4" stroke={C.successGreen} strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.successGreen, fontFamily: "'Helvetica Neue', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Continuing from mc.com</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {scenario.tags.map(t => <span key={t} style={{ fontSize: 10, color: C.mcBlueDark, background: C.daBlueSoft, padding: "1px 7px", borderRadius: 8, fontFamily: "'Helvetica Neue', sans-serif" }}>{t}</span>)}
        </div>
      </div>
      <div style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
        {show && (
          <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: C.mcBlue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}><span style={{ color: C.mcWhite, fontSize: 11, fontWeight: 700 }}>M</span></div>
            <div style={{ background: C.mcWhite, border: `1px solid ${C.mcGray200}`, borderRadius: "2px 12px 12px 12px", padding: "9px 12px", fontSize: 13, lineHeight: 1.5, color: C.mcBlack, fontFamily: "'Helvetica Neue', sans-serif" }}>
              {out}{!done && <span style={{ opacity: 0.3 }}>|</span>}
            </div>
          </div>
        )}
        {done && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
            {["Yes, let's do it!", "Show me around first"].map(o => (
              <div key={o} style={{ padding: "8px 12px", background: C.mcWhite, border: `1px solid ${C.mcGray200}`, borderRadius: 7, fontSize: 12, color: C.mcBlue, fontWeight: 500, fontFamily: "'Helvetica Neue', sans-serif" }}>{o}</div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px", background: C.successBg, borderTop: `1px solid ${C.successGreen}22` }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.successGreen, fontFamily: "'Helvetica Neue', sans-serif" }}>DA picks up intent and jumps straight to action.</span>
      </div>
    </div>
  );
}

// Toggle pill
function ViewToggle({ view, onChange }) {
  return (
    <div style={{ display: "flex", background: C.mcGray100, borderRadius: 8, padding: 3, border: `1px solid ${C.mcGray200}` }}>
      {[{ key: "today", label: "Today", color: C.warnOrange }, { key: "proposed", label: "With Handoff", color: C.successGreen }].map(v => (
        <button key={v.key} onClick={() => onChange(v.key)} style={{
          padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer",
          background: view === v.key ? C.mcWhite : "transparent",
          boxShadow: view === v.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          fontSize: 11, fontWeight: 600, color: view === v.key ? v.color : C.mcGray400,
          fontFamily: "'Helvetica Neue', sans-serif", transition: "all 0.2s",
        }}>{v.label}</button>
      ))}
    </div>
  );
}

// Step indicator
function StepBar({ step, onReset }) {
  const steps = [{ n: 1, l: "mc.com (Pre-Auth)" }, { n: 2, l: "Login / Sign Up" }, { n: 3, l: "In-App (Post-Auth)" }];
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: "rgba(36,28,21,0.95)", backdropFilter: "blur(8px)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.mcYellow, fontFamily: "'Helvetica Neue', sans-serif", textTransform: "uppercase", letterSpacing: 1, marginRight: 12 }}>Prototype</span>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: step === s.n ? C.mcYellow : step > s.n ? C.successGreen : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
            {step > s.n ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> : <span style={{ fontSize: 11, fontWeight: 700, color: step === s.n ? C.mcBlack : C.mcGray400 }}>{s.n}</span>}
          </div>
          <span style={{ fontSize: 12, fontWeight: step === s.n ? 600 : 400, color: step === s.n ? C.mcWhite : C.mcGray400, fontFamily: "'Helvetica Neue', sans-serif" }}>{s.l}</span>
          {i < 2 && <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />}
        </div>
      ))}
      <button onClick={onReset} style={{ marginLeft: 20, padding: "4px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: C.mcGray400, fontSize: 11, cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif" }}>Reset</button>
    </div>
  );
}

// Main app
export default function App() {
  const [screen, setScreen] = useState("homepage");
  const [scenario, setScenario] = useState(null);
  const [view, setView] = useState("today");

  const reset = () => { setScreen("homepage"); setScenario(null); setView("today"); };

  if (screen === "login") {
    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <StepBar step={2} onReset={reset} />
        <div style={{ paddingTop: 42, height: "100%" }}>
          <LoginScreen onComplete={() => { setView("today"); setScreen("postauth"); }} isNewUser={scenario?.isNewUser} />
        </div>
      </div>
    );
  }

  if (screen === "postauth") {
    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <StepBar step={3} onReset={reset} />
        <div style={{
          position: "fixed", top: 42, left: 0, right: 0, zIndex: 190,
          background: C.mcWhite, borderBottom: `1px solid ${C.mcGray200}`,
          padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.mcGray600, fontFamily: "'Helvetica Neue', sans-serif" }}>Post-login experience:</span>
          <ViewToggle view={view} onChange={setView} />
        </div>
        <div style={{ paddingTop: 84, height: "calc(100% - 84px)" }}>
          <AppShell scenario={scenario} topRight={null}>
            <MainContent scenario={scenario} />
            {view === "today" ? <DAPanelToday key={"today-" + scenario.id} scenario={scenario} /> : <DAPanelProposed key={"proposed-" + scenario.id} scenario={scenario} />}
          </AppShell>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative" }}>
      <StepBar step={1} onReset={reset} />
      <div style={{ paddingTop: 42, height: "calc(100% - 42px)", overflow: "auto" }}>
        <McHeader onSignUp={() => setScreen("login")} />
        <McHero />
        <div style={{ background: C.mcCoconut, padding: "60px 48px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 28, fontWeight: 700, color: C.mcBlack, margin: "0 0 16px" }}>Email marketing that drives real results</h2>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 15, color: C.mcGray600, lineHeight: 1.6, maxWidth: 600 }}>Whether you're just getting started or scaling your business, Mailchimp gives you the tools to reach your customers and grow your revenue.</p>
          </div>
        </div>
      </div>
      {screen === "homepage" && <ChatFAB onClick={() => setScreen("chat-pick")} />}
      {screen === "chat-pick" && <ScenarioPicker onPick={(s) => { setScenario(s); setScreen("chat-conv"); }} />}
      {screen === "chat-conv" && scenario && <PreAuthChat scenario={scenario} visible={true} onCTA={() => setScreen("login")} />}
    </div>
  );
}
