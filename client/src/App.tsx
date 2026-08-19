import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  LoaderCircle,
  MapPin,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:3333";
type User = { id: string; name: string; email: string };
type Trip = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
};
const highlights = [
  {
    icon: Compass,
    label: "Planejamento inteligente",
    text: "Sua viagem começa com clareza.",
  },
  {
    icon: Check,
    label: "Checklist que entende você",
    text: "Itens pensados para cada destino.",
  },
  {
    icon: MapPin,
    label: "Tudo em um só lugar",
    text: "Do primeiro plano ao embarque.",
  },
];

export default function App() {
  const [user, setUser] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem("packwise-user") ?? "null"),
  );
  const [trips, setTrips] = useState<Trip[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [tripOpen, setTripOpen] = useState(false);
  async function loadTrips(token: string) {
    const response = await fetch(`${API_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) setTrips(await response.json());
  }
  useEffect(() => {
    const token = localStorage.getItem("packwise-token");
    if (user && token) void loadTrips(token);
  }, [user]);
  useEffect(() => {
    const inviteCode = window.location.pathname.match(/^\/join\/([^/]+)/)?.[1];
    const token = localStorage.getItem("packwise-token");
    if (!inviteCode || !user || !token) return;
    fetch(`${API_URL}/trips/join/${inviteCode}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); toast.success(`Você entrou em ${data.trip.title}!`); window.history.replaceState({}, "", "/"); window.location.reload(); }).catch((error) => toast.error(error instanceof Error ? error.message : "Convite inválido."));
  }, [user]);
  function openAuth(mode: "login" | "register") {
    setAuthMode(mode);
    setAuthOpen(true);
  }
  function finishAuth(nextUser: User, token: string) {
    localStorage.setItem("packwise-token", token);
    localStorage.setItem("packwise-user", JSON.stringify(nextUser));
    setUser(nextUser);
    setAuthOpen(false);
    void loadTrips(token);
    toast.success(`Bem-vindo, ${nextUser.name}!`);
  }
  if (user)
    return (
      <Dashboard
        user={user}
        trips={trips}
        onNewTrip={() => setTripOpen(true)}
        onLogout={() => {
          localStorage.clear();
          setUser(null);
        }}
        tripOpen={tripOpen}
        setTripOpen={setTripOpen}
        setTrips={setTrips}
      />
    );
  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          PackWise
        </div>
        <button className="nav-link" onClick={() => openAuth("login")}>
          Entrar <ArrowRight size={16} />
        </button>
      </nav>
      <section className="hero">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="eyebrow">
            <span /> Planeje com leveza
          </p>
          <h1>
            A próxima viagem começa <em>antes</em> de fazer as malas.
          </h1>
          <p className="hero-text">
            Crie seu roteiro, organize o que importa e viaje com a tranquilidade
            de quem está pronto para viver o caminho.
          </p>
          <button
            className="primary-button"
            onClick={() => openAuth("register")}
          >
            Criar minha primeira viagem <ArrowRight size={18} />
          </button>
        </motion.div>
        <TripPreview />
      </section>
      <section className="highlights">
        {highlights.map(({ icon: Icon, label, text }) => (
          <div className="highlight" key={label}>
            <div className="highlight-icon">
              <Icon size={18} />
            </div>
            <div>
              <strong>{label}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>
      {authOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={finishAuth}
        />
      )}
    </main>
  );
}

function TripPreview() {
  return (
    <motion.div
      className="hero-card-wrap"
      initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      <div className="hero-card-glow" />
      <div className="trip-card">
        <div className="trip-image">
          <span>Próxima aventura</span>
          <strong>Lisboa</strong>
          <small>Portugal · 12 — 20 maio</small>
        </div>
        <div className="trip-progress">
          <div>
            <span>Preparação</span>
            <strong>68%</strong>
          </div>
          <div className="progress-track">
            <i />
          </div>
        </div>
        <div className="trip-items">
          <span>
            <b className="dot coral" /> Documentos
          </span>
          <strong>4 / 4</strong>
          <span>
            <b className="dot ocean" /> Roupas & calçados
          </span>
          <strong>8 / 12</strong>
          <span>
            <b className="dot amber" /> Experiências
          </span>
          <strong>2 / 5</strong>
        </div>
      </div>
    </motion.div>
  );
}

