import { useState, useEffect, useRef, useCallback } from "react";

// ─── Colour system ────────────────────────────────────────────────────────────
const T = {
  navy:    "#0D2B4E",
  navy2:   "#1C3F62",
  steel:   "#2E5F8A",
  sky:     "#3A88C5",
  sky2:    "#60A8D8",
  ice:     "#E4F1FB",
  white:   "#FFFFFF",
  off:     "#F6F9FC",
  border:  "#D0E3F0",
  text:    "#1A2E40",
  muted:   "#6B8899",
  amber:   "#D4860A",
  amberBg: "#FEF3E2",
  green:   "#1E7A4A",
  greenBg: "#E8F5EE",
  red:     "#B52B27",
};

const DISC_COLORS = {
  MECH:   { bg:"#E8F4F8", fg:"#0B6E8C", border:"#0B6E8C" },
  ELEC:   { bg:"#FEF6E4", fg:"#8B5E00", border:"#E8A020" },
  STRUCT: { bg:"#F0EAF8", fg:"#5B3FA0", border:"#8B6FD0" },
  ARCH:   { bg:"#E8F5EE", fg:"#1E7A4A", border:"#34A871" },
  AFS:    { bg:"#FDECEA", fg:"#8B1A1A", border:"#C0392B" },
  BMS:    { bg:"#F0F4F8", fg:"#2E4A6A", border:"#5A7A9A" },
};

const DOC_ICONS = {
  RELAZIONE:   "📄",
  COMPUTO:     "🔢",
  TAVOLA:      "📐",
  OFFERTA:     "💰",
  CONTRATTO:   "📋",
  CAPITOLATO:  "📑",
  VERBALE:     "🗒️",
  DEFAULT:     "📁",
};

