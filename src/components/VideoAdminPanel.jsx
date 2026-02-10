import { useState, useEffect, useCallback } from "react";
import {
  adminSignIn,
  adminSignOut,
  getAdminSession,
  onAuthChange,
  getVideoMetadata,
  uploadVideo,
  deleteVideo,
  getVideoEvents,
  getMaxVideos,
  setMaxVideos,
  getSupabaseClient,
} from "../lib/supabaseAdmin";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mov"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// ─── Helpers ──────────────────────────────────────────────

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

function formatDate(iso) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventLabel(type) {
  switch (type) {
    case "upload":
      return "Subido";
    case "delete":
      return "Eliminado";
    case "auto_delete":
      return "Auto-eliminado";
    default:
      return type;
  }
}

function eventColor(type) {
  switch (type) {
    case "upload":
      return "bg-green-100 text-green-800";
    case "delete":
      return "bg-red-100 text-red-800";
    case "auto_delete":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// ─── Login Form ───────────────────────────────────────────

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminSignIn(email, password);
      onLogin();
    } catch {
      setError("Credenciales incorrectas");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf2]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-[#2e211c] mb-6 text-center">
          Admin Videos - El Calvo
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
            Contrasena
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
        <p className="mt-4 text-center text-xs text-gray-400">
          <a href="/admin" className="underline hover:text-gray-600">
            Ir al admin de carta/horario
          </a>
        </p>
      </form>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────

function UploadForm({ onUploaded, videoCount, maxVideos }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (f) => {
    if (!f) return "Selecciona un archivo";
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Formato no permitido. Usa: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (!ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      return `Tipo de archivo no permitido`;
    }
    if (f.size > MAX_FILE_SIZE) {
      return `El archivo supera los 50 MB (${(f.size / 1024 / 1024).toFixed(1)} MB)`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setUploading(true);
    try {
      await uploadVideo(file, title.trim());
      setFile(null);
      setTitle("");
      // Reset file input
      const input = document.getElementById("video-file-input");
      if (input) input.value = "";
      onUploaded();
    } catch (err) {
      setError("Error al subir: " + (err.message || "Error desconocido"));
    }
    setUploading(false);
  };

  const willAutoDelete = videoCount >= maxVideos;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-6"
    >
      <h2 className="font-semibold text-[#2e211c] mb-3">Subir nuevo video</h2>

      {willAutoDelete && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3 text-sm text-amber-800">
          Al subir un nuevo video, el mas antiguo se eliminara automaticamente
          (maximo {maxVideos} videos).
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo de video
          </label>
          <input
            id="video-file-input"
            type="file"
            accept=".mp4,.webm,.mov"
            onChange={(e) => {
              setFile(e.target.files[0] || null);
              setError("");
            }}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
          />
          <p className="text-xs text-gray-400 mt-1">
            Formatos: .mp4, .webm, .mov | Maximo: 50 MB
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titulo (se muestra en las stories)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: La mejor croqueta del mundo"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <Btn
          type="submit"
          disabled={uploading || !file}
          className="bg-[#2e211c] text-white hover:bg-[#4a3830] px-6"
        >
          {uploading ? "Subiendo..." : "Subir video"}
        </Btn>
      </div>
    </form>
  );
}

// ─── Video List ───────────────────────────────────────────

function VideoList({ videos, onDeleted, maxVideos }) {
  const [deleting, setDeleting] = useState(null);
  const supabase = getSupabaseClient();

  const getVideoUrl = (filename) => {
    if (!supabase) return "#";
    const { data } = supabase.storage.from("videos").getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleDelete = async (video) => {
    if (!window.confirm(`Eliminar "${video.title || video.filename}"?`)) return;
    setDeleting(video.id);
    try {
      await deleteVideo(video.id, video.filename);
      onDeleted();
    } catch (err) {
      alert("Error al eliminar: " + (err.message || "Error desconocido"));
    }
    setDeleting(null);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-[#2e211c]">
          Videos actuales
        </h2>
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            videos.length >= maxVideos
              ? "bg-amber-100 text-amber-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {videos.length}/{maxVideos}
        </span>
      </div>

      {videos.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay videos.</p>
      ) : (
        <div className="space-y-2">
          {videos.map((video, idx) => (
            <div
              key={video.id}
              className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3"
            >
              <span className="text-xs text-gray-400 font-mono w-6 text-center">
                {idx + 1}
              </span>

              <video
                src={getVideoUrl(video.filename)}
                className="w-16 h-16 object-cover rounded bg-black flex-shrink-0"
                muted
                preload="metadata"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2e211c] truncate">
                  {video.title || "(sin titulo)"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {video.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(video.created_at)}
                </p>
              </div>

              <Btn
                onClick={() => handleDelete(video)}
                disabled={deleting === video.id}
                className="bg-red-100 text-red-700 hover:bg-red-200 flex-shrink-0"
              >
                {deleting === video.id ? "..." : "Eliminar"}
              </Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Event Log ────────────────────────────────────────────

function EventLog({ events }) {
  const [open, setOpen] = useState(false);

  if (events.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between"
      >
        <span>Registro de actividad ({events.length})</span>
        <span className="text-xs">{open ? "Ocultar" : "Mostrar"}</span>
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {events.map((event) => (
            <div
              key={event.id}
              className="px-4 py-2 flex items-center gap-3 text-sm"
            >
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${eventColor(event.event_type)}`}
              >
                {eventLabel(event.event_type)}
              </span>
              <span className="text-gray-700 truncate flex-1">
                {event.filename}
                {event.title ? ` - ${event.title}` : ""}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatDate(event.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Max Videos Setting ───────────────────────────────────

function MaxVideosSetting({ maxVideos, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(maxVideos);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(maxVideos);
  }, [maxVideos]);

  const handleSave = async () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1 || n > 50) return;
    setSaving(true);
    try {
      await setMaxVideos(n);
      onChanged();
      setEditing(false);
    } catch (err) {
      alert("Error al guardar: " + (err.message || "Error desconocido"));
    }
    setSaving(false);
  };

  if (!editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600">Maximo de videos: </span>
          <span className="font-semibold text-[#2e211c]">{maxVideos}</span>
        </div>
        <Btn
          onClick={() => setEditing(true)}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Cambiar
        </Btn>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Maximo de videos (1-50)
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={50}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <Btn
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2e211c] text-white hover:bg-[#4a3830]"
        >
          {saving ? "Guardando..." : "Guardar"}
        </Btn>
        <Btn
          onClick={() => {
            setValue(maxVideos);
            setEditing(false);
          }}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </Btn>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────

export default function VideoAdminPanel() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [videos, setVideos] = useState([]);
  const [events, setEvents] = useState([]);
  const [maxVideos, setMaxVideosState] = useState(10);
  const [message, setMessage] = useState(null);

  const supabase = getSupabaseClient();

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf2]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-xl font-bold text-red-700 mb-3">
            Error de configuracion
          </h1>
          <p className="text-gray-600">
            Las variables de entorno de Supabase no estan configuradas.
          </p>
        </div>
      </div>
    );
  }

  // Auth check
  useEffect(() => {
    getAdminSession().then((s) => {
      setSession(s);
      setChecking(false);
    });
    const subscription = onAuthChange((s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [vids, evts, max] = await Promise.all([
        getVideoMetadata(),
        getVideoEvents(),
        getMaxVideos(),
      ]);
      setVideos(vids);
      setEvents(evts);
      setMaxVideosState(max);
    } catch (err) {
      flash("Error al cargar datos: " + err.message, "error");
    }
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  const flash = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUploaded = async () => {
    flash("Video subido correctamente");
    await loadData();
  };

  const handleDeleted = async () => {
    flash("Video eliminado");
    await loadData();
  };

  const handleLogout = async () => {
    await adminSignOut();
    setSession(null);
  };

  // Loading
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf2]">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  // Login
  if (!session) {
    return <LoginForm onLogin={loadData} />;
  }

  // Admin UI
  return (
    <div className="min-h-screen bg-[#fafaf2]">
      {/* Header */}
      <header className="bg-[#2e211c] text-white px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-bold text-lg">Admin Videos - El Calvo</h1>
        <div className="flex items-center gap-2">
          <a
            href="/admin"
            className="px-3 py-1.5 rounded text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            Carta / Horario
          </a>
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

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        <MaxVideosSetting maxVideos={maxVideos} onChanged={loadData} />
        <UploadForm onUploaded={handleUploaded} videoCount={videos.length} maxVideos={maxVideos} />
        <VideoList videos={videos} onDeleted={handleDeleted} maxVideos={maxVideos} />
        <EventLog events={events} />
      </div>
    </div>
  );
}