function AuthModal({
  mode,
  setMode,
  onClose,
  onSuccess,
}: {
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register" ? { name, email, password } : { email, password },
        ),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? "Não foi possível continuar.");
      onSuccess(data.user, data.token);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível continuar.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="close-button" onClick={onClose}>
          <X size={18} />
        </button>
        <span className="modal-kicker">
          <Sparkles size={15} /> PACKWISE
        </span>
        <h2>
          {mode === "register" ? "Comece a planejar." : "Que bom te ver."}
        </h2>
        <p>
          {mode === "register"
            ? "Crie sua conta para montar sua primeira viagem."
            : "Entre para continuar seu planejamento."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Seu nome
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar?"
              />
            </label>
          )}
          <label>
            E-mail
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </label>
          <label>
            Senha
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
            />
          </label>
          <button className="primary-button full-button" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {mode === "register" ? "Criar conta" : "Entrar"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>
        <button
          className="switch-auth"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
        >
          {mode === "register"
            ? "Já tenho uma conta"
            : "Ainda não tenho uma conta"}
        </button>
      </motion.div>
    </div>
  );
}

function Dashboard({
  user,
  trips,
  onNewTrip,
  onLogout,
  tripOpen,
  setTripOpen,
  setTrips,
}: {
  user: User;
  trips: Trip[];
  onNewTrip: () => void;
  onLogout: () => void;
  tripOpen: boolean;
  setTripOpen: (open: boolean) => void;
  setTrips: (trips: Trip[]) => void;
}) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  if (selectedTripId)
    return (
      <TripDetail
        tripId={selectedTripId}
        onBack={() => setSelectedTripId(null)}
      />
    );
  return (
    <main className="dashboard-shell">
      <nav className="nav">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          PackWise
        </div>
        <button className="nav-link" onClick={onLogout}>
          Sair
        </button>
      </nav>
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">
            <span /> Seu espaço de viagem
          </p>
          <h1>
            Olá, <em>{user.name.split(" ")[0]}.</em>
          </h1>
          <p className="hero-text">
            Tudo pronto para transformar planos em memórias?
          </p>
        </div>
        <button className="primary-button" onClick={onNewTrip}>
          <Plus size={18} /> Nova viagem
        </button>
      </section>
      <section className="trip-grid">
        {trips.length === 0 ? (
          <div className="empty-state">
            <MapPin size={24} />
            <h3>Sua próxima aventura começa aqui.</h3>
            <p>Crie uma viagem e o PackWise ajuda a organizar tudo.</p>
            <button className="primary-button" onClick={onNewTrip}>
              Criar viagem <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          trips.map((trip) => (
            <article className="saved-trip" key={trip.id}>
              <span className="trip-label">
                {trip.tripType === "SOLO" ? "Viagem solo" : "Viagem em grupo"}
              </span>
              <h3>{trip.title}</h3>
              <p>
                <MapPin size={15} /> {trip.destination}
              </p>
              <button
                className="text-button"
                onClick={() => setSelectedTripId(trip.id)}
              >
                Abrir viagem <ArrowRight size={15} />
              </button>
            </article>
          ))
        )}
      </section>
      {tripOpen && (
        <TripModal
          onClose={() => setTripOpen(false)}
          onCreated={(trip) => {
            setTrips([trip, ...trips]);
            setTripOpen(false);
          }}
        />
      )}
    </main>
  );
}