// ─── Mock corpus (simulates S3/FSx documents) ─────────────────────────────────
const CORPUS = [
  { id:"d01", project:"ALB-20250001", lot:"ALB-20250001-01", sector:"ALB", phase:"WIP",    disc:"MECH",   type:"RELAZIONE",  rev:"B", author:"Ing. Bianchi",  file:"REL_HVAC_VRF_rev_B.pdf",        path:"ALB/ALB-20250001/ALB-20250001-01/WIP/MECH/",   date:"2025-11-15", classification:"Internal",     snippet:"Sistema HVAC a pompa di calore VRF per hotel 220 camere. COP stagionale stimato 4.2. Potenza frigorifera totale 680 kW. Distribuzione a fan coil quattro tubi con recupero entalpico centralizzato. Livelli sonori ambienti < 35 dB(A)." },
  { id:"d02", project:"ALB-20250001", lot:"ALB-20250001-01", sector:"ALB", phase:"WIP",    disc:"MECH",   type:"RELAZIONE",  rev:"A", author:"Ing. Bianchi",  file:"CAL_SPRINKLER_EN12845_rev_A.pdf", path:"ALB/ALB-20250001/ALB-20250001-01/WIP/MECH/", date:"2025-10-03", classification:"Internal",     snippet:"Calcolo idraulico impianto sprinkler a norma EN 12845. Classificazione rischio ordinario gruppo 2. Portata di progetto 5 l/min/m². Rete ad umido con alimentazione doppia da cisterna 120 m³ e acquedotto." },
  { id:"d03", project:"ALB-20250001", lot:"ALB-20250001-02", sector:"ALB", phase:"ISSUED", disc:"ELEC",   type:"COMPUTO",    rev:"C", author:"Ing. Ferrari",  file:"CME_ELETTRICO_rev_C.xlsx",       path:"ALB/ALB-20250001/ALB-20250001-02/ISSUED/ELEC/",date:"2025-12-01", classification:"Confidential", snippet:"Computo metrico estimativo impianto elettrico: MT/BT, distribuzione, forza motrice, illuminazione, EVSE per ricarica EV. Totale imponibile €2.340.000 + IVA. Quadri elettrici ABB Emax 2 con comunicazione Modbus." },
  { id:"d04", project:"ALB-20250002", lot:"ALB-20250002-01", sector:"ALB", phase:"WIP",    disc:"MECH",   type:"RELAZIONE",  rev:"A", author:"Ing. Rossi",    file:"REL_MEP_5stelle_rev_A.pdf",      path:"ALB/ALB-20250002/ALB-20250002-01/WIP/MECH/",  date:"2026-01-10", classification:"Internal",     snippet:"Relazione impiantistica preliminare hotel 5 stelle lusso 180 camere. Sistema idronico a quattro tubi con chiller ad alta efficienza EER 6.8. Deumidificazione radiante Zehnder. Piscina interna con impianto di trattamento acqua Myrtha." },
  { id:"d05", project:"ALB-20250002", lot:"ALB-20250002-01", sector:"ALB", phase:"WIP",    disc:"ELEC",   type:"RELAZIONE",  rev:"B", author:"Ing. Ferrari",  file:"REL_ELETTRICA_5stelle_rev_B.pdf", path:"ALB/ALB-20250002/ALB-20250002-01/WIP/ELEC/", date:"2026-01-20", classification:"Internal",     snippet:"Impianto elettrico hotel 5 stelle: potenza impegnata 2.800 kW, connessione MT 15 kV con cabina di trasformazione dedicata 3.000 kVA. Sistema UPS centralizzato 500 kVA per carichi critici. BMS Siemens Desigo CC." },
  { id:"d06", project:"RSA-20250003", lot:"RSA-20250003-01", sector:"RSA", phase:"WIP",    disc:"MECH",   type:"RELAZIONE",  rev:"A", author:"Ing. Colombo",  file:"REL_GAS_MEDICALI_rev_A.pdf",    path:"RSA/RSA-20250003/RSA-20250003-01/WIP/MECH/",  date:"2025-09-18", classification:"Internal",     snippet:"Impianto gas medicali per RSA 120 posti letto conforme UNI EN ISO 7396-1. Distribuzione ossigeno medicale con centrale criogenica O₂ 6.000 L, vuoto medicale doppia pompa Busch, aria medicale compressa 4 bar. Pannelli di servizio DRÄGER." },
  { id:"d07", project:"RSA-20250003", lot:"RSA-20250003-01", sector:"RSA", phase:"ADMIN",  disc:"MECH",   type:"CONTRATTO",  rev:"0", author:"Uff. Contratti", file:"CONTRATTO_APPALTO_RSA003.pdf",  path:"RSA/RSA-20250003/RSA-20250003-01/ADMIN/",     date:"2025-08-01", classification:"Restricted",   snippet:"Contratto di appalto impianti meccanici RSA Bergamo. Importo contrattuale €1.840.000 comprensivo di oneri sicurezza €42.000. Durata lavori 14 mesi. Penali ritardo €800/giorno. DL Ing. Colombo, CSE Geom. Negri." },
  { id:"d08", project:"ALB-20250001", lot:"ALB-20250001-01", sector:"ALB", phase:"WIP",    disc:"STRUCT", type:"RELAZIONE",  rev:"A", author:"Ing. Martini",  file:"REL_STRUTTURALE_rev_A.pdf",     path:"ALB/ALB-20250001/ALB-20250001-01/WIP/STRUCT/",date:"2025-10-22", classification:"Internal",     snippet:"Relazione strutturale per hotel in acciaio 8 piani fuori terra. Telai in acciaio S355 con controventi concentrici. Fondazioni su pali Ø600 mm profondi 22 m in terreno argilloso. Verifica sismica NTC2018 zona 2. SAP2000 v24." },
  { id:"d09", project:"ALB-20250001", lot:"ALB-20250001-01", sector:"ALB", phase:"WIP",    disc:"AFS",    type:"RELAZIONE",  rev:"A", author:"Ing. Russo",    file:"REL_ANTINCENDIO_rev_A.pdf",     path:"ALB/ALB-20250001/ALB-20250001-01/WIP/AFS/",   date:"2025-11-08", classification:"Internal",     snippet:"Relazione antincendio albergo >100 posti letto ai sensi del DM 9/4/1994. Compartimentazione REI 60. Scale di sicurezza a prova di fumo. Sistema rivelazione ESSER by Honeywell con CCS ridondante. Impianto evacuazione EVAC 100V." },
  { id:"d10", project:"ALB-20250002", lot:"ALB-20250002-01", sector:"ALB", phase:"WIP",    disc:"MECH",   type:"COMPUTO",    rev:"A", author:"Ing. Bianchi",  file:"CME_MEP_5stelle_rev_A.xlsx",    path:"ALB/ALB-20250002/ALB-20250002-01/WIP/MECH/",  date:"2026-02-01", classification:"Confidential", snippet:"Computo metrico estimativo impianti meccanici hotel 5 stelle. Climatizzazione €980.000, idraulica €420.000, antincendio €310.000, gas medicali n.a. Totale MEP meccanici €1.710.000. Prezzi da listino DEI 2025 + 8% utili." },
];

