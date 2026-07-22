import { useState, useEffect, useRef } from "react";

// ── Design tokens ───────────────────────────────────────────────
// Concept: "engineer's notebook, after dark" — warm charcoal (not cold
// black), soft off-white ink, one indigo accent + mint signal. The diary
// warmth lives in the voice; the dark palette stays editorial, not neon.
const C = {
  bg: "#12131A",
  bgSoft: "#181A23",
  card: "#1C1F2A",
  ink: "#ECEBE6",
  soft: "#A0A2AD",
  faint: "#6B6E7A",
  line: "#2A2D3A",
  lineSoft: "#22242F",
  accent: "#7C8CF8",     // soft indigo, glows well on dark
  accentSoft: "#7C8CF81E",
  mint: "#3DD68C",
};

const SERIF = "'Fraunces','Georgia',serif";
const SANS = "'Inter','Segoe UI',system-ui,sans-serif";
const MONO = "'JetBrains Mono','SF Mono',Menlo,monospace";
const NAV_OFFSET = 74;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? "auto" : "smooth" });
}

// ── Scroll reveal ───────────────────────────────────────────────
function useReveal(threshold = 0.18) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => reduced());
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, shown];
}

function Reveal({ children, delay = 0, from = "up", style }) {
  const [ref, shown] = useReveal();
  const off = from === "left" ? "translateX(-26px)" : from === "right" ? "translateX(26px)" : "translateY(22px)";
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? "translate(0,0)" : off,
      transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.16,.84,.24,1) ${delay}ms`,
      willChange: "opacity, transform", ...style,
    }}>{children}</div>
  );
}

// ── Word-by-word narrative reveal ───────────────────────────────
function StoryLine({ text, delay = 0 }) {
  const [ref, shown] = useReveal(0.4);
  const words = text.split(" ");
  return (
    <span ref={ref}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block", whiteSpace: "pre",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(8px)",
          transition: `opacity .5s ease ${delay + i * 26}ms, transform .5s ease ${delay + i * 26}ms`,
        }}>{w + " "}</span>
      ))}
    </span>
  );
}

// ── Count-up ────────────────────────────────────────────────────
function CountUp({ value }) {
  const [ref, shown] = useReveal(0.5);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const m = value.match(/[\d.]+/);
    if (!shown || reduced() || !m) {
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }
    const target = parseFloat(m[0]);
    const pre = value.slice(0, m.index), suf = value.slice(m.index + m[0].length);
    let start = null; const dur = 1000;
    let af = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(pre + Math.round(target * eased) + suf);
      if (p < 1) af = requestAnimationFrame(step);
      else setDisplay(value);
    };
    af = requestAnimationFrame(step);
    return () => { if (af !== null) cancelAnimationFrame(af); };
  }, [shown, value]);
  return <span ref={ref}>{display}</span>;
}

// ── Magnetic button (cursor-follow nudge) ───────────────────────
function Magnetic({ children, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (reduced() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={reset}
      style={{ display: "inline-block", transition: "transform .3s cubic-bezier(.16,.84,.24,1)" }} {...rest}>
      {children}
    </span>
  );
}

// ── Data ────────────────────────────────────────────────────────
const NAV_LINKS = [["about", "About"], ["work", "Work"], ["projects", "Projects"], ["stack", "Stack"], ["contact", "Contact"]];

const STATS = [
  { n: "3", l: "years shipping React" },
  { n: "4", l: "companies, incl. remote" },
  { n: "6+", l: "products in production" },
  { n: "~35%", l: "peak load-time cut" },
];

const EXPERIENCE = [
  {
    role: "Software Development Engineer — Frontend",
    org: "Webority Technologies", place: "Gurugram", when: "Nov 2025 — Present",
    blurb: "My current home. I own frontend from design hand-off to production.",
    points: [
      "Rebuilt the corporate site in React, Bootstrap & ASP.NET — pages load ~35% faster and hold up across every screen size.",
      "Shipped Dealyards, a full client-facing business platform, end-to-end — turnaround on new features dropped ~25%.",
      "Introduced lazy loading + Webpack code splitting for a ~30% Lighthouse lift, and wrote Jest + RTL tests for the UI that matters most.",
    ],
    tech: ["HTML","CSS","JavaScript","React.js", "Bootstrap", "ASP.NET", "Webpack", "RTL"],
  },
  {
    role: "Software Developer — Frontend",
    org: "Skyline Solution", place: "Saudi Arabia (Remote)", when: "Apr 2025 — Nov 2025",
    blurb: "Where I learned to build enterprise tools people use all day.",
    points: [
      "Built two enterprise apps — a CRM and an HRM — in React + Tailwind, cutting task time ~20%.",
      "Wired Redux Toolkit + React Query for state and async data, trimming redundant API calls ~30%.",
      "Tuned Parcel tree-shaking with useMemo / React.memo — ~25% smaller bundles, far fewer re-renders.",
    ],
    tech: ["HTML","CSS","JavaScript","React.js", "Redux Toolkit", "React Query", "Tailwind", "Parcel"],
  },
  {
    role: "Software Developer — Full-Stack",
    org: "Tapmo India Pvt Ltd", place: "Noida", when: "Jul 2024 — Apr 2025",
    blurb: "My first industry role — and where full-stack clicked for me.",
    points: [
      "Built a full-stack digital business-card app in React + Node; a smoother onboarding flow lifted sign-ups ~20%.",
      "Used React Router and a mobile-first architecture to make navigation ~30% faster.",
    ],
    tech: ["HTML","CSS","JavaScript","React.js", "React Router", "Node.js", "MySQL", "Redux"],
  },
  {
    role: "Java Trainee",
    org: "Centum Foundation", place: "Noida", when: "Nov 2022 — Sep 2023",
    blurb: "Where it all started — my first real lines of Java code.",
    points: [
      "Completed an intensive Java training program covering core Java, OOP fundamentals, and basic data structures.",
      "Built two Java projects from the ground up, applying collections, exception handling, and file I/O.",
      "Practiced debugging, version control, and writing clean, maintainable code under mentor guidance.",
    ],
    tech: ["Java", "OOP", "Data Structures", "Git", "Eclipse"],
  },
];

const PROJECTS = [
  {
    name: "Dealyards", tag: "Business Platform", url: "dealyards.in", year: "2025",
    desc: "Designed and built the whole responsive UI end-to-end — a reusable component library, pixel-perfect layouts, and a clean wiring to backend APIs.",
    stack: ["React.js", "Component Library", "REST"], accent: "#df5549",
  },
  {
    name: "Webority Corporate Site", tag: "Company Website", url: "webority.com", year: "2025",
    desc: "Owned from design to deploy, then hardened it: cross-browser testing and accessibility passes across Chrome, Firefox, Safari and Edge.",
    stack: ["ASP.NET", "Bootstrap", "A11y"], accent: "#6816c0",
  },
  {
    name: "FoodMe", tag: "Food Ordering", url: "foodme.mobi", year: "2024",
    desc: "Frontend work on adaptive layouts that made mobile and tablet feel quick — around a 20% page-load improvement.",
    stack: ["React.js", "Responsive", "Perf"], accent: "#cbb223",
  },
];

const STACK = {
  "I build with": ["React.js", "Next.js", "JavaScript", "Java"],
  "I style with": ["Tailwind CSS", "Bootstrap", "CSS3", "HTML5", "Figma"],
  "I manage state with": ["Redux Toolkit", "Context API"],
  "I ship with": ["Webpack", "Parcel", "Git", "npm"],
  "I store data in": ["MySQL", "REST APIs", "Postman"],
};

// ── Nav ─────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 30);
      const mid = window.scrollY + window.innerHeight * 0.35;
      let cur = "";
      for (const [id] of NAV_LINKS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= mid) cur = id;
      }
      setActive(cur);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px clamp(20px,5vw,72px)",
      background: scrolled ? "rgba(18,19,26,.82)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: `1px solid ${scrolled ? C.line : "transparent"}`,
      transition: "all .3s ease",
    }}>
      <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" }); }}
        style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 19, color: C.ink, textDecoration: "none", fontStyle: "italic" }}>
        Riya<span style={{ color: C.accent }}>.</span>
      </a>
      <div style={{ display: "flex", gap: "clamp(12px,2.5vw,30px)", alignItems: "center" }}>
        {NAV_LINKS.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToId(id); }} className="navlink"
            style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, textDecoration: "none",
              color: active === id ? C.ink : C.soft, transition: "color .2s", cursor: "pointer", position: "relative" }}>
            {label}
            <span style={{ position: "absolute", left: 0, bottom: -4, height: 2, borderRadius: 2,
              width: active === id ? "100%" : 0, background: C.accent, transition: "width .28s ease" }} />
          </a>
        ))}
      </div>
    </nav>
  );
}

// ── Aurora backdrop (drifting color fields, dark-theme signature) ─
function Aurora() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-15%", right: "-10%", width: 620, height: 620, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.accent}22, transparent 68%)`, filter: "blur(60px)", animation: "drift1 16s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "-20%", left: "-12%", width: 560, height: 560, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.mint}16, transparent 68%)`, filter: "blur(70px)", animation: "drift2 20s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.4,
        backgroundImage: `radial-gradient(${C.line} 1px, transparent 1px)`, backgroundSize: "28px 28px",
        maskImage: "radial-gradient(circle at 30% 35%, #000, transparent 72%)",
        WebkitMaskImage: "radial-gradient(circle at 30% 35%, #000, transparent 72%)" }} />
    </div>
  );
}

