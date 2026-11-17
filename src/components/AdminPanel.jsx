import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ─── Helpers ──────────────────────────────────────────────

let nextTempId = 1;
const tempId = () => `_new_${nextTempId++}`;

function move(arr, from, to) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// ─── Translation dictionary ─────────────────────────────

const FOOD_DICT = {
  // Proteins
  ATÚN: "TUNA", ANCHOA: "ANCHOVY", ANCHOAS: "ANCHOVIES",
  GAMBONES: "KING PRAWNS", GAMBAS: "PRAWNS", GAMBA: "PRAWN",
  CAMARONES: "SHRIMP", LANGOSTINOS: "LANGOUSTINES",
  BACALAO: "COD", MERLUZA: "HAKE", LUBINA: "SEA BASS",
  DORADA: "SEA BREAM", BOQUERONES: "ANCHOVIES", SARDINAS: "SARDINES",
  CHIPIRÓN: "BABY SQUID", CHIPIRONES: "BABY SQUID",
  CALAMARES: "SQUID", CALAMAR: "SQUID",
  CHOCO: "CUTTLEFISH", PULPO: "OCTOPUS",
  ALMEJAS: "CLAMS", MEJILLONES: "MUSSELS", NAVAJAS: "RAZOR CLAMS",
  PALOMETA: "POMFRET", PARPATANA: "JAW",
  MARISCO: "SEAFOOD", MARISCOS: "SEAFOOD",
  JAMÓN: "HAM", CHORIZO: "CHORIZO", SOBRASADA: "SOBRASADA",
  LOMO: "LOIN", PANCETA: "BACON", MORCILLA: "BLACK PUDDING",
  CARNE: "MEAT", CERDO: "PORK", BUEY: "OX",
  VACA: "BEEF", TERNERA: "VEAL", CORDERO: "LAMB",
  POLLO: "CHICKEN", CARRILLÁ: "PORK CHEEKS", CARRILLADA: "PORK CHEEKS",
  COSTILLAS: "RIBS", SOLOMILLO: "TENDERLOIN",
  PICAÑA: "PICANHA", BARRIGA: "BELLY",
  ALBÓNDIGAS: "MEATBALLS", ALBÓNDIGA: "MEATBALL",
  CHICHARRONES: "PORK RINDS", MOJAMA: "MOJAMA",
  HUEVAS: "ROE", HUEVA: "ROE",
  // Dairy & cheese
  QUESO: "CHEESE", QUESOS: "CHEESES",
  LECHE: "MILK", MANTEQUILLA: "BUTTER", NATA: "CREAM",
  YOGUR: "YOGURT", HUEVO: "EGG", HUEVOS: "EGGS",
  YEMA: "EGG YOLK", AHUMADO: "SMOKED", AHUMADA: "SMOKED",
  // Vegetables & plants
  TOMATE: "TOMATO", TOMATES: "TOMATOES",
  PIMIENTOS: "PEPPERS", PIMIENTO: "PEPPER",
  ALCACHOFA: "ARTICHOKE", ALCACHOFAS: "ARTICHOKES",
  GUISANTES: "PEAS", PATATAS: "POTATOES", PAPAS: "POTATOES",
  PATATA: "POTATO", PAPA: "POTATO",
  CEBOLLA: "ONION", CEBOLLAS: "ONIONS",
  AJO: "GARLIC", AJILLO: "GARLIC",
  LECHUGA: "LETTUCE", ESPINACAS: "SPINACH",
  SETAS: "MUSHROOMS", CHAMPIÑONES: "MUSHROOMS",
  ESPÁRRAGOS: "ASPARAGUS", CALABAZA: "PUMPKIN",
  BERENJENA: "EGGPLANT", BERENJENAS: "EGGPLANTS",
  PUERRO: "LEEK", ZANAHORIA: "CARROT", RÁBANO: "RADISH",
  HABAS: "BROAD BEANS", GARBANZOS: "CHICKPEAS",
  ACEITUNAS: "OLIVES", ACEITUNA: "OLIVE",
  HIERBABUENA: "MINT", LIMA: "LIME", LIMÓN: "LEMON",
  ALMENDRAS: "ALMONDS", ALMENDRA: "ALMOND",
  TRUFA: "TRUFFLE", TRUFAS: "TRUFFLES",
  // Grains & bread
  PAN: "BREAD", TOSTA: "TOAST", TOSTAS: "TOASTS",
  ARROZ: "RICE", MOLLETE: "MOLLETE", MOLLETES: "MOLLETES",
  EMPANADA: "EMPANADA", TORTILLA: "TORTILLA",
  CROQUETA: "CROQUETTE", CROQUETAS: "CROQUETTES",
  // Cooking & preparation
  FRITO: "FRIED", FRITA: "FRIED", FRITOS: "FRIED", FRITAS: "FRIED",
  PLANCHA: "GRILLED", ASADO: "ROASTED", ASADA: "ROASTED",
  GUISO: "STEW", GUISOS: "STEWS", GUISADO: "STEWED",
  RELLENO: "STUFFED", RELLENA: "STUFFED",
  CURADO: "CURED", CURADA: "CURED",
  CASERO: "HOMEMADE", CASERA: "HOMEMADE",
  SALSA: "SAUCE", CREMA: "CREAM",
  SECO: "DRIED", SECA: "DRIED",
  MADURADA: "AGED", MADURADO: "AGED",
  CRUJIENTE: "CRISPY",
  EMULSIÓN: "EMULSION",
  // Condiments & extras
  ACEITE: "OIL", SAL: "SALT", PIMIENTA: "PEPPER",
  VINAGRE: "VINEGAR", MIEL: "HONEY",
  AZÚCAR: "SUGAR", CANELA: "CINNAMON",
  // Descriptors
  ESPECIALES: "SPECIAL", ESPECIAL: "SPECIAL",
  SELECCIÓN: "SELECTION", ECOLÓGICAS: "ORGANIC",
  TABLA: "BOARD", TRIO: "TRIO",
  FLOR: "FLOWER",
  // Desserts
  TARTA: "CAKE", CHOCOLATE: "CHOCOLATE", BROWNIE: "BROWNIE",
  HELADO: "ICE CREAM", NATILLAS: "CUSTARD", FLAN: "FLAN",
  // Connectors (kept lowercase in output)
  DE: "OF", DEL: "OF", CON: "WITH", EN: "IN", AL: "WITH",
  Y: "AND", LA: "THE", EL: "THE", LOS: "THE", LAS: "THE",
  SU: "ITS", SUS: "ITS",
  // Schedule / common
  LUNES: "MONDAY", MARTES: "TUESDAY", MIÉRCOLES: "WEDNESDAY",
  JUEVES: "THURSDAY", VIERNES: "FRIDAY", SÁBADO: "SATURDAY",
  DOMINGO: "SUNDAY",
  CERRADO: "CLOSED", ABIERTO: "OPEN",
  COCINA: "KITCHEN", BARRA: "BAR",
  DESAYUNO: "BREAKFAST", ALMUERZO: "LUNCH", CENA: "DINNER",
};