const SUGGESTED = [
  "HVAC requirements 4-star hotel",
  "sprinkler system EN 12845 hydraulic calculation",
  "electrical distribution hotel 5 stars",
  "medical gas RSA oxygen installation",
  "fire resistance steel structure seismic",
  "MEP cost estimate hotel",
];

// ─── Claude API call (simulates Bedrock KB RetrieveAndGenerate) ───────────────
async function callBedrock(query, docs) {
  const docContext = docs.slice(0, 5).map((d, i) =>
    `[Source ${i+1}: ${d.file} | Project: ${d.project} | Discipline: ${d.disc} | Classification: ${d.classification}]\n${d.snippet}`
  ).join("\n\n");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are the AEDE Engineering Knowledge Base, powered by Amazon Bedrock Knowledge Bases (Scenario B POC).
You assist engineers at AEDE (600+ staff) with queries about AEC projects.
Respond ONLY in the same language as the user's query (Italian if Italian, English if English).
Be precise, technical, and reference the source documents.
Format: 2-3 sentences of direct answer, then "Based on:" with up to 3 document references.
Keep responses concise and actionable for engineers.`,
      messages: [{
        role: "user",
        content: `Query: "${query}"\n\nRelevant documents from the knowledge base:\n\n${docContext}\n\nProvide a grounded answer with source citations.`
      }]
    })
  });
  const data = await resp.json();
  return data.content?.[0]?.text || "Unable to generate answer.";
}

// ─── Search logic (simulates KB retrieval) ────────────────────────────────────
function searchDocs(query, filters) {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 2);

  return CORPUS
    .filter(d => {
      if (filters.sector && d.sector !== filters.sector) return false;
      if (filters.disc   && d.disc   !== filters.disc)   return false;
      if (filters.type   && d.type   !== filters.type)   return false;
      if (filters.project && d.project !== filters.project) return false;
      return true;
    })
    .map(d => {
      const haystack = [d.snippet, d.file, d.project, d.disc, d.type, d.author, d.path].join(" ").toLowerCase();
      let score = 0;
      terms.forEach(t => {
        const count = (haystack.match(new RegExp(t, "g")) || []).length;
        score += count;
        if (d.snippet.toLowerCase().includes(t)) score += 2;
        if (d.disc.toLowerCase().includes(t))    score += 1;
        if (d.type.toLowerCase().includes(t))    score += 1;
      });
      return { ...d, score };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score);
}

function highlight(text, query) {
  if (!query) return text;
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  let result = text;
  terms.forEach(term => {
    const re = new RegExp(`(${term})`, "gi");
    result = result.replace(re, "|||$1|||");
  });
  return result.split("|||").map((part, i) =>
    terms.some(t => part.toLowerCase() === t)
      ? <mark key={i} style={{ background:"#FEF3C7", color:"#92400E", padding:"0 1px", borderRadius:2, fontWeight:600 }}>{part}</mark>
      : part
  );
}

// ─── Facet counts ─────────────────────────────────────────────────────────────
function getFacets(results) {
  const sectors = {}, discs = {}, types = {}, projects = {};
  results.forEach(d => {
    sectors[d.sector]  = (sectors[d.sector]  || 0) + 1;
    discs[d.disc]      = (discs[d.disc]      || 0) + 1;
    types[d.type]      = (types[d.type]      || 0) + 1;
    projects[d.project]= (projects[d.project]|| 0) + 1;
  });
  return { sectors, discs, types, projects };
}

// ─── Components ───────────────────────────────────────────────────────────────
function DisciplineBadge({ disc }) {
  const c = DISC_COLORS[disc] || DISC_COLORS.BMS;
  return (
    <span style={{
      display:"inline-block", padding:"1px 8px", borderRadius:99,
      fontSize:11, fontWeight:700, letterSpacing:"0.05em",
      background:c.bg, color:c.fg, border:`1px solid ${c.border}`,
    }}>{disc}</span>
  );
}

function ClassBadge({ cls }) {
  const map = {
    Public:       { bg:"#E8F5EE", fg:"#1E7A4A" },
    Internal:     { bg:T.ice,     fg:T.steel    },
    Confidential: { bg:"#FEF6E4", fg:"#8B5E00"  },
    Restricted:   { bg:"#FDECEA", fg:"#8B1A1A"  },
  };
  const c = map[cls] || map.Internal;
  return (
    <span style={{ fontSize:10, fontWeight:600, color:c.fg, background:c.bg,
      padding:"1px 7px", borderRadius:99, whiteSpace:"nowrap" }}>{cls}</span>
  );
}

function DocCard({ doc, query, onClick }) {
  const icon = DOC_ICONS[doc.type] || DOC_ICONS.DEFAULT;
  return (
    <div
      onClick={onClick}
      style={{
        background:T.white, border:`1px solid ${T.border}`,
        borderRadius:10, padding:"14px 18px", marginBottom:10,
        cursor:"pointer", transition:"box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.10)"; e.currentTarget.style.borderColor=T.sky; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=T.border; }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:6 }}>
        <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
            <span style={{
              fontFamily:"'DM Mono', monospace", fontSize:12, fontWeight:600,
              color:T.steel, wordBreak:"break-all",
            }}>{doc.file}</span>
            <DisciplineBadge disc={doc.disc} />
            <ClassBadge cls={doc.classification} />
          </div>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:T.muted, marginBottom:6 }}>
            {doc.path}{doc.file}
          </div>
          <p style={{ margin:0, fontSize:13.5, color:T.text, lineHeight:1.55 }}>
            {highlight(doc.snippet, query)}
          </p>
        </div>
      </div>
      <div style={{ display:"flex", gap:14, marginTop:8, paddingTop:8, borderTop:`1px solid ${T.border}`, flexWrap:"wrap" }}>
        {[
          ["Project", doc.project],
          ["Lot", doc.lot],
          ["Author", doc.author],
          ["Rev.", doc.rev],
          ["Date", doc.date],
          ["Phase", doc.phase],
        ].map(([k,v]) => (
          <span key={k} style={{ fontSize:11, color:T.muted }}>
            <span style={{ fontWeight:600, color:T.text }}>{k}:</span> {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function FacetGroup({ title, items, selected, onSelect }) {
  if (!Object.keys(items).length) return null;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:"0.08em",
        textTransform:"uppercase", marginBottom:8 }}>{title}</div>
      {Object.entries(items).sort((a,b) => b[1]-a[1]).map(([k,v]) => (
        <div key={k}
          onClick={() => onSelect(selected===k ? null : k)}
          style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"4px 8px", borderRadius:6, cursor:"pointer", marginBottom:2,
            background: selected===k ? T.ice : "transparent",
            color: selected===k ? T.steel : T.text,
            fontWeight: selected===k ? 700 : 400,
            fontSize:13,
          }}
          onMouseEnter={e => { if (selected!==k) e.currentTarget.style.background="#F0F4F8"; }}
          onMouseLeave={e => { if (selected!==k) e.currentTarget.style.background="transparent"; }}
        >
          <span>{k}</span>
          <span style={{ fontSize:11, color:T.muted, background:T.border,
            padding:"0 6px", borderRadius:99 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function RAGAnswer({ answer, loading }) {
  if (!answer && !loading) return null;
  return (
    <div style={{
      background:T.amberBg, border:`1px solid #F0C060`,
      borderLeft:`4px solid ${T.amber}`, borderRadius:10,
      padding:"16px 20px", marginBottom:20,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        <span style={{ fontSize:16 }}>✦</span>
        <span style={{ fontSize:12, fontWeight:700, color:T.amber, letterSpacing:"0.06em", textTransform:"uppercase" }}>
          AI Answer — Amazon Bedrock Knowledge Bases
        </span>
      </div>
      {loading ? (
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:7, height:7, borderRadius:"50%", background:T.amber,
              animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
            }}/>
          ))}
        </div>
      ) : (
        <p style={{ margin:0, fontSize:14, color:T.text, lineHeight:1.65, whiteSpace:"pre-wrap" }}>{answer}</p>
      )}
    </div>
  );
}