function TripDetail({
  tripId,
  onBack,
}: {
  tripId: string;
  onBack: () => void;
}) {
  const [trip, setTrip] = useState<any>(null);
  const [filter, setFilter] = useState("ALL");
  const [itemOpen, setItemOpen] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/trips/${tripId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("packwise-token")}`,
      },
    })
      .then((response) => response.json())
      .then(setTrip)
      .catch(() => toast.error("Não foi possível carregar a viagem."));
  }, [tripId]);
  if (!trip)
    return (
      <main className="dashboard-shell">
        <button className="text-button" onClick={onBack}>
          ← Voltar
        </button>
        <p>Carregando viagem...</p>
      </main>
    );
  const allItems = trip.categories.flatMap((category: any) =>
    category.items.map((item: any) => ({
      ...item,
      categoryName: category.name,
      categoryIcon: category.icon,
    })),
  );
  const visibleItems = allItems.filter(
    (item: any) =>
      filter === "ALL" ||
      (filter === "PENDING" && !item.isPacked) ||
      (filter === "DONE" && item.isPacked),
  );
  const packed = allItems.filter((item: any) => item.isPacked).length;
  const progress = allItems.length
    ? Math.round((packed / allItems.length) * 100)
    : 0;
  async function toggleItem(item: any) {
    const response = await fetch(
      `${API_URL}/trips/${tripId}/items/${item.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("packwise-token")}`,
        },
      },
    );
    if (response.ok)
      setTrip({
        ...trip,
        categories: trip.categories.map((category: any) => ({
          ...category,
          items: category.items.map((entry: any) =>
            entry.id === item.id
              ? { ...entry, isPacked: !entry.isPacked }
              : entry,
          ),
        })),
      });
  }
  return (
    <main className="dashboard-shell">
      <nav className="nav detail-nav">
        <button className="text-button" onClick={onBack}>
          ← Minhas viagens
        </button>
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          PackWise
        </div>
        <span />
      </nav>
      <section className="detail-heading">
        <p className="eyebrow">
          <span />{" "}
          {trip.tripType === "SOLO" ? "Viagem solo" : "Viagem em grupo"}
        </p>
        <h1>{trip.destination}</h1>
        <p className="hero-text">
          {trip.title} · {new Date(trip.startDate).toLocaleDateString("pt-BR")}{" "}
          — {new Date(trip.endDate).toLocaleDateString("pt-BR")}
        </p>
        <div className="detail-progress">
          <div>
            <span>Progresso da mala</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
        {trip.weather && <WeatherCard weather={trip.weather} />}
        {trip.tripType === "GROUP" && <div className="members-strip"><span>{trip.members.length} {trip.members.length === 1 ? "participante" : "participantes"}</span><div className="member-avatars">{trip.members.slice(0, 5).map((member: any) => <span className="member-avatar" title={member.user.name} key={member.user.id}>{member.user.name.charAt(0).toUpperCase()}</span>)}</div><button className="invite-button" onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}/join/${trip.inviteCode}`); toast.success("Link de convite copiado!"); }}>Convidar pessoas</button></div>}
      </section>
      <div className="checklist-toolbar">
        <h2>Checklist inteligente</h2>
        <div className="checklist-actions">
          <div className="filters">
            {[
              ["ALL", "Todos"],
              ["PENDING", "Pendentes"],
              ["DONE", "Concluídos"],
            ].map(([value, label]) => (
              <button
                className={filter === value ? "active" : ""}
                key={value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="add-item-button" onClick={() => setItemOpen(true)}>
            <Plus size={16} /> Adicionar item
          </button>
        </div>
      </div>
      <section className="checklist-grid">
        {visibleItems.length ? (
          visibleItems.map((item: any) => (
            <button
              className={`check-item ${item.isPacked ? "packed" : ""}`}
              key={item.id}
              onClick={() => void toggleItem(item)}
            >
              <span className="check-circle">
                {item.isPacked ? <Check size={14} /> : null}
              </span>
              <span className="check-copy">
                <strong>{item.title}</strong>
                <small>
                  {item.categoryIcon} {item.categoryName} · {item.quantity}{" "}
                  {item.quantity === 1 ? "unidade" : "unidades"} ·{" "}
                  {item.visibility === "PRIVATE"
                    ? "privado"
                    : item.visibility === "SECRET"
                      ? "secreto"
                      : "compartilhado"}
                </small>
              </span>
            </button>
          ))
        ) : (
          <div className="empty-checklist">
            <Plus size={22} />
            <strong>Nenhum item por aqui</strong>
            <span>Adicione algo que você não quer esquecer.</span>
            <button
              className="primary-button"
              onClick={() => setItemOpen(true)}
            >
              Adicionar primeiro item
            </button>
          </div>
        )}
      </section>
      {itemOpen && (
        <AddItemModal
          tripId={tripId}
          categories={trip.categories}
          onClose={() => setItemOpen(false)}
          onCreated={(item) => {
            const category = trip.categories.find(
              (entry: any) => entry.id === item.categoryId,
            );
            if (category)
              setTrip({
                ...trip,
                categories: trip.categories.map((entry: any) =>
                  entry.id === category.id
                    ? { ...entry, items: [...entry.items, item] }
                    : entry,
                ),
              });
            else
              setTrip({
                ...trip,
                categories: [
                  {
                    id: item.categoryId,
                    name: "Itens personalizados",
                    icon: "📌",
                    items: [item],
                  },
                  ...trip.categories,
                ],
              });
            setItemOpen(false);
          }}
        />
      )}
    </main>
  );
}

function WeatherCard({ weather }: { weather: any }) {
  const first = weather.daily?.[0];
  return <div className="weather-card"><div className="weather-icon">{weather.available ? '☀️' : '🌤️'}</div><div><strong>{weather.available && first ? `${first.max}° / ${first.min}° · ${first.label}` : 'Previsão do tempo'}</strong><span>{weather.location ?? 'Destino da viagem'} · {weather.message ?? `Probabilidade de chuva: ${first?.rainProbability ?? 0}%`}</span></div></div>;
}

function AddItemModal({
  tripId,
  categories,
  onClose,
  onCreated,
}: {
  tripId: string;
  categories: any[];
  onClose: () => void;
  onCreated: (item: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [visibility, setVisibility] = useState("SHARED");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/trips/${tripId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("packwise-token")}`,
        },
        body: JSON.stringify({ title, quantity, visibility, categoryId }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? "Não foi possível adicionar o item.");
      toast.success("Item adicionado!");
      onCreated(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o item.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="close-button" onClick={onClose}>
          <X size={18} />
        </button>
        <span className="modal-kicker">
          <Plus size={15} /> CHECKLIST
        </span>
        <h2>Adicionar item.</h2>
        <p>Inclua algo importante para esta viagem.</p>
        <form onSubmit={submit}>
          <label>
            O que você precisa levar?
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Adaptador de tomada"
            />
          </label>
          <div className="form-row">
            <label>
              Categoria
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {categories.map((category: any) => (
                  <option value={category.id} key={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantidade
              <input
                required
                min="1"
                max="99"
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
          </div>
          <label>
            Visibilidade
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
            >
              <option value="SHARED">Compartilhado — todos podem ver</option>
              <option value="PRIVATE">Privado — só eu vejo</option>
              <option value="SECRET">
                Secreto — aparece como item secreto
              </option>
            </select>
          </label>
          <button className="primary-button full-button" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            Adicionar item <ArrowRight size={17} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function TripModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (trip: Trip) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    tripType: "SOLO",
    weatherType: "MODERATE_MIXED",
    transportType: "PLANE",
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const update = (key: string, value: string) =>
    setForm({ ...form, [key]: value });
  useEffect(() => {
    const query = form.destination.trim();
    if (query.length < 2 || selectedLocation?.label === query) { setSuggestions([]); return; }
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/weather/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${localStorage.getItem("packwise-token")}` } });
        if (response.ok) setSuggestions((await response.json()).results ?? []);
      } catch { setSuggestions([]); }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [form.destination, selectedLocation]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedLocation) { toast.error("Selecione um destino da lista de sugestões."); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("packwise-token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? "Não foi possível criar a viagem.");
      toast.success("Viagem criada!");
      onCreated(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar viagem.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal trip-modal"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="close-button" onClick={onClose}>
          <X size={18} />
        </button>
        <span className="modal-kicker">
          <MapPin size={15} /> NOVA VIAGEM
        </span>
        <h2>Para onde vamos?</h2>
        <form onSubmit={submit}>
          <label>
            Nome da viagem
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Férias de verão"
            />
          </label>
          <label>
            Destino
            <div className="location-autocomplete"><input required value={form.destination} onChange={(e) => { update("destination", e.target.value); setSelectedLocation(null); }} placeholder="Digite uma cidade ou país" autoComplete="off" />{suggestions.length > 0 && <div className="suggestions-list">{suggestions.map((suggestion) => <button type="button" className="suggestion" key={suggestion.id} onClick={() => { const label = `${suggestion.name}, ${suggestion.country}`; update("destination", label); setSelectedLocation({ ...suggestion, label }); setSuggestions([]); }}><MapPin size={15} /><span><strong>{suggestion.name}</strong><small>{[suggestion.admin1, suggestion.country].filter(Boolean).join(", ")}</small></span></button>)}</div>}</div>
          </label>
          <div className="form-row">
            <label>
              Data de ida
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </label>
            <label>
              Data de volta
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Tipo
              <select
                value={form.tripType}
                onChange={(e) => update("tripType", e.target.value)}
              >
                <option value="SOLO">Solo</option>
                <option value="GROUP">Em grupo</option>
              </select>
            </label>
            <label>
              Transporte
              <select
                value={form.transportType}
                onChange={(e) => update("transportType", e.target.value)}
              >
                <option value="PLANE">Avião</option>
                <option value="CAR">Carro</option>
                <option value="BUS">Ônibus</option>
                <option value="TRAIN">Trem</option>
              </select>
            </label>
          </div>
          <label>
            Clima esperado
            <select
              value={form.weatherType}
              onChange={(e) => update("weatherType", e.target.value)}
            >
              <option value="MODERATE_MIXED">Moderado / misto</option>
              <option value="BEACH_HOT">Praia / calor</option>
              <option value="RAINY">Chuvoso</option>
              <option value="EXTREME_COLD">Frio extremo</option>
            </select>
          </label>
          <button className="primary-button full-button" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}Criar
            viagem <ArrowRight size={17} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