function suggestTranslation(spanishText) {
  if (!spanishText || !spanishText.trim()) return "";
  return spanishText
    .trim()
    .split(/\s+/)
    .map((word) => {
      // Strip common punctuation for lookup, preserve it after
      const match = word.match(/^([^a-záéíóúüñ]*)(.*?)([^a-záéíóúüñ]*)$/i);
      if (!match) return word;
      const [, pre, core, post] = match;
      const upper = core.toUpperCase();
      if (FOOD_DICT[upper]) {
        return pre + FOOD_DICT[upper] + post;
      }
      return word;
    })
    .join(" ");
}

// ─── Row helpers ─────────────────────────────────────────

const rowKey = (r) => r.id || r._tempId;
const bySort = (a, b) => a.sort_order - b.sort_order;
const isBlank = (v) => !v || !String(v).trim();
const nextOrder = (rows) =>
  rows.reduce((max, r) => Math.max(max, r.sort_order || 0), 0) + 1;

// Move one row inside an ordered list and renumber that list
function reorder(setRows, orderedKeys, from, to) {
  if (to < 0 || to >= orderedKeys.length) return;
  const keys = move(orderedKeys, from, to);
  const position = new Map(keys.map((k, i) => [k, i + 1]));
  setRows((prev) =>
    prev.map((r) =>
      position.has(rowKey(r)) ? { ...r, sort_order: position.get(rowKey(r)) } : r,
    ),
  );
}

const patchRow = (setRows, key, field, value) =>
  setRows((prev) =>
    prev.map((r) => (rowKey(r) === key ? { ...r, [field]: value } : r)),
  );

// Brand-new rows are dropped; saved rows are flagged until publish
const removeRow = (setRows, key) =>
  setRows((prev) =>
    prev
      .filter((r) => !(r._tempId && rowKey(r) === key))
      .map((r) => (rowKey(r) === key ? { ...r, _deleted: true } : r)),
  );

const restoreRow = (setRows, key) => patchRow(setRows, key, "_deleted", false);

// Number of rows that differ from what was loaded
function countChanges(original, current, fields) {
  const byId = new Map(original.map((r) => [r.id, r]));
  let n = 0;
  for (const r of current) {
    if (!r.id) {
      if (!r._deleted) n++;
      continue;
    }
    if (r._deleted) {
      n++;
      continue;
    }
    const o = byId.get(r.id);
    if (!o || fields.some((f) => (o[f] ?? "") !== (r[f] ?? ""))) n++;
  }
  return n;
}

const FIELDS = {
  barSections: ["title_es", "title_en", "active", "sort_order"],
  barItems: ["name_es", "name_en", "active", "sort_order", "category"],
  mesaSections: ["title_es", "title_en", "active", "sort_order"],
  mesaItems: ["name_es", "name_en", "active", "sort_order", "section_id"],
  schedule: ["text_es", "text_en", "active", "sort_order"],
};

// ─── Icons (tabler, like the public site) ────────────────

