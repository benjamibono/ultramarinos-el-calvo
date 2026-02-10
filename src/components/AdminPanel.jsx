import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const deployHook = import.meta.env.PUBLIC_VERCEL_DEPLOY_HOOK;

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

// ─── Shared tiny components ──────────────────────────────

function Btn({ children, onClick, className = "", disabled, ...rest }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
    />
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer" title={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-amber-600"
      />
      <span className="text-xs text-gray-500">{label}</span>
    </label>
  );
}

// ─── Login Form ──────────────────────────────────────────

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Credenciales incorrectas");
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf2]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-[#2e211c] mb-6 text-center">
          Admin - Ultramarinos El Calvo
        </h1>
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <Btn
          type="submit"
          disabled={loading}
          className="w-full bg-[#2e211c] text-white hover:bg-[#4a3830]"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Btn>
      </form>
    </div>
  );
}

// ─── Barreo Tab ──────────────────────────────────────────

function BarreoTab({ rows, setRows }) {
  const mainItems = rows.filter((r) => r.category === "main" && !r._deleted);
  const molletes = rows.filter(
    (r) => r.category === "molletes" && !r._deleted,
  );

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        (r.id || r._tempId) === id ? { ...r, [field]: value } : r,
      ),
    );
  };

  const addRow = (category) => {
    setRows((prev) => [
      ...prev,
      {
        _tempId: tempId(),
        name_es: "",
        name_en: "",
        category,
        active: true,
        sort_order: prev.filter((r) => r.category === category).length + 1,
      },
    ]);
  };

  const deleteRow = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        (r.id || r._tempId) === id ? { ...r, _deleted: true } : r,
      ),
    );
  };

  const moveRow = (list, idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    const idA = list[idx].id || list[idx]._tempId;
    const idB = list[newIdx].id || list[newIdx]._tempId;
    setRows((prev) => {
      const copy = [...prev];
      const a = copy.find((r) => (r.id || r._tempId) === idA);
      const b = copy.find((r) => (r.id || r._tempId) === idB);
      const tmp = a.sort_order;
      a.sort_order = b.sort_order;
      b.sort_order = tmp;
      return [...copy];
    });
  };

  const renderSection = (title, items, category) => (
    <div className="mb-6">
      <h3 className="font-semibold text-[#2e211c] mb-2">{title}</h3>
      <div className="space-y-2">
        {items
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((row, idx) => {
            const key = row.id || row._tempId;
            return (
              <div key={key} className="flex items-center gap-2 flex-wrap">
                <Input
                  value={row.name_es}
                  onChange={(v) => updateRow(key, "name_es", v)}
                  placeholder="Nombre ES"
                  className="flex-1 min-w-[140px]"
                />
                <Input
                  value={row.name_en}
                  onChange={(v) => updateRow(key, "name_en", v)}
                  placeholder="Name EN"
                  className="flex-1 min-w-[140px]"
                />
                <Toggle
                  checked={row.active}
                  onChange={(v) => updateRow(key, "active", v)}
                  label="Activo"
                />
                <span className="flex gap-1">
                  <Btn
                    onClick={() => moveRow(items, idx, -1)}
                    className="bg-gray-200 hover:bg-gray-300 px-2"
                    title="Subir"
                  >
                    ▲
                  </Btn>
                  <Btn
                    onClick={() => moveRow(items, idx, 1)}
                    className="bg-gray-200 hover:bg-gray-300 px-2"
                    title="Bajar"
                  >
                    ▼
                  </Btn>
                </span>
                <Btn
                  onClick={() => deleteRow(key)}
                  className="bg-red-100 text-red-700 hover:bg-red-200 px-2"
                  title="Eliminar"
                >
                  🗑
                </Btn>
              </div>
            );
          })}
      </div>
      <Btn
        onClick={() => addRow(category)}
        className="mt-2 bg-amber-100 text-amber-800 hover:bg-amber-200"
      >
        + Añadir {category === "main" ? "plato" : "mollete"}
      </Btn>
    </div>
  );

  return (
    <div>
      {renderSection("Platos principales", mainItems, "main")}
      {renderSection("Molletes", molletes, "molletes")}
    </div>
  );
}