// ── Self-typing code editor card (fills hero right side) ────────
const CODE_LINES = [
  { t: "const", k: "engineer", eq: " = {", plain: true },
  { indent: 1, key: "name", val: "'Riya Sharma'" },
  { indent: 1, key: "role", val: ["'Frontend Engineer'", "'React Developer'" ]},
  { indent: 1, key: "location", val: "'Noida, India'" },
  { indent: 1, key: "focus", arr: ["'responsive'", "'performance'", "'accessibility'"] },
  { indent: 1, key: "stack", arr: ["'JavaScript'", "'React.js'", "'Next.js'" ] },
  { indent: 1, key: "available", bool: "true" },
  { close: "};" },
];

function CodeCard() {
  const [ref, shown] = useReveal(0.3);
  const [count, setCount] = useState(() => reduced() ? CODE_LINES.length : 0); // how many lines revealed
  useEffect(() => {
    if (!shown || reduced()) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= CODE_LINES.length) clearInterval(id);
    }, 320);
    return () => clearInterval(id);
  }, [shown]);

  const renderLine = (l, idx) => {
    const pad = { paddingLeft: (l.indent || 0) * 20 };
    let content;
    if (l.plain) content = (<><span style={{ color: C.accent }}>{l.t}</span> <span style={{ color: C.ink }}>{l.key}</span><span style={{ color: C.soft }}>{l.eq}</span></>);
    else if (l.close) content = <span style={{ color: C.soft }}>{l.close}</span>;
    else if (l.arr) content = (<><span style={{ color: "#7FD1E8" }}>{l.key}</span><span style={{ color: C.soft }}>: [</span><span style={{ color: C.mint }}>{l.arr.join(", ")}</span><span style={{ color: C.soft }}>],</span></>);
    else if (l.bool) content = (<><span style={{ color: "#7FD1E8" }}>{l.key}</span><span style={{ color: C.soft }}>: </span><span style={{ color: "#F5A524" }}>{l.bool}</span><span style={{ color: C.soft }}>,</span></>);
    else content = (<><span style={{ color: "#7FD1E8" }}>{l.key}</span><span style={{ color: C.soft }}>: </span><span style={{ color: C.mint }}>{l.val}</span><span style={{ color: C.soft }}>,</span></>);
    const visible = idx < count;
    return (
      <div key={idx} style={{ ...pad, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity .25s ease, transform .25s ease", minHeight: 24, display: "flex", alignItems: "center" }}>
        <span style={{ color: C.faint, width: 26, flexShrink: 0, userSelect: "none", fontSize: 12 }}>{idx + 1}</span>
        <span>{content}</span>
        {idx === count - 1 && count < CODE_LINES.length && <span style={{ color: C.accent, animation: "blink 1s step-end infinite", marginLeft: 2 }}>▋</span>}
      </div>
    );
  };

  return (
    <div ref={ref} className="rise" style={{ animationDelay: "300ms", position: "relative" }}>
      {/* glow behind card */}
      <div aria-hidden style={{ position: "absolute", inset: -1, borderRadius: 16,
        background: `linear-gradient(135deg, ${C.accent}55, transparent 40%, ${C.mint}33)`, filter: "blur(2px)", opacity: 0.6 }} />
      <div style={{ position: "relative", background: "#0F1017", border: `1px solid ${C.line}`, borderRadius: 15,
        boxShadow: "0 30px 60px -30px rgba(0,0,0,.8)", overflow: "hidden" }}>
        {/* title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${C.line}`, background: C.bgSoft }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.faint, marginLeft: 8 }}>riya.js</span>
        </div>
        {/* code body */}
        <div style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.7, padding: "18px 16px", color: C.ink }}>
          {CODE_LINES.map(renderLine)}
        </div>
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────
function Hero() {
  return (
    <header id="top" style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "110px clamp(20px,5vw,72px) 80px", position: "relative", overflow: "hidden" }}>
      <Aurora />
      <div className="hero-grid" style={{ position: "relative", width: "100%", maxWidth: 1240, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
        <div>
          <div className="rise" style={{ animationDelay: "0ms", fontFamily: MONO, fontSize: 13, color: C.mint, marginBottom: 26, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.mint, display: "inline-block", animation: "livepulse 2s ease-in-out infinite" }} />
            available for frontend roles
          </div>
          <h1 className="rise" style={{ animationDelay: "100ms", fontFamily: SERIF, fontWeight: 600, lineHeight: 1.05, margin: 0,
            fontSize: "clamp(42px,6vw,80px)", letterSpacing: "-2px", color: C.ink }}>
            Hi, I’m Riya <span style={{ fontStyle: "italic", color: C.accent }}>—</span><br />
           Turning Ideas into<br />
            <span className="shine" style={{ fontStyle: "italic" }}>Realistic Results</span>
          </h1>
          <p className="rise" style={{ animationDelay: "260ms", fontFamily: SANS, fontSize: "clamp(16px,2vw,19px)", lineHeight: 1.7,
            color: C.soft, maxWidth: 520, margin: "28px 0 0" }}>
            Frontend engineer, 3 years in. I care about the boring parts users never notice — load times, re-renders, the button that has to work on every screen. That’s the stuff that makes an interface feel good.
          </p>
          <div className="rise" style={{ animationDelay: "420ms", display: "flex", gap: 14, flexWrap: "wrap", marginTop: 36, alignItems: "center" }}>
            <Magnetic>
              <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToId("projects"); }} className="btn-primary" style={{
                fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none",
                background: C.ink, color: C.bg, padding: "14px 28px", borderRadius: 100, cursor: "pointer",
                display: "inline-block", transition: "background .2s, box-shadow .2s" }}>
                See what I’ve built
              </a>
            </Magnetic>
            <Magnetic>
              <a href="mailto:riyasharmavats2912@gmail.com" className="btn-ghost" style={{
                fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none",
                color: C.ink, padding: "14px 28px", borderRadius: 100, border: `1.5px solid ${C.line}`, cursor: "pointer",
                display: "inline-block", transition: "background .2s, color .2s, border-color .2s" }}>
                Say hello
              </a>
            </Magnetic>
          </div>
          <div className="rise" style={{ animationDelay: "480ms", fontFamily: MONO, fontSize: 12.5, color: C.faint, marginTop: 18 }}>
            usually replies within a day :)
          </div>
        </div>
        <CodeCard />
      </div>
      <div aria-hidden style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
        fontFamily: MONO, fontSize: 11, color: C.faint, textAlign: "center", animation: "bob 2s ease-in-out infinite" }}>
        scroll<br /><span style={{ fontSize: 14 }}>↓</span>
      </div>
    </header>
  );
}