const ICONS = {
  up: "M6 15l6 -6l6 6",
  down: "M6 9l6 6l6 -6",
  trash: "M4 7l16 0 M10 11l0 6 M14 11l0 6 M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12 M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3",
  undo: "M9 14l-4 -4l4 -4 M5 10h11a4 4 0 1 1 0 8h-1",
  plus: "M12 5l0 14 M5 12l14 0",
  language: "M4 5h7 M9 3v2c0 4.418 -2.239 8 -5 8 M5 9c0 2.144 2.952 3.908 6.7 4 M12 20l4 -9l4 9 M19.1 18h-6.2",
  eye: "M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0 M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6",
  eyeOff: "M10.585 10.587a2 2 0 0 0 2.829 2.828 M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87 M3 3l18 18",
  close: "M18 6l-12 12 M6 6l12 12",
  external: "M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6 M11 13l9 -9 M15 4h5v5",
};

function Icon({ name, className = "size-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name].split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  );
}

// ─── Shared tiny components ──────────────────────────────

const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2";

const BTN_VARIANTS = {
  primary: "bg-green-800 text-white hover:bg-green-900 font-bold rounded-full px-5",
  dark: "bg-brand-brown text-white hover:bg-[#4a3830] font-bold rounded-full px-5",
  secondary: "bg-white text-brand-brown border border-stone-300 hover:bg-stone-50 rounded-full px-4",
  onDark: "bg-white/10 text-white hover:bg-white/20 rounded-full px-4",
  soft: "bg-stone-100 text-brand-brown hover:bg-stone-200 rounded-full px-4",
};

function Btn({ children, onClick, variant = "secondary", className = "", type = "button", disabled, ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 min-h-10 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS} ${BTN_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function IconBtn({ icon, label, onClick, disabled, tone = "default" }) {
  const tones = {
    default: "text-stone-600 hover:bg-stone-100 hover:text-brand-brown",
    danger: "text-red-700 hover:bg-red-50",
    amber: "text-amber-800 bg-amber-100 hover:bg-amber-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${FOCUS} ${tones[tone]}`}
    >
      <Icon name={icon} />
    </button>
  );
}

function TextField({ value, onChange, label, placeholder, state, className = "", strong }) {
  const ring = {
    error: "border-red-500 bg-red-50/40",
    warn: "border-amber-400",
  }[state] || "border-stone-300";
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      aria-invalid={state === "error" || undefined}
      className={`w-full min-w-0 min-h-10 rounded-lg border bg-white px-3 py-2 text-sm text-brand-brown placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 ${strong ? "font-semibold" : ""} ${ring} ${className}`}
    />
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={checked ? "Visible en la web" : "Oculto en la web"}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-2 text-xs ${FOCUS}`}
    >
      <span
        className={`relative inline-block h-5 w-9 rounded-full transition-colors ${checked ? "bg-green-700" : "bg-stone-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </span>
      <span className={`w-12 text-left ${checked ? "text-green-800" : "text-stone-500"}`}>
        {checked ? "Visible" : "Oculto"}
      </span>
    </button>
  );
}

// One editable ES/EN line with its actions. Used for dishes, section titles and schedule lines.
function EditableRow({ row, esField, enField, kind, index, count, onPatch, onMove, onDelete, onRestore, showActive = true, strong }) {
  const es = row[esField];
  const en = row[enField];
  const name = isBlank(es) ? kind : `"${es}"`;

  if (row._deleted) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-stone-300 px-3 py-2 text-sm text-stone-500">
        <span className="flex-1 truncate line-through">{es || "(sin nombre)"}</span>
        <span className="text-xs">Se eliminará al guardar</span>
        <Btn variant="soft" onClick={onRestore}>
          <Icon name="undo" /> Deshacer
        </Btn>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-2 rounded-lg border-b border-stone-100 p-2 last:border-b-0 md:border-b-0 md:grid-cols-[1fr_1fr_auto] md:items-start ${row.active === false ? "bg-stone-100/70" : ""}`}
    >
      <div>
        <TextField
          value={es}
          onChange={(v) => onPatch(esField, v)}
          label={`${kind} ${index + 1}, español`}
          placeholder="Español"
          state={isBlank(es) ? "error" : undefined}
          strong={strong}
        />
        {isBlank(es) && <p className="mt-1 text-xs text-red-700">Falta el texto en español</p>}
      </div>
      <div className="flex items-center gap-1">
        <TextField
          value={en}
          onChange={(v) => onPatch(enField, v)}
          label={`${kind} ${index + 1}, inglés`}
          placeholder="English"
          state={!isBlank(es) && isBlank(en) ? "warn" : undefined}
          strong={strong}
        />
        {!isBlank(es) && isBlank(en) && (
          <IconBtn
            icon="language"
            tone="amber"
            label={`Sugerir traducción al inglés de ${name}`}
            onClick={() => onPatch(enField, suggestTranslation(es))}
          />
        )}
      </div>
      <div className="flex items-center justify-end gap-0.5 md:w-[236px]">
        {showActive && (
          <Switch
            checked={row.active !== false}
            onChange={(v) => onPatch("active", v)}
            label={`Mostrar ${name} en la web`}
          />
        )}
        <IconBtn icon="up" label={`Subir ${name}`} disabled={index === 0} onClick={() => onMove(-1)} />
        <IconBtn icon="down" label={`Bajar ${name}`} disabled={index === count - 1} onClick={() => onMove(1)} />
        <IconBtn icon="trash" tone="danger" label={`Eliminar ${name}`} onClick={onDelete} />
      </div>
    </div>
  );
}

// A list of rows with reorder/delete/undo wired to one setter
function RowList({ rows, setRows, esField, enField, kind }) {
  const sorted = [...rows].sort(bySort);
  const live = sorted.filter((r) => !r._deleted);
  const liveKeys = live.map(rowKey);
  return (
    <div className="space-y-1">
      {sorted.map((row) => {
        const key = rowKey(row);
        const idx = liveKeys.indexOf(key);
        return (
          <EditableRow
            key={key}
            row={row}
            esField={esField}
            enField={enField}
            kind={kind}
            index={idx}
            count={live.length}
            onPatch={(f, v) => patchRow(setRows, key, f, v)}
            onMove={(dir) => reorder(setRows, liveKeys, idx, idx + dir)}
            onDelete={() => removeRow(setRows, key)}
            onRestore={() => restoreRow(setRows, key)}
          />
        );
      })}
      {sorted.length === 0 && (
        <p className="px-2 py-4 text-sm text-stone-500">Todavía no hay nada aquí.</p>
      )}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white p-3 shadow-sm sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

function ColumnHeads() {
  return (
    <div className="hidden px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-stone-500 md:grid md:grid-cols-[1fr_1fr_auto] md:gap-2">
      <span>Español</span>
      <span>Inglés</span>
      <span className="w-[236px]" />
    </div>
  );
}

// Fill every empty EN field that has ES text, using the dictionary
function fillMissing(setRows, esField, enField) {
  setRows((prev) =>
    prev.map((r) =>
      !r._deleted && !isBlank(r[esField]) && isBlank(r[enField])
        ? { ...r, [enField]: suggestTranslation(r[esField]) }
        : r,
    ),
  );
}

const missingCount = (rows, esField, enField) =>
  rows.filter((r) => !r._deleted && !isBlank(r[esField]) && isBlank(r[enField])).length;

function TabToolbar({ missing, onFill, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {missing > 0 && (
        <Btn variant="soft" onClick={onFill}>
          <Icon name="language" /> Sugerir inglés en {missing} {missing === 1 ? "campo vacío" : "campos vacíos"}
        </Btn>
      )}
    </div>
  );
}

// ─── Login Form ──────────────────────────────────────────

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(
        authError.status === 400 || authError.status === 401
          ? "Email o contraseña incorrectos"
          : "No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Ultramarinos El Calvo
        </p>
        <h1 className="mt-1 mb-6 text-center text-2xl font-bold uppercase text-brand-brown">
          Administración
        </h1>
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-800">
            {error}
          </p>
        )}
        <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-brand-brown">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full min-h-11 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
        <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-brand-brown">
          Contraseña
        </label>
        <div className="relative mb-6">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full min-h-11 rounded-lg border border-stone-300 py-2 pr-12 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-500 hover:text-brand-brown ${FOCUS} rounded-r-lg`}
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} className="size-5" />
          </button>
        </div>
        <Btn type="submit" variant="dark" disabled={loading} className="w-full min-h-11">
          {loading ? "Entrando…" : "Entrar"}
        </Btn>
      </form>
    </main>
  );
}