// ─── Mesa Tab ────────────────────────────────────────────

function MesaTab({ sections, setSections, items, setItems }) {
  const activeSections = sections.filter((s) => !s._deleted);

  const updateSection = (id, field, value) => {
    setSections((prev) =>
      prev.map((s) =>
        (s.id || s._tempId) === id ? { ...s, [field]: value } : s,
      ),
    );
  };

  const addSection = () => {
    const tid = tempId();
    setSections((prev) => [
      ...prev,
      {
        _tempId: tid,
        title_es: "",
        title_en: "",
        active: true,
        sort_order: prev.length + 1,
      },
    ]);
  };

  const deleteSection = (id) => {
    if (
      !window.confirm(
        "¿Eliminar esta sección? Se eliminarán también todos sus platos.",
      )
    )
      return;
    setSections((prev) =>
      prev.map((s) =>
        (s.id || s._tempId) === id ? { ...s, _deleted: true } : s,
      ),
    );
    // Also mark child items as deleted
    setItems((prev) =>
      prev.map((i) => (i.section_id === id ? { ...i, _deleted: true } : i)),
    );
  };

  const moveSec = (idx, dir) => {
    const sorted = [...activeSections].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const idA = sorted[idx].id || sorted[idx]._tempId;
    const idB = sorted[newIdx].id || sorted[newIdx]._tempId;
    setSections((prev) => {
      const copy = [...prev];
      const a = copy.find((s) => (s.id || s._tempId) === idA);
      const b = copy.find((s) => (s.id || s._tempId) === idB);
      const tmp = a.sort_order;
      a.sort_order = b.sort_order;
      b.sort_order = tmp;
      return [...copy];
    });
  };

  // Item helpers
  const sectionItems = (sectionId) =>
    items
      .filter(
        (i) =>
          (i.section_id === sectionId || i._parentId === sectionId) &&
          !i._deleted,
      )
      .sort((a, b) => a.sort_order - b.sort_order);

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((i) =>
        (i.id || i._tempId) === id ? { ...i, [field]: value } : i,
      ),
    );
  };

  const addItem = (sectionId) => {
    const existing = items.filter(
      (i) =>
        (i.section_id === sectionId || i._parentId === sectionId) &&
        !i._deleted,
    );
    setItems((prev) => [
      ...prev,
      {
        _tempId: tempId(),
        _parentId: sectionId,
        section_id: sectionId,
        name_es: "",
        name_en: "",
        active: true,
        sort_order: existing.length + 1,
      },
    ]);
  };

  const deleteItem = (id) => {
    setItems((prev) =>
      prev.map((i) =>
        (i.id || i._tempId) === id ? { ...i, _deleted: true } : i,
      ),
    );
  };

  const moveItem = (sectionId, idx, dir) => {
    const list = sectionItems(sectionId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    const idA = list[idx].id || list[idx]._tempId;
    const idB = list[newIdx].id || list[newIdx]._tempId;
    setItems((prev) => {
      const copy = [...prev];
      const a = copy.find((i) => (i.id || i._tempId) === idA);
      const b = copy.find((i) => (i.id || i._tempId) === idB);
      const tmp = a.sort_order;
      a.sort_order = b.sort_order;
      b.sort_order = tmp;
      return [...copy];
    });
  };

  return (
    <div className="space-y-6">
      {activeSections
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((sec, secIdx) => {
          const secKey = sec.id || sec._tempId;
          const secId = sec.id || sec._tempId;
          return (
            <div
              key={secKey}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Input
                  value={sec.title_es}
                  onChange={(v) => updateSection(secKey, "title_es", v)}
                  placeholder="Titulo ES"
                  className="flex-1 min-w-[140px] font-semibold"
                />
                <Input
                  value={sec.title_en}
                  onChange={(v) => updateSection(secKey, "title_en", v)}
                  placeholder="Title EN"
                  className="flex-1 min-w-[140px]"
                />
                <Toggle
                  checked={sec.active}
                  onChange={(v) => updateSection(secKey, "active", v)}
                  label="Activo"
                />
                <span className="flex gap-1">
                  <Btn
                    onClick={() => moveSec(secIdx, -1)}
                    className="bg-gray-200 hover:bg-gray-300 px-2"
                    title="Subir"
                  >
                    ▲
                  </Btn>
                  <Btn
                    onClick={() => moveSec(secIdx, 1)}
                    className="bg-gray-200 hover:bg-gray-300 px-2"
                    title="Bajar"
                  >
                    ▼
                  </Btn>
                </span>
                <Btn
                  onClick={() => deleteSection(secKey)}
                  className="bg-red-100 text-red-700 hover:bg-red-200 px-2"
                  title="Eliminar seccion"
                >
                  🗑
                </Btn>
              </div>

              <div className="space-y-2 ml-4">
                {sectionItems(secId).map((item, itemIdx) => {
                  const itemKey = item.id || item._tempId;
                  return (
                    <div
                      key={itemKey}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      <Input
                        value={item.name_es}
                        onChange={(v) => updateItem(itemKey, "name_es", v)}
                        placeholder="Nombre ES"
                        className="flex-1 min-w-[140px]"
                      />
                      <Input
                        value={item.name_en}
                        onChange={(v) => updateItem(itemKey, "name_en", v)}
                        placeholder="Name EN"
                        className="flex-1 min-w-[140px]"
                      />
                      <Toggle
                        checked={item.active}
                        onChange={(v) => updateItem(itemKey, "active", v)}
                        label="Activo"
                      />
                      <span className="flex gap-1">
                        <Btn
                          onClick={() => moveItem(secId, itemIdx, -1)}
                          className="bg-gray-200 hover:bg-gray-300 px-2"
                          title="Subir"
                        >
                          ▲
                        </Btn>
                        <Btn
                          onClick={() => moveItem(secId, itemIdx, 1)}
                          className="bg-gray-200 hover:bg-gray-300 px-2"
                          title="Bajar"
                        >
                          ▼
                        </Btn>
                      </span>
                      <Btn
                        onClick={() => deleteItem(itemKey)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-2"
                        title="Eliminar"
                      >
                        🗑
                      </Btn>
                    </div>
                  );
                })}
              </div>
              <Btn
                onClick={() => addItem(secId)}
                className="mt-2 ml-4 bg-amber-100 text-amber-800 hover:bg-amber-200"
              >
                + Añadir plato
              </Btn>
            </div>
          );
        })}
      <Btn
        onClick={addSection}
        className="bg-amber-100 text-amber-800 hover:bg-amber-200"
      >
        + Añadir seccion
      </Btn>
    </div>
  );
}

// ─── Horario Tab ─────────────────────────────────────────

function HorarioTab({ rows, setRows }) {
  const activeRows = rows
    .filter((r) => !r._deleted)
    .sort((a, b) => a.sort_order - b.sort_order);

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        (r.id || r._tempId) === id ? { ...r, [field]: value } : r,
      ),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        _tempId: tempId(),
        text_es: "",
        text_en: "",
        active: true,
        sort_order: prev.length + 1,
      },
    ]);
  };

  const deleteRow = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        (r.id || r._tempId) === id ? { ...r, _deleted: true } : r,
      ),
    );
  };

  const moveRow = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= activeRows.length) return;
    const idA = activeRows[idx].id || activeRows[idx]._tempId;
    const idB = activeRows[newIdx].id || activeRows[newIdx]._tempId;
    setRows((prev) => {
      const copy = [...prev];
      const a = copy.find((r) => (r.id || r._tempId) === idA);
      const b = copy.find((r) => (r.id || r._tempId) === idB);
      const tmp = a.sort_order;
      a.sort_order = b.sort_order;
      b.sort_order = tmp;
      return [...copy];
    });
  };

  return (
    <div>
      <div className="space-y-2">
        {activeRows.map((row, idx) => {
          const key = row.id || row._tempId;
          return (
            <div key={key} className="flex items-center gap-2 flex-wrap">
              <Input
                value={row.text_es}
                onChange={(v) => updateRow(key, "text_es", v)}
                placeholder="Texto ES"
                className="flex-1 min-w-[140px]"
              />
              <Input
                value={row.text_en}
                onChange={(v) => updateRow(key, "text_en", v)}
                placeholder="Text EN"
                className="flex-1 min-w-[140px]"
              />
              <Toggle
                checked={row.active}
                onChange={(v) => updateRow(key, "active", v)}
                label="Activo"
              />
              <span className="flex gap-1">
                <Btn
                  onClick={() => moveRow(idx, -1)}
                  className="bg-gray-200 hover:bg-gray-300 px-2"
                  title="Subir"
                >
                  ▲
                </Btn>
                <Btn
                  onClick={() => moveRow(idx, 1)}
                  className="bg-gray-200 hover:bg-gray-300 px-2"
                  title="Bajar"
                >
                  ▼
                </Btn>
              </span>
              <Btn
                onClick={() => deleteRow(key)}
                className="bg-red-100 text-red-700 hover:bg-red-200 px-2"
                title="Eliminar"
              >
                🗑
              </Btn>
            </div>
          );
        })}
      </div>
      <Btn
        onClick={addRow}
        className="mt-3 bg-amber-100 text-amber-800 hover:bg-amber-200"
      >
        + Añadir linea
      </Btn>
    </div>
  );
}