function SearchBar({ value, onChange, onSearch, onFocus, compact }) {
  const inputRef = useRef();
  useEffect(() => { if (!compact) inputRef.current?.focus(); }, [compact]);

  return (
    <div style={{
      display:"flex", alignItems:"center",
      background:T.white, border:`1.5px solid ${T.border}`,
      borderRadius:compact ? 8 : 28, padding: compact ? "6px 14px" : "12px 20px",
      boxShadow: compact ? "0 1px 4px rgba(0,0,0,0.08)" : "0 2px 12px rgba(0,0,0,0.10)",
      gap:10, transition:"box-shadow 0.2s, border-color 0.2s",
      width: compact ? 540 : "100%", maxWidth: compact ? 540 : 660,
    }}
      onFocus={e => { e.currentTarget.style.borderColor=T.sky; e.currentTarget.style.boxShadow="0 4px 16px rgba(46,95,138,0.15)"; }}
      onBlur={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.boxShadow=compact?"0 1px 4px rgba(0,0,0,0.08)":"0 2px 12px rgba(0,0,0,0.10)"; }}
    >
      <span style={{ color:T.muted, fontSize:18, flexShrink:0 }}>🔍</span>
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key==="Enter" && onSearch()}
        onFocus={onFocus}
        placeholder="Search technical documentation, BIM specs, reports…"
        style={{
          flex:1, border:"none", outline:"none", background:"transparent",
          fontSize: compact ? 14 : 16, color:T.text,
          fontFamily:"'Source Serif 4', Georgia, serif",
        }}
      />
      {value && (
        <button onClick={() => onChange("")}
          style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:16, padding:"0 2px" }}>×</button>
      )}
      <button
        onClick={onSearch}
        style={{
          background:T.navy, color:T.white, border:"none",
          borderRadius: compact ? 6 : 20, padding: compact ? "6px 14px" : "8px 18px",
          fontSize: compact ? 13 : 14, fontWeight:600, cursor:"pointer",
          fontFamily:"inherit", flexShrink:0, transition:"background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background=T.steel}
        onMouseLeave={e => e.currentTarget.style.background=T.navy}
      >Search</button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [query,     setQuery]     = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results,   setResults]   = useState([]);
  const [answer,    setAnswer]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [filters,   setFilters]   = useState({ sector:null, disc:null, type:null, project:null });
  const [showSugg,  setShowSugg]  = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const suggRef = useRef();

  // Close suggestions on outside click
  useEffect(() => {
    const h = e => { if (suggRef.current && !suggRef.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const doSearch = useCallback(async (q = query, f = filters) => {
    if (!q.trim()) return;
    setSubmitted(q);
    setHasSearched(true);
    setSelected(null);
    setAnswer("");
    setShowSugg(false);

    const docs = searchDocs(q, f);
    setResults(docs);

    if (docs.length > 0) {
      setLoading(true);
      try {
        const ans = await callBedrock(q, docs);
        setAnswer(ans);
      } catch { setAnswer("Unable to connect to Bedrock API in this demo environment."); }
      finally { setLoading(false); }
    }
  }, [query, filters]);

  const applyFilter = useCallback((key, val) => {
    const f = { ...filters, [key]: val };
    setFilters(f);
    if (submitted) doSearch(submitted, f);
  }, [filters, submitted, doSearch]);

  const allResults = submitted ? searchDocs(submitted, filters) : [];
  const facets = getFacets(allResults);

  // ── LANDING PAGE ──────────────────────────────────────────────────────────
  if (!hasSearched) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
          * { box-sizing:border-box; margin:0; padding:0; }
          body { font-family:'DM Sans',sans-serif; background:${T.off}; }
          @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          mark { background:#FEF3C7; color:#92400E; padding:0 1px; border-radius:2px; font-weight:600; }
        `}</style>
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>

          {/* Header */}
          <div style={{ background:T.navy, padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:32, height:32, background:T.amber, borderRadius:8,
                display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:T.white, fontSize:16 }}>A</div>
              <div>
                <div style={{ color:T.white, fontWeight:700, fontSize:15, letterSpacing:"-0.01em" }}>AEDE Engineering</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:10 }}>Knowledge Intelligence Platform</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {["POC Scenario B","Bedrock KB","AOSS Serverless"].map(l => (
                <span key={l} style={{ fontSize:10, color:"rgba(255,255,255,0.5)",
                  background:"rgba(255,255,255,0.07)", padding:"3px 10px", borderRadius:99 }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Hero */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"60px 24px", animation:"fadeUp 0.5s ease" }}>

            <div style={{ marginBottom:8, fontSize:12, fontWeight:700, color:T.muted,
              letterSpacing:"0.12em", textTransform:"uppercase" }}>AEC Document Intelligence</div>
            <h1 style={{ fontSize:42, fontWeight:300, color:T.navy, marginBottom:6, textAlign:"center",
              fontFamily:"'Source Serif 4',serif", letterSpacing:"-0.02em", lineHeight:1.2 }}>
              What are you<br/>
              <em style={{ fontWeight:600, fontStyle:"italic" }}>looking for?</em>
            </h1>
            <p style={{ color:T.muted, fontSize:14, marginBottom:36, textAlign:"center", maxWidth:420, lineHeight:1.6 }}>
              Search across all AEDE project documentation — specifications, calculations, BIM reports, contracts.
              Powered by Amazon Bedrock Knowledge Bases.
            </p>

            {/* Search */}
            <div style={{ position:"relative", width:"100%", maxWidth:660 }} ref={suggRef}>
              <SearchBar value={query} onChange={setQuery} onSearch={doSearch} onFocus={() => setShowSugg(true)} compact={false} />

              {/* Suggestions */}
              {showSugg && (
                <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0,
                  background:T.white, border:`1px solid ${T.border}`, borderRadius:12,
                  boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:100, overflow:"hidden" }}>
                  <div style={{ padding:"10px 16px 6px", fontSize:10, fontWeight:700,
                    color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Suggested searches</div>
                  {SUGGESTED.map((s,i) => (
                    <div key={i}
                      onClick={() => { setQuery(s); setShowSugg(false); doSearch(s, filters); }}
                      style={{ padding:"9px 16px", cursor:"pointer", fontSize:14, color:T.text,
                        display:"flex", alignItems:"center", gap:10 }}
                      onMouseEnter={e => e.currentTarget.style.background=T.ice}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      <span style={{ color:T.muted, fontSize:14 }}>🔍</span> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Corpus stats */}
            <div style={{ display:"flex", gap:32, marginTop:40 }}>
              {[
                { v:CORPUS.length, l:"documents indexed" },
                { v:"3", l:"active sectors (ALB, RSA, SCO)" },
                { v:"5", l:"AWS services only" },
              ].map(s => (
                <div key={s.l} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:28, fontWeight:700, color:T.steel,
                    fontFamily:"'Source Serif 4',serif" }}>{s.v}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding:"12px 24px", borderTop:`1px solid ${T.border}`, display:"flex",
            justifyContent:"space-between", alignItems:"center", background:T.white }}>
            <span style={{ fontSize:11, color:T.muted }}>
              Demo corpus · 10 documents · Sectors: ALB, RSA
            </span>
            <span style={{ fontSize:11, color:T.muted }}>
              Amazon Bedrock KB + OpenSearch Serverless · POC Scenario B
            </span>
          </div>
        </div>
      </>
    );
  }

  // ── RESULTS PAGE ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; background:${T.off}; }
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .results-list > * { animation: fadeIn 0.3s ease both; }
        .results-list > *:nth-child(1){animation-delay:0.05s}
        .results-list > *:nth-child(2){animation-delay:0.10s}
        .results-list > *:nth-child(3){animation-delay:0.15s}
        .results-list > *:nth-child(4){animation-delay:0.20s}
        .results-list > *:nth-child(5){animation-delay:0.25s}
        mark { background:#FEF3C7; color:#92400E; padding:0 1px; border-radius:2px; font-weight:600; }
      `}</style>

      {/* Top bar */}
      <div style={{ background:T.navy, padding:"10px 24px", display:"flex",
        alignItems:"center", gap:16, position:"sticky", top:0, zIndex:200,
        boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
          onClick={() => { setHasSearched(false); setQuery(""); setSubmitted(""); }}>
          <div style={{ width:28, height:28, background:T.amber, borderRadius:6,
            display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:T.white, fontSize:14 }}>A</div>
          <span style={{ color:T.white, fontWeight:700, fontSize:14 }}>AEDE</span>
        </div>
        <div style={{ flex:1 }}>
          <SearchBar value={query} onChange={setQuery} onSearch={doSearch} onFocus={() => {}} compact={true} />
        </div>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>
          {allResults.length} result{allResults.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ display:"flex", maxWidth:1200, margin:"0 auto", padding:"24px 20px", gap:28 }}>

        {/* Sidebar */}
        <div style={{ width:210, flexShrink:0 }}>
          {(filters.sector || filters.disc || filters.type || filters.project) && (
            <button
              onClick={() => { setFilters({ sector:null, disc:null, type:null, project:null }); doSearch(submitted, { sector:null, disc:null, type:null, project:null }); }}
              style={{ width:"100%", marginBottom:16, padding:"6px 0", background:"none",
                border:`1px solid ${T.border}`, borderRadius:6, cursor:"pointer",
                fontSize:12, color:T.muted, fontFamily:"inherit" }}
            >Clear filters ×</button>
          )}
          <FacetGroup title="Sector"     items={facets.sectors}  selected={filters.sector}  onSelect={v => applyFilter("sector", v)} />
          <FacetGroup title="Discipline" items={facets.discs}    selected={filters.disc}    onSelect={v => applyFilter("disc", v)} />
          <FacetGroup title="Doc type"   items={facets.types}    selected={filters.type}    onSelect={v => applyFilter("type", v)} />
          <FacetGroup title="Project"    items={facets.projects} selected={filters.project} onSelect={v => applyFilter("project", v)} />
        </div>

        {/* Main content */}
        <div style={{ flex:1, minWidth:0 }}>
          <RAGAnswer answer={answer} loading={loading} />

          {results.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:T.muted }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
              <div style={{ fontSize:16 }}>No documents found for <strong>"{submitted}"</strong></div>
              <div style={{ fontSize:13, marginTop:6 }}>Try different keywords or remove filters</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:12, color:T.muted, marginBottom:14 }}>
                About <strong>{results.length}</strong> result{results.length!==1?"s":""} for{" "}
                <strong style={{ color:T.text }}>"{submitted}"</strong>
                {Object.values(filters).some(Boolean) && " · filtered"}
              </div>
              <div className="results-list">
                {results.map(doc => (
                  <DocCard
                    key={doc.id} doc={doc} query={submitted}
                    onClick={() => setSelected(selected?.id === doc.id ? null : doc)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Document detail panel */}
      {selected && (
        <div style={{
          position:"fixed", right:0, top:0, bottom:0, width:460,
          background:T.white, boxShadow:"-4px 0 24px rgba(0,0,0,0.12)",
          overflowY:"auto", zIndex:300, animation:"fadeIn 0.2s ease",
        }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            position:"sticky", top:0, background:T.white, zIndex:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color:T.navy }}>Document Detail</span>
            <button onClick={() => setSelected(null)} style={{ background:"none", border:"none",
              cursor:"pointer", fontSize:20, color:T.muted, lineHeight:1 }}>×</button>
          </div>
          <div style={{ padding:"20px" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:600,
              color:T.steel, marginBottom:12, wordBreak:"break-all" }}>{selected.file}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              <DisciplineBadge disc={selected.disc} />
              <ClassBadge cls={selected.classification} />
              <span style={{ fontSize:11, color:T.muted, background:T.ice,
                padding:"2px 8px", borderRadius:99 }}>{selected.type}</span>
            </div>

            {[
              ["S3 Path", selected.path + selected.file],
              ["Project", selected.project],
              ["Lot", selected.lot],
              ["Sector", selected.sector],
              ["Phase", selected.phase],
              ["Author", selected.author],
              ["Revision", selected.rev],
              ["Date", selected.date],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:12, padding:"8px 0",
                borderBottom:`1px solid ${T.border}`, alignItems:"flex-start" }}>
                <span style={{ fontSize:12, fontWeight:600, color:T.muted, width:80, flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:12, color:T.text, wordBreak:"break-all",
                  fontFamily: k==="S3 Path" ? "'DM Mono',monospace" : "inherit" }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.muted,
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Content excerpt</div>
              <p style={{ fontSize:13, color:T.text, lineHeight:1.65,
                background:T.off, padding:"12px 14px", borderRadius:8 }}>
                {highlight(selected.snippet, submitted)}
              </p>
            </div>

            <div style={{ marginTop:20, padding:"12px 14px", background:T.amberBg,
              borderRadius:8, border:`1px solid #F0C060` }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.amber,
                letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>S3 URI</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:T.text, wordBreak:"break-all" }}>
                s3://aede-poc-documents/{selected.path}{selected.file}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