// ─── Barreo Tab ──────────────────────────────────────────

const BARREO_CATEGORIES = [
  { category: "main", label: "Platos", kind: "Plato", add: "Añadir plato" },
  { category: "molletes", label: "Molletes", kind: "Mollete", add: "Añadir mollete" },
];

function BarreoTab({ sections, setSections, rows, setRows }) {
  const missing =
    missingCount(rows, "name_es", "name_en") + missingCount(sections, "title_es", "title_en");

  return (
    <div>
      <TabToolbar
        missing={missing}
        onFill={() => {
          fillMissing(setRows, "name_es", "name_en");
          fillMissing(setSections, "title_es", "title_en");
        }}
      />
      <div className="space-y-6">
        {BARREO_CATEGORIES.map(({ category, label, kind, add }) => {
          const sec = sections.find((s) => s.category === category);
          const catRows = rows.filter((r) => r.category === category);
          // Rows of one category, editable through the shared row setter
          const setCatRows = (updater) =>
            setRows((prev) => {
              const others = prev.filter((r) => r.category !== category);
              const mine = prev.filter((r) => r.category === category);
              return [...others, ...updater(mine)];
            });
          return (
            <Card key={category}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                {label}
              </h2>
              {sec && (
                <div className="mb-3 border-b border-stone-200 pb-3">
                  <p className="mb-1 px-2 text-xs text-stone-500">Título de la sección</p>
                  <div className="grid grid-cols-1 gap-2 px-2 md:grid-cols-2">
                    <TextField
                      value={sec.title_es}
                      onChange={(v) => patchRow(setSections, sec.id, "title_es", v)}
                      label={`Título de ${label}, español`}
                      placeholder="Título en español"
                      state={isBlank(sec.title_es) ? "error" : undefined}
                      strong
                    />
                    <div className="flex items-center gap-1">
                      <TextField
                        value={sec.title_en}
                        onChange={(v) => patchRow(setSections, sec.id, "title_en", v)}
                        label={`Título de ${label}, inglés`}
                        placeholder="Title in English"
                        state={!isBlank(sec.title_es) && isBlank(sec.title_en) ? "warn" : undefined}
                        strong
                      />
                      {!isBlank(sec.title_es) && isBlank(sec.title_en) && (
                        <IconBtn
                          icon="language"
                          tone="amber"
                          label={`Sugerir traducción del título de ${label}`}
                          onClick={() => patchRow(setSections, sec.id, "title_en", suggestTranslation(sec.title_es))}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              <ColumnHeads />
              <RowList rows={catRows} setRows={setCatRows} esField="name_es" enField="name_en" kind={kind} />
              <Btn
                variant="soft"
                className="mt-3"
                onClick={() =>
                  setRows((prev) => [
                    ...prev,
                    {
                      _tempId: tempId(),
                      name_es: "",
                      name_en: "",
                      category,
                      active: true,
                      sort_order: nextOrder(prev.filter((r) => r.category === category)),
                    },
                  ])
                }
              >
                <Icon name="plus" /> {add}
              </Btn>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mesa Tab ────────────────────────────────────────────

function MesaTab({ sections, setSections, items, setItems }) {
  const sorted = [...sections].sort(bySort);
  const liveKeys = sorted.filter((s) => !s._deleted).map(rowKey);
  const missing =
    missingCount(items, "name_es", "name_en") + missingCount(sections, "title_es", "title_en");

  const addSection = () =>
    setSections((prev) => [
      ...prev,
      { _tempId: tempId(), title_es: "", title_en: "", active: true, sort_order: nextOrder(prev) },
    ]);

  const deleteSection = (key) => {
    removeRow(setSections, key);
    // Items follow their section; unsaved ones disappear, saved ones are flagged
    setItems((prev) =>
      prev
        .filter((i) => !(i._tempId && i.section_id === key))
        .map((i) => (i.section_id === key ? { ...i, _deleted: true, _withSection: true } : i)),
    );
  };

  const restoreSection = (key) => {
    restoreRow(setSections, key);
    setItems((prev) =>
      prev.map((i) =>
        i.section_id === key && i._withSection ? { ...i, _deleted: false, _withSection: false } : i,
      ),
    );
  };

  return (
    <div>
      <TabToolbar
        missing={missing}
        onFill={() => {
          fillMissing(setItems, "name_es", "name_en");
          fillMissing(setSections, "title_es", "title_en");
        }}
      />
      <div className="space-y-6">
        {sorted.map((sec) => {
          const secKey = rowKey(sec);
          const idx = liveKeys.indexOf(secKey);
          const secItems = items.filter((i) => i.section_id === secKey);
          const setSecItems = (updater) =>
            setItems((prev) => {
              const others = prev.filter((i) => i.section_id !== secKey);
              const mine = prev.filter((i) => i.section_id === secKey);
              return [...others, ...updater(mine)];
            });
          return (
            <Card key={secKey} className={sec._deleted ? "opacity-80" : ""}>
              <h2 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Sección {idx >= 0 ? idx + 1 : ""}
              </h2>
              <EditableRow
                row={sec}
                esField="title_es"
                enField="title_en"
                kind="Sección"
                index={idx}
                count={liveKeys.length}
                strong
                onPatch={(f, v) => patchRow(setSections, secKey, f, v)}
                onMove={(dir) => reorder(setSections, liveKeys, idx, idx + dir)}
                onDelete={() => deleteSection(secKey)}
                onRestore={() => restoreSection(secKey)}
              />
              {!sec._deleted && (
                <div className="mt-3 border-t border-stone-200 pt-3 md:ml-6">
                  <ColumnHeads />
                  <RowList rows={secItems} setRows={setSecItems} esField="name_es" enField="name_en" kind="Plato" />
                  <Btn
                    variant="soft"
                    className="mt-3"
                    onClick={() =>
                      setItems((prev) => [
                        ...prev,
                        {
                          _tempId: tempId(),
                          section_id: secKey,
                          name_es: "",
                          name_en: "",
                          active: true,
                          sort_order: nextOrder(prev.filter((i) => i.section_id === secKey)),
                        },
                      ])
                    }
                  >
                    <Icon name="plus" /> Añadir plato
                  </Btn>
                </div>
              )}
            </Card>
          );
        })}
        <Btn variant="secondary" onClick={addSection}>
          <Icon name="plus" /> Añadir sección
        </Btn>
      </div>
    </div>
  );
}

// ─── Horario Tab ─────────────────────────────────────────

function HorarioTab({ rows, setRows }) {
  return (
    <div>
      <TabToolbar
        missing={missingCount(rows, "text_es", "text_en")}
        onFill={() => fillMissing(setRows, "text_es", "text_en")}
      />
      <Card>
        <p className="mb-3 px-2 text-sm text-stone-600">
          Cada línea aparece tal cual en el pie de la web, en este orden.
        </p>
        <ColumnHeads />
        <RowList rows={rows} setRows={setRows} esField="text_es" enField="text_en" kind="Línea" />
        <Btn
          variant="soft"
          className="mt-3"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { _tempId: tempId(), text_es: "", text_en: "", active: true, sort_order: nextOrder(prev) },
            ])
          }
        >
          <Icon name="plus" /> Añadir línea
        </Btn>
      </Card>
    </div>
  );
}

// ─── Saving ──────────────────────────────────────────────

async function must(query, what) {
  const { data, error } = await query;
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

// Saves a flat table: deletes, then updates/inserts renumbered rows.
// `done` records what reached the database so a failed save can be retried safely.
async function saveFlat(table, rows, toData, done, label) {
  for (const r of rows.filter((r) => r._deleted && r.id)) {
    await must(supabase.from(table).delete().eq("id", r.id), `${label}: no se pudo eliminar`);
    done.deleted.add(r.id);
  }
  const live = rows.filter((r) => !r._deleted).sort(bySort);
  for (let i = 0; i < live.length; i++) {
    const r = live[i];
    const data = { ...toData(r), sort_order: i + 1 };
    if (r.id) {
      await must(supabase.from(table).update(data).eq("id", r.id), `${label}: no se pudo actualizar`);
    } else {
      const inserted = await must(
        supabase.from(table).insert(data).select("id").single(),
        `${label}: no se pudo añadir`,
      );
      done.inserted.set(r._tempId, inserted.id);
    }
  }
}

// Apply what was already saved to local state (after a partial failure)
const reconcile = (done) => (prev) =>
  prev
    .filter((r) => !(r.id && done.deleted.has(r.id)))
    .map((r) => {
      let next = r;
      if (r._tempId && done.inserted.has(r._tempId)) {
        const { _tempId, ...rest } = r;
        next = { ...rest, id: done.inserted.get(r._tempId) };
      }
      if (next.section_id && done.inserted.has(next.section_id)) {
        next = { ...next, section_id: done.inserted.get(next.section_id) };
      }
      return next;
    });

function validate({ barreoSections, barreoRows, mesaSections, mesaItems, horarioRows }) {
  const blank = (rows, field) => rows.filter((r) => !r._deleted && isBlank(r[field])).length;
  const issues = [];
  const b = blank(barreoRows, "name_es") + blank(barreoSections, "title_es");
  const m = blank(mesaItems, "name_es") + blank(mesaSections, "title_es");
  const h = blank(horarioRows, "text_es");
  if (b) issues.push({ tab: "barreo", n: b });
  if (m) issues.push({ tab: "mesa", n: m });
  if (h) issues.push({ tab: "horario", n: h });
  return issues;
}

// ─── Main AdminPanel ─────────────────────────────────────

const TABS = [
  { key: "barreo", label: "Carta Barreo", view: "/carta-barreo" },
  { key: "mesa", label: "Carta Mesa", view: "/carta-mesa" },
  { key: "horario", label: "Horario", view: "/#contact" },
];

function StatusBanner({ status, onClose }) {
  if (!status) return null;
  const styles = {
    info: "bg-stone-100 text-brand-brown border-stone-300",
    success: "bg-green-50 text-green-900 border-green-300",
    error: "bg-red-50 text-red-900 border-red-300",
  };
  return (
    <div
      role={status.type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[status.type]}`}
    >
      <p className="flex-1">{status.text}</p>
      {status.type !== "info" && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar aviso"
          className={`-m-1 rounded-full p-1 hover:bg-black/5 ${FOCUS}`}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}

export default function AdminPanel() {
  if (!supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
        <div className="max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-xl font-bold text-red-700">Error de configuración</h1>
          <p className="text-stone-600">
            Las variables de entorno de Supabase no están configuradas. Contacta con el desarrollador.
          </p>
        </div>
      </main>
    );
  }
  return <AdminApp />;
}

function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("barreo");
  const [busy, setBusy] = useState(null); // null | "loading" | "saving" | "publishing"
  const [status, setStatus] = useState(null);

  // Data state
  const [barreoSections, setBarreoSections] = useState([]);
  const [barreoRows, setBarreoRows] = useState([]);
  const [mesaSections, setMesaSections] = useState([]);
  const [mesaItems, setMesaItems] = useState([]);
  const [horarioRows, setHorarioRows] = useState([]);
  const [original, setOriginal] = useState(null);

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setChecking(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // ── Tab from URL hash ──
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (TABS.some((t) => t.key === fromHash)) setActiveTab(fromHash);
  }, []);

  const selectTab = (key) => {
    setActiveTab(key);
    history.replaceState(null, "", `#${key}`);
  };

  // ── Load ──
  const loadData = useCallback(async () => {
    setBusy("loading");
    try {
      const [barSections, barreo, sections, items, schedule] = await Promise.all([
        must(supabase.from("bar_menu_sections").select("*").order("sort_order"), "Carta Barreo"),
        must(supabase.from("bar_menu_items").select("*").order("sort_order"), "Carta Barreo"),
        must(supabase.from("table_menu_sections").select("*").order("sort_order"), "Carta Mesa"),
        must(supabase.from("table_menu_items").select("*").order("sort_order"), "Carta Mesa"),
        must(supabase.from("schedule").select("*").order("sort_order"), "Horario"),
      ]);
      setBarreoSections(barSections || []);
      setBarreoRows(barreo || []);
      setMesaSections(sections || []);
      setMesaItems(items || []);
      setHorarioRows(schedule || []);
      setOriginal({
        barreoSections: barSections || [],
        barreoRows: barreo || [],
        mesaSections: sections || [],
        mesaItems: items || [],
        horarioRows: schedule || [],
      });
      return true;
    } catch (err) {
      setStatus({ type: "error", text: `No se pudieron cargar los datos. ${err.message}` });
      return false;
    } finally {
      setBusy(null);
    }
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) loadData();
  }, [userId, loadData]);

  // ── Changes ──
  const changes = useMemo(() => {
    if (!original) return { barreo: 0, mesa: 0, horario: 0, total: 0 };
    const barreo =
      countChanges(original.barreoSections, barreoSections, FIELDS.barSections) +
      countChanges(original.barreoRows, barreoRows, FIELDS.barItems);
    const mesa =
      countChanges(original.mesaSections, mesaSections, FIELDS.mesaSections) +
      countChanges(original.mesaItems, mesaItems, FIELDS.mesaItems);
    const horario = countChanges(original.horarioRows, horarioRows, FIELDS.schedule);
    return { barreo, mesa, horario, total: barreo + mesa + horario };
  }, [original, barreoSections, barreoRows, mesaSections, mesaItems, horarioRows]);

  useEffect(() => {
    if (!changes.total) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changes.total]);

  // Success messages fade; errors stay until closed
  useEffect(() => {
    if (status?.type !== "success") return;
    const t = setTimeout(() => setStatus(null), 8000);
    return () => clearTimeout(t);
  }, [status]);

  // ── Save / publish ──
  const save = async () => {
    const issues = validate({ barreoSections, barreoRows, mesaSections, mesaItems, horarioRows });
    if (issues.length) {
      const first = issues[0];
      selectTab(first.tab);
      setStatus({
        type: "error",
        text: `Hay ${issues.reduce((n, i) => n + i.n, 0)} campo(s) en español vacíos (${issues
          .map((i) => TABS.find((t) => t.key === i.tab).label)
          .join(", ")}). Rellénalos o elimina esas líneas antes de guardar.`,
      });
      return false;
    }

    const done = { inserted: new Map(), deleted: new Set() };
    try {
      setStatus({ type: "info", text: "Guardando Carta Barreo…" });
      for (const sec of barreoSections) {
        if (!sec.id) continue;
        await must(
          supabase
            .from("bar_menu_sections")
            .update({ title_es: sec.title_es, title_en: sec.title_en, active: sec.active, sort_order: sec.sort_order })
            .eq("id", sec.id),
          "Carta Barreo (títulos)",
        );
      }
      for (const { category } of BARREO_CATEGORIES) {
        await saveFlat(
          "bar_menu_items",
          barreoRows.filter((r) => r.category === category),
          (r) => ({ name_es: r.name_es, name_en: r.name_en, category: r.category, active: r.active }),
          done,
          "Carta Barreo",
        );
      }

      setStatus({ type: "info", text: "Guardando Carta Mesa…" });
      // Deleting a section removes its dishes in the database (ON DELETE CASCADE)
      for (const s of mesaSections.filter((s) => s._deleted && s.id)) {
        await must(supabase.from("table_menu_sections").delete().eq("id", s.id), "Carta Mesa (eliminar sección)");
        done.deleted.add(s.id);
        mesaItems.filter((i) => i.section_id === s.id && i.id).forEach((i) => done.deleted.add(i.id));
      }
      await saveFlat(
        "table_menu_sections",
        mesaSections.filter((s) => !s._deleted),
        (s) => ({ title_es: s.title_es, title_en: s.title_en, active: s.active }),
        done,
        "Carta Mesa (secciones)",
      );
      const liveSectionKeys = mesaSections.filter((s) => !s._deleted).map(rowKey);
      for (const key of liveSectionKeys) {
        const sectionId = done.inserted.get(key) || key;
        await saveFlat(
          "table_menu_items",
          mesaItems.filter((i) => i.section_id === key),
          (i) => ({ section_id: sectionId, name_es: i.name_es, name_en: i.name_en, active: i.active }),
          done,
          "Carta Mesa (platos)",
        );
      }

      setStatus({ type: "info", text: "Guardando Horario…" });
      await saveFlat(
        "schedule",
        horarioRows,
        (r) => ({ text_es: r.text_es, text_en: r.text_en, active: r.active }),
        done,
        "Horario",
      );
    } catch (err) {
      // Keep the unsaved edits, but mark what already reached the database
      [setBarreoRows, setMesaSections, setMesaItems, setHorarioRows].forEach((set) => set(reconcile(done)));
      setStatus({
        type: "error",
        text: `No se pudo guardar todo. Tus cambios siguen aquí: revisa la conexión y vuelve a intentarlo. Detalle: ${err.message}`,
      });
      return false;
    }
    return loadData();
  };

  const handleSave = async () => {
    setBusy("saving");
    const ok = await save();
    setBusy(null);
    if (ok) {
      setStatus({
        type: "success",
        text: "Cambios guardados. La web pública no cambia hasta que pulses «Guardar y publicar».",
      });
    }
  };

  const handlePublish = async () => {
    setBusy("publishing");
    const ok = await save();
    if (!ok) {
      setBusy(null);
      return;
    }
    setBusy("publishing");
    setStatus({ type: "info", text: "Publicando la web…" });
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setStatus({
        type: "success",
        text: "Guardado. La web se está actualizando y los cambios se verán en unos minutos.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: `Los cambios están guardados, pero no se pudo publicar la web (${err.message}). Vuelve a pulsar «Guardar y publicar».`,
      });
    }
    setBusy(null);
  };

  const handleDiscard = async () => {
    if (!window.confirm(`¿Descartar ${changes.total} cambio(s) sin guardar?`)) return;
    if (await loadData()) setStatus({ type: "success", text: "Cambios descartados." });
  };

  const handleLogout = async () => {
    if (changes.total && !window.confirm("Tienes cambios sin guardar. ¿Cerrar sesión igualmente?")) return;
    await supabase.auth.signOut();
    setSession(null);
    setOriginal(null);
  };

  // ── Loading & Login ──
  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-cream">
        <p className="text-stone-500" role="status">Cargando…</p>
      </main>
    );
  }

  if (!session) return <LoginForm />;

  const working = busy !== null;
  const tab = TABS.find((t) => t.key === activeTab);
  const counts = {
    barreo: barreoRows.filter((r) => !r._deleted).length,
    mesa: mesaItems.filter((i) => !i._deleted).length,
    horario: horarioRows.filter((r) => !r._deleted).length,
  };

  const actions = (
    <>
      <Btn variant="secondary" onClick={handleDiscard} disabled={working || !changes.total}>
        Descartar
      </Btn>
      <Btn variant="secondary" onClick={handleSave} disabled={working || !changes.total}>
        {busy === "saving" ? "Guardando…" : "Guardar"}
      </Btn>
      <Btn variant="primary" onClick={handlePublish} disabled={working}>
        {busy === "publishing" ? (
          "Publicando…"
        ) : (
          <>
            <span className="md:hidden">Publicar</span>
            <span className="hidden md:inline">Guardar y publicar</span>
          </>
        )}
      </Btn>
    </>
  );

  // ── Admin UI ──
  return (
    <div className="min-h-screen bg-brand-cream pb-24 text-brand-brown md:pb-10">
      <header className="sticky top-0 z-20 bg-brand-brown text-white shadow">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Ultramarinos El Calvo
            </p>
            <h1 className="text-lg font-bold uppercase leading-tight">Administración</h1>
          </div>
          <nav aria-label="Administración" className="flex flex-wrap items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm hover:bg-white/10 ${FOCUS}`}
            >
              Ver web <Icon name="external" />
            </a>
            <a
              href="/admin/videos"
              className={`inline-flex min-h-10 items-center rounded-full px-3 text-sm hover:bg-white/10 ${FOCUS}`}
            >
              Vídeos
            </a>
            <Btn variant="onDark" onClick={handleLogout}>
              Cerrar sesión
            </Btn>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4">
        {/* Save bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm" aria-live="polite">
            {busy === "loading" ? (
              "Cargando datos…"
            ) : changes.total ? (
              <>
                <span className="mr-2 inline-block size-2 rounded-full bg-amber-500 align-middle" aria-hidden="true" />
                <strong>{changes.total}</strong> {changes.total === 1 ? "cambio sin guardar" : "cambios sin guardar"}
              </>
            ) : (
              <>
                <span className="mr-2 inline-block size-2 rounded-full bg-green-600 align-middle" aria-hidden="true" />
                Todo guardado
              </>
            )}
          </p>
          <div className="hidden flex-wrap items-center gap-2 md:flex">{actions}</div>
        </div>

        {status && (
          <div className="mt-3">
            <StatusBanner status={status} onClose={() => setStatus(null)} />
          </div>
        )}

        {/* Tabs */}
        <div role="tablist" aria-label="Contenido" className="mt-5 flex gap-1 overflow-x-auto border-b border-stone-300">
          {TABS.map((t) => {
            const selected = activeTab === t.key;
            return (
              <button
                key={t.key}
                id={`tab-${t.key}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`panel-${t.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(t.key)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  const i = TABS.findIndex((x) => x.key === t.key);
                  const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
                  selectTab(next.key);
                  document.getElementById(`tab-${next.key}`)?.focus();
                }}
                className={`-mb-px flex flex-1 shrink-0 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors sm:flex-none sm:gap-2 sm:px-4 sm:text-sm ${FOCUS} ${
                  selected ? "border-green-800 text-brand-brown" : "border-transparent text-stone-500 hover:text-brand-brown"
                }`}
              >
                {t.label}
                <span className="hidden rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-stone-700 sm:inline">{counts[t.key]}</span>
                {changes[t.key] > 0 && (
                  <span className="size-2 rounded-full bg-amber-500" aria-label={`${changes[t.key]} cambios sin guardar`} />
                )}
              </button>
            );
          })}
        </div>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="py-5"
          aria-busy={busy === "loading"}
        >
          <p className="mb-4 text-sm text-stone-600">
            Edita los textos en español e inglés. Nada cambia en la web hasta que pulses «Guardar y publicar».{" "}
            <a href={tab.view} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:opacity-70">
              Ver {tab.label.toLowerCase()} en la web
            </a>
          </p>
          {activeTab === "barreo" && (
            <BarreoTab sections={barreoSections} setSections={setBarreoSections} rows={barreoRows} setRows={setBarreoRows} />
          )}
          {activeTab === "mesa" && (
            <MesaTab sections={mesaSections} setSections={setMesaSections} items={mesaItems} setItems={setMesaItems} />
          )}
          {activeTab === "horario" && <HorarioTab rows={horarioRows} setRows={setHorarioRows} />}
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-2 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
        {actions}
      </div>
    </div>
  );
}