// ── About ───────────────────────────────────────────────────────
const NOW = [
  { label: "Currently", value: "SDE Frontend @ Webority" },
  { label: "Based in", value: "Noida, Uttar Pradesh" },
  { label: "Learning", value: "React Server Components + Next.js" },
  { label: "Off-screen", value: "Chai, side projects, long walks" },
];

function About() {
  return (
    <section id="about" style={{ padding: "90px clamp(20px,5vw,72px)", maxWidth: 1180, margin: "0 auto", scrollMarginTop: NAV_OFFSET }}>
      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "clamp(32px,5vw,64px)", alignItems: "start" }}>
        {/* left rail — sticky */}
        <div className="about-rail" style={{ position: "sticky", top: 100 }}>
          <Reveal>
            <div style={{ fontFamily: MONO, fontSize: 13, color: C.accent, marginBottom: 18 }}>a little about me →</div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(28px,3.5vw,40px)", margin: 0, color: C.ink, letterSpacing: "-1px", lineHeight: 1.1 }}>
              The short<br /><span style={{ fontStyle: "italic", color: C.accent }}>backstory.</span>
            </h2>
            {/* currently panel */}
            <div style={{ marginTop: 32, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden", background: C.card }}>
              {NOW.map((row, i) => (
                <div key={row.label} style={{ padding: "14px 18px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontFamily: SANS, fontSize: 14.5, color: C.ink, lineHeight: 1.4 }}>{row.value}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* right — story + stats */}
        <div>
          <div style={{ fontFamily: SERIF, fontSize: "clamp(22px,2.8vw,30px)", lineHeight: 1.55, color: C.ink, fontWeight: 400 }}>
            <p style={{ margin: "0 0 26px" }}>
              <StoryLine text="I didn’t start with a grand plan. I started with a curiosity for how things on a screen actually get built — and a stubborn refusal to accept “it just works” without knowing why." />
            </p>
            <p style={{ margin: "0 0 26px" }}>
              <StoryLine text="That curiosity turned into a Java traineeship, an MCA, and then real work: four companies, two countries, and a habit of asking what a slow page is hiding." delay={60} />
            </p>
            <p style={{ margin: 0 }}>
              <StoryLine text="Three years later, I’m still chasing the same thing — interfaces that are quick, accessible, and quietly reliable. The kind you don’t think about, because they never get in your way." delay={120} />
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", alignItems: "stretch", gap: 1, marginTop: 48,
            background: C.line, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
            {STATS.map((s, i) => (
              <Reveal key={s.l} delay={i * 80} style={{ minHeight: "100%", display: "flex" }}>
                <div className="stack-row" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", background: C.card, padding: "24px 20px", transition: "background .25s" }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 38, color: C.ink, letterSpacing: "-1px", lineHeight: 1 }}>
                    <CountUp value={s.n} />
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: C.soft, marginTop: 8, lineHeight: 1.4 }}>{s.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ label, title, note }) {
  return (
    <Reveal>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: C.accent, marginBottom: 14 }}>{label}</div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(30px,5vw,44px)", margin: 0, color: C.ink, letterSpacing: "-1px" }}>{title}</h2>
        {note && <p style={{ fontFamily: SANS, fontSize: 16, color: C.soft, marginTop: 12, maxWidth: 520, lineHeight: 1.6 }}>{note}</p>}
      </div>
    </Reveal>
  );
}

// ── Work ────────────────────────────────────────────────────────
function Work() {
  return (
    <section id="work" style={{ padding: "80px clamp(20px,5vw,72px)", maxWidth: 900, margin: "0 auto", scrollMarginTop: NAV_OFFSET }}>
      <SectionHead label="01 — where I’ve worked" title="Three years, four teams" note="Each stop taught me something the last one couldn’t. Here’s the short version." />
      <div style={{ position: "relative" }}>
        <div aria-hidden style={{ position: "absolute", left: 6, top: 10, bottom: 10, width: 2, background: C.line }} />
        {EXPERIENCE.map((e, i) => (
          <Reveal key={e.org} delay={i * 70} from="left">
            <div style={{ display: "flex", gap: 26, marginBottom: 46 }}>
              <div style={{ position: "relative", flexShrink: 0, marginTop: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.bg, border: `3px solid ${C.accent}`, boxShadow: `0 0 0 4px ${C.bg}`, animation: "pulse 2.6s ease-in-out infinite" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, marginBottom: 6 }}>{e.when} · {e.place}</div>
                <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 19, margin: 0, color: C.ink }}>{e.role}</h3>
                <div style={{ fontFamily: SANS, fontSize: 14.5, color: C.accent, margin: "3px 0 6px", fontWeight: 500 }}>{e.org}</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: C.soft, marginBottom: 16 }}>{e.blurb}</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {e.points.map((p, j) => (
                    <li key={j} style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.62, color: C.soft, marginBottom: 9, paddingLeft: 22, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 1, color: C.accent }}>→</span>{p}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                  {e.tech.map((t) => (
                    <span key={t} style={{ fontFamily: MONO, fontSize: 12, color: C.soft, background: C.bgSoft, border: `1px solid ${C.line}`, padding: "4px 10px", borderRadius: 6 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Projects ────────────────────────────────────────────────────
function ProjectRow({ p, i }) {
  const [hover, setHover] = useState(false);
  return (
    <Reveal delay={i * 80}>
      <a href={`https://${p.url}`} target="_blank" rel="noreferrer"
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: "block", textDecoration: "none", borderTop: `1px solid ${C.line}`, padding: "34px 0",
          position: "relative", transition: "padding-left .35s ease", paddingLeft: hover ? 20 : 0 }}>
        {/* sweep-in accent bar */}
        <span aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: 3,
          background: p.accent, transform: hover ? "scaleY(1)" : "scaleY(0)", transformOrigin: "top",
          transition: "transform .35s cubic-bezier(.16,.84,.24,1)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(24px,3.5vw,32px)", margin: 0,
                color: hover ? p.accent : C.ink, transition: "color .25s", letterSpacing: "-0.5px" }}>{p.name}</h3>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.faint }}>{p.year}</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: p.accent, marginBottom: 12 }}>{p.tag}</div>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.65, color: C.soft, margin: "0 0 14px", maxWidth: 560 }}>{p.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.stack.map((s) => (
                <span key={s} style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, background: C.bgSoft, padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.line}` }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 13,
            color: hover ? p.accent : C.faint, transition: "color .25s, transform .3s", transform: hover ? "translateX(4px)" : "none" }}>
            {p.url} <span style={{ fontSize: 17 }}>↗</span>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

function Projects() {
  return (
    <section id="projects" style={{ padding: "80px clamp(20px,5vw,72px)", maxWidth: 960, margin: "0 auto", scrollMarginTop: NAV_OFFSET }}>
      <SectionHead label="02 — selected work" title="A few things I’m proud of" note="Live products, built mostly frontend-first. Tap any to visit." />
      <div>
        {PROJECTS.map((p, i) => <ProjectRow key={p.name} p={p} i={i} />)}
        <div style={{ borderTop: `1px solid ${C.line}` }} />
      </div>
    </section>
  );
}

// ── Stack ───────────────────────────────────────────────────────
function Stack() {
  return (
    <section id="stack" style={{ padding: "80px clamp(20px,5vw,72px)", maxWidth: 900, margin: "0 auto", scrollMarginTop: NAV_OFFSET }}>
      <SectionHead label="03 — my toolbox" title="My Tech Universe" />
      <div style={{ display: "grid", gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
        {Object.entries(STACK).map(([cat, items], i) => (
          <Reveal key={cat} delay={i * 60}>
            <div className="stack-row" style={{ background: C.card, padding: "22px 26px", display: "flex", gap: 24, alignItems: "baseline", flexWrap: "wrap", transition: "background .25s" }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: C.ink, minWidth: 190, flexShrink: 0 }}>{cat}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {items.map((t) => (
                  <span key={t} className="skill-chip" style={{ fontFamily: MONO, fontSize: 13, color: C.soft, background: C.bgSoft,
                    border: `1px solid ${C.line}`, padding: "5px 12px", borderRadius: 8, transition: "color .2s, border-color .2s, transform .2s, box-shadow .2s", cursor: "default" }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <div style={{ marginTop: 26, fontFamily: SANS, fontSize: 14, color: C.soft, textAlign: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.faint }}>education —</span>{"  "}
          MCA, Galgotia College (2023–25) · BCA, IIMT College (2020–23)
        </div>
      </Reveal>
    </section>
  );
}

// ── Contact ─────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" style={{ padding: "90px clamp(20px,5vw,72px) 70px", maxWidth: 760, margin: "0 auto", textAlign: "center", scrollMarginTop: NAV_OFFSET }}>
      <Reveal>
        <div style={{ fontFamily: MONO, fontSize: 13, color: C.accent, marginBottom: 20 }}>04 — say hello</div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(34px,6.5vw,58px)", margin: 0, color: C.ink, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
          Let’s build something<br /><span className="shine" style={{ fontStyle: "italic" }}>worth using.</span>
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 17, color: C.soft, maxWidth: 440, margin: "22px auto 36px", lineHeight: 1.7 }}>
          I’m open to frontend and full-stack roles. If you’ve got an interface that needs to be fast and feel right, I’d love to hear about it.
        </p>
        <Magnetic>
          <a href="mailto:riyasharmavats2912@gmail.com" className="btn-primary" style={{
            fontFamily: SANS, fontSize: 16, fontWeight: 600, textDecoration: "none",
            background: C.ink, color: C.bg, padding: "16px 34px", borderRadius: 100, display: "inline-block",
            transition: "background .2s, box-shadow .2s" }}>
            riyasharmavats2912@gmail.com
          </a>
        </Magnetic>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          {[["LinkedIn", "https://linkedin.com/in/riya-sharma-99178a305"], ["+91 73036 44827", "tel:+917303644827"], ["Noida, UP", null]].map(([label, href]) => (
            href
              ? <a key={label} href={href} target="_blank" rel="noreferrer" className="navlink" style={{ fontFamily: MONO, fontSize: 13, color: C.soft, textDecoration: "none" }}>{label}</a>
              : <span key={label} style={{ fontFamily: MONO, fontSize: 13, color: C.faint }}>{label}</span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default function App() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: ${C.bg}; }
        @keyframes bob { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(6px); } }
        @keyframes livepulse { 0%,100% { box-shadow: 0 0 0 0 ${C.mint}66; } 50% { box-shadow: 0 0 0 6px ${C.mint}00; } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 4px ${C.bg}, 0 0 0 6px ${C.accent}00; } 50% { box-shadow: 0 0 0 4px ${C.bg}, 0 0 0 9px ${C.accent}33; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,40px) scale(1.08); } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.1); } }
        @keyframes shimmer { to { background-position: 200% center; } }
        @keyframes blink { 50% { opacity: 0; } }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .about-grid { grid-template-columns: 1fr !important; }
          .about-rail { position: static !important; }
        }
        .rise { opacity: 0; animation: riseIn .8s cubic-bezier(.16,.84,.24,1) forwards; }
        .shine {
          background: linear-gradient(100deg, ${C.ink} 20%, ${C.accent} 40%, ${C.mint} 55%, ${C.ink} 75%);
          background-size: 200% auto; -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; animation: shimmer 6s linear infinite;
        }
        .navlink:hover { color: ${C.ink} !important; }
        .btn-primary:hover { box-shadow: 0 0 0 1px ${C.accent}, 0 12px 30px -12px ${C.accent}aa; }
        .btn-ghost:hover { background: ${C.ink} !important; color: ${C.bg} !important; border-color: ${C.ink} !important; }
        .skill-chip:hover { color: ${C.accent} !important; border-color: ${C.accent} !important; transform: translateY(-2px); box-shadow: 0 6px 16px -8px ${C.accent}88; }
        .stack-row:hover { background: ${C.bgSoft} !important; }
        a:focus-visible, [href]:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 3px; border-radius: 4px; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; scroll-behavior: auto !important; transition: none !important; }
          .rise { opacity: 1 !important; transform: none !important; }
          .shine { -webkit-text-fill-color: ${C.ink}; color: ${C.ink}; }
        }
      `}</style>
      <Nav />
      <Hero />
      <About />
      <Work />
      <Projects />
      <Stack />
      <Contact />
      <footer style={{ textAlign: "center", padding: "34px", borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 12, color: C.faint }}>
        Designed & built by Riya Sharma · © 2026
      </footer>
    </div>
  );
}