// ─── Main AdminPanel ─────────────────────────────────────

const TABS = [
  { key: "barreo", label: "Carta Barreo" },
  { key: "mesa", label: "Carta Mesa" },
  { key: "horario", label: "Horario" },
];

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("barreo");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  // Data state
  const [barreoRows, setBarreoRows] = useState([]);
  const [mesaSections, setMesaSections] = useState([]);
  const [mesaItems, setMesaItems] = useState([]);
  const [horarioRows, setHorarioRows] = useState([]);

  // ── Null guard ──
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf2]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-xl font-bold text-red-700 mb-3">
            Error de configuracion
          </h1>
          <p className="text-gray-600">
            Las variables de entorno de Supabase no estan configuradas. Contacta
            al desarrollador.
          </p>
        </div>
      </div>
    );
  }

  // ── Auth check ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setChecking(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data when logged in ──
  const loadData = useCallback(async () => {
    const [barreo, sections, items, schedule] = await Promise.all([
      supabase.from("bar_menu_items").select("*").order("sort_order"),
      supabase.from("table_menu_sections").select("*").order("sort_order"),
      supabase.from("table_menu_items").select("*").order("sort_order"),
      supabase.from("schedule").select("*").order("sort_order"),
    ]);
    setBarreoRows(barreo.data || []);
    setMesaSections(sections.data || []);
    setMesaItems(items.data || []);
    setHorarioRows(schedule.data || []);
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  // ── Show message helper ──
  const flash = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Save helpers ──
  const renumber = (rows) =>
    rows
      .filter((r) => !r._deleted)
      .map((r, i) => ({ ...r, sort_order: i + 1 }));

  const saveBarreo = async () => {
    // Delete removed rows
    const toDelete = barreoRows.filter((r) => r._deleted && r.id);
    for (const r of toDelete) {
      await supabase.from("bar_menu_items").delete().eq("id", r.id);
    }

    // Renumber remaining
    const numbered = renumber(barreoRows);

    for (const row of numbered) {
      const data = {
        name_es: row.name_es,
        name_en: row.name_en,
        category: row.category,
        active: row.active,
        sort_order: row.sort_order,
      };
      if (row.id) {
        await supabase.from("bar_menu_items").update(data).eq("id", row.id);
      } else {
        await supabase.from("bar_menu_items").insert(data);
      }
    }
  };

  const saveMesa = async () => {
    // Delete removed sections (CASCADE handles items in DB)
    const deletedSections = mesaSections.filter((s) => s._deleted && s.id);
    for (const s of deletedSections) {
      await supabase.from("table_menu_sections").delete().eq("id", s.id);
    }

    // Delete removed items
    const deletedItems = mesaItems.filter((i) => i._deleted && i.id);
    for (const i of deletedItems) {
      await supabase.from("table_menu_items").delete().eq("id", i.id);
    }

    // Save sections, renumbered
    const numberedSections = renumber(mesaSections);
    const sectionIdMap = {}; // tempId -> real id

    for (const sec of numberedSections) {
      const data = {
        title_es: sec.title_es,
        title_en: sec.title_en,
        active: sec.active,
        sort_order: sec.sort_order,
      };
      if (sec.id) {
        await supabase
          .from("table_menu_sections")
          .update(data)
          .eq("id", sec.id);
        sectionIdMap[sec.id] = sec.id;
      } else {
        const { data: inserted } = await supabase
          .from("table_menu_sections")
          .insert(data)
          .select("id")
          .single();
        if (inserted) {
          sectionIdMap[sec._tempId] = inserted.id;
        }
      }
    }

    // Save items with resolved section_id, grouped by section and renumbered
    const activeItems = mesaItems.filter((i) => !i._deleted);
    // Group items by their parent section
    const grouped = {};
    for (const item of activeItems) {
      const parentKey = item.section_id || item._parentId;
      if (!grouped[parentKey]) grouped[parentKey] = [];
      grouped[parentKey].push(item);
    }

    for (const [parentKey, groupItems] of Object.entries(grouped)) {
      const realSectionId = sectionIdMap[parentKey] || parentKey;
      const sorted = groupItems.sort((a, b) => a.sort_order - b.sort_order);
      for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const data = {
          section_id: realSectionId,
          name_es: item.name_es,
          name_en: item.name_en,
          active: item.active,
          sort_order: i + 1,
        };
        if (item.id) {
          await supabase
            .from("table_menu_items")
            .update(data)
            .eq("id", item.id);
        } else {
          await supabase.from("table_menu_items").insert(data);
        }
      }
    }
  };

  const saveHorario = async () => {
    const toDelete = horarioRows.filter((r) => r._deleted && r.id);
    for (const r of toDelete) {
      await supabase.from("schedule").delete().eq("id", r.id);
    }

    const numbered = renumber(horarioRows);

    for (const row of numbered) {
      const data = {
        text_es: row.text_es,
        text_en: row.text_en,
        active: row.active,
        sort_order: row.sort_order,
      };
      if (row.id) {
        await supabase.from("schedule").update(data).eq("id", row.id);
      } else {
        await supabase.from("schedule").insert(data);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "barreo") await saveBarreo();
      else if (activeTab === "mesa") await saveMesa();
      else if (activeTab === "horario") await saveHorario();
      await loadData(); // Reload fresh data
      flash("Cambios guardados correctamente");
    } catch (err) {
      flash("Error al guardar: " + err.message, "error");
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!deployHook) {
      flash(
        "Deploy hook no configurado. Contacta al desarrollador.",
        "error",
      );
      return;
    }
    setPublishing(true);
    try {
      await fetch(deployHook, { method: "POST" });
      flash(
        "Sitio web actualizandose. Los cambios seran visibles en unos minutos.",
      );
    } catch {
      flash("Error al publicar. Intentalo de nuevo.", "error");
    }
    setPublishing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // ── Loading & Login ──
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf2]">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginForm onLogin={loadData} />;
  }

  // ── Admin UI ──
  return (
    <div className="min-h-screen bg-[#fafaf2]">
      {/* Header */}
      <header className="bg-[#2e211c] text-white px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-bold text-lg">Admin - Ultramarinos El Calvo</h1>
        <div className="flex items-center gap-2">
          <a
            href="/admin/videos"
            className="px-3 py-1.5 rounded text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            Videos
          </a>
          <Btn
            onClick={handlePublish}
            disabled={publishing}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {publishing ? "Publicando..." : "Publicar cambios"}
          </Btn>
          <Btn
            onClick={handleLogout}
            className="bg-white/20 text-white hover:bg-white/30"
          >
            Cerrar sesion
          </Btn>
        </div>
      </header>

      {/* Message toast */}
      {message && (
        <div
          className={`mx-4 mt-3 p-3 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <nav className="flex border-b border-gray-300 bg-white px-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto p-4">
        {activeTab === "barreo" && (
          <BarreoTab rows={barreoRows} setRows={setBarreoRows} />
        )}
        {activeTab === "mesa" && (
          <MesaTab
            sections={mesaSections}
            setSections={setMesaSections}
            items={mesaItems}
            setItems={setMesaItems}
          />
        )}
        {activeTab === "horario" && (
          <HorarioTab rows={horarioRows} setRows={setHorarioRows} />
        )}

        {/* Save button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Btn
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2e211c] text-white hover:bg-[#4a3830] px-6 py-2"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
