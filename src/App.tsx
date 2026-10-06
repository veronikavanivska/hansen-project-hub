import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Activity as ActivityIcon,
  ArrowRight,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Eye,
  FileText,
  FolderKanban,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Truck,
  Upload,
  X,
} from "lucide-react";
import hansenLogo from "./assets/hansen-logo.png";
import { I18nProvider, LanguageSwitch, useI18n } from "./i18n";
import {
  demoUsers,
  initialActivities,
  initialDocuments,
  initialMessages,
  initialProjects,
  initialQuotations,
  initialShipmentHistory,
  initialShipments,
} from "./demoData";
import type {
  Activity,
  AppView,
  Currency,
  DemoUser,
  DocumentItem,
  Message,
  Project,
  ProjectStatus,
  Quotation,
  Shipment,
  ShipmentHistory,
  ShipmentStatus,
  UserRole,
} from "./types";

const SHOW_AI = false;
const STORAGE = {
  users: "hansen_demo_users_v3",
  session: "hansen_demo_session_v3",
  projects: "hansen_demo_projects_v3",
  documents: "hansen_demo_documents_v3",
  quotations: "hansen_demo_quotations_v3",
  shipments: "hansen_demo_shipments_v3",
  shipmentHistory: "hansen_demo_shipment_history_v3",
  messages: "hansen_demo_messages_v3",
  activities: "hansen_demo_activities_v3",
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue));
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue] as const;
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Internal Team",
  supplier: "Hansen Polska",
};

const projectStatuses: ProjectStatus[] = [
  "Inquiry",
  "Technical Review",
  "Quotation",
  "Contract",
  "Production",
  "Shipping",
  "Delivered",
];

const shipmentStatuses: ShipmentStatus[] = ["Planning", "Production", "Ready", "In transit", "Delivered"];
const shipmentProgress: Record<ShipmentStatus, number> = {
  Planning: 20,
  Production: 55,
  Ready: 75,
  "In transit": 90,
  Delivered: 100,
};

const formatMoney = (value: number, currency: Currency) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

const nowDateTime = () =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

const nowTime = () =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date());

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function KpiCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <article className="kpi-card panel">
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-hint">{hint}</span>
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

type AuthMode = "login" | "register";

function AuthScreen({
  users,
  onLogin,
  onRegister,
}: {
  users: DemoUser[];
  onLogin: (email: string, password: string) => string | null;
  onRegister: (data: Omit<DemoUser, "id">) => string | null;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [error, setError] = useState("");

  const submitLogin = (event: FormEvent) => {
    event.preventDefault();
    setError(onLogin(email, password) ?? "");
  };

  const submitRegister = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Complete all required fields.");
      return;
    }
    setError(
      onRegister({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        company: company.trim() || (role === "supplier" ? "Hansen" : "Internal Team"),
        position: position.trim() || (role === "supplier" ? "Supplier" : "Administrator"),
      }) ?? "",
    );
  };

  const fillDemo = (user: DemoUser) => {
    setEmail(user.email);
    setPassword(user.password);
    setError("");
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <img src={hansenLogo} alt="Hansen Polska" />
          <div>
            <strong>Hansen Project Hub</strong>
            <span>{t("Project collaboration workspace")}</span>
          </div>
        </div>

        <div className="auth-hero">
          <span className="auth-pill">{t("PRIVATE COLLABORATION PLATFORM")}</span>
          <h1>{t("One place for every project exchange.")}</h1>
          <p>
            {t("Technical files, quotations, project communication and logistics shared between the internal team and Hansen Polska.")}
          </p>
          <div className="auth-feature-list">
            <div>
              <span><FolderKanban size={18} /></span>
              <div><strong>{t("Project workspace")}</strong><p>{t("Keep every project, file and revision organised.")}</p></div>
            </div>
            <div>
              <span><FileText size={18} /></span>
              <div><strong>{t("Shared documentation")}</strong><p>{t("Architecture, schedules, quotations and technical output.")}</p></div>
            </div>
            <div>
              <span><Truck size={18} /></span>
              <div><strong>{t("Live logistics")}</strong><p>{t("Update shipping information with a complete audit trail.")}</p></div>
            </div>
          </div>
        </div>
        <div className="auth-footer">{t("Demo environment · Data is stored locally in this browser")}</div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-card"><div className="auth-language"><LanguageSwitch /></div>
          <div className="auth-mobile-logo"><img src={hansenLogo} alt="Hansen Polska" /></div>
          <div className="auth-mode">
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>{t("Log in")}</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>{t("Register")}</button>
          </div>

          {mode === "login" ? (
            <>
              <div className="auth-heading">
                <span>{t("WELCOME BACK")}</span>
                <h2>{t("Sign in to your workspace")}</h2>
                <p>{t("Use a demo account or create your own local account.")}</p>
              </div>
              <form className="auth-form" onSubmit={submitLogin}>
                <label>
                  <span>{t("Email address")}</span>
                  <div className="auth-input"><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></div>
                </label>
                <label>
                  <span>{t("Password")}</span>
                  <div className="auth-input"><LockKeyhole size={16} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
                </label>
                {error && <div className="auth-error">{error}</div>}
                <button className="auth-submit" type="submit">Log in <ArrowRight size={16} /></button>
              </form>

              <div className="demo-separator"><span>{t("Demo accounts")}</span></div>
              <div className="demo-accounts">
                {users.filter((user) => user.id <= 2).map((user) => (
                  <button key={user.id} onClick={() => fillDemo(user)}>
                    <span className="demo-account-icon">{user.role === "admin" ? <ShieldCheck size={17} /> : <Building2 size={17} />}</span>
                    <div><strong>{t(ROLE_LABEL[user.role])}</strong><span>{user.email}</span></div>
                    <small>{t("Use")}</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="auth-heading">
                <span>{t("DEMO REGISTRATION")}</span>
                <h2>{t("Create an account")}</h2>
                <p>{t("The account will be stored locally and can be used again after logout.")}</p>
              </div>
              <form className="auth-form register-form" onSubmit={submitRegister}>
                <label><span>{t("Full name *")}</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
                <label><span>{t("Email *")}</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></label>
                <label><span>{t("Password *")}</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" /></label>
                <label>
                  <span>{t("Account type")}</span>
                  <select value={role} onChange={(e) => { const next = e.target.value as UserRole; setRole(next); if (next === "supplier") setCompany("Hansen"); }}>
                    <option value="admin">{t("Internal Team")}</option>
                    <option value="supplier">Hansen Polska</option>
                  </select>
                </label>
                <label><span>{t("Company")}</span><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={role === "supplier" ? "Hansen" : "Company name"} /></label>
                <label><span>{t("Position")}</span><input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Project manager" /></label>
                {error && <div className="auth-error register-error">{error}</div>}
                <button className="auth-submit register-submit" type="submit">{t("Create account")} <ArrowRight size={16} /></button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [users, setUsers] = usePersistentState<DemoUser[]>(STORAGE.users, demoUsers);
  const [sessionUserId, setSessionUserId] = usePersistentState<number | null>(STORAGE.session, null);
  const [projects, setProjects] = usePersistentState<Project[]>(STORAGE.projects, initialProjects);
  const [documents, setDocuments] = usePersistentState<DocumentItem[]>(STORAGE.documents, initialDocuments);
  const [quotations, setQuotations] = usePersistentState<Quotation[]>(STORAGE.quotations, initialQuotations);
  const [shipments, setShipments] = usePersistentState<Shipment[]>(STORAGE.shipments, initialShipments);
  const [shipmentHistory, setShipmentHistory] = usePersistentState<ShipmentHistory[]>(STORAGE.shipmentHistory, initialShipmentHistory);
  const [messages, setMessages] = usePersistentState<Message[]>(STORAGE.messages, initialMessages);
  const [activities, setActivities] = usePersistentState<Activity[]>(STORAGE.activities, initialActivities);

  const user = users.find((item) => item.id === sessionUserId) ?? null;

  const login = (email: string, password: string) => {
    const found = users.find(
      (item) => item.email.toLowerCase().trim() === email.toLowerCase().trim() && item.password === password,
    );
    if (!found) return "Incorrect email or password.";
    setSessionUserId(found.id);
    return null;
  };

  const register = (data: Omit<DemoUser, "id">) => {
    if (users.some((item) => item.email.toLowerCase() === data.email.toLowerCase())) {
      return "An account with this email already exists.";
    }
    const newUser: DemoUser = { id: Date.now(), ...data };
    setUsers((current) => [...current, newUser]);
    setSessionUserId(newUser.id);
    return null;
  };

  if (!user) return <AuthScreen users={users} onLogin={login} onRegister={register} />;

  const resetDemo = () => {
    setProjects(initialProjects);
    setDocuments(initialDocuments);
    setQuotations(initialQuotations);
    setShipments(initialShipments);
    setShipmentHistory(initialShipmentHistory);
    setMessages(initialMessages);
    setActivities(initialActivities);
  };

  return (
    <Workspace
      user={user}
      onLogout={() => setSessionUserId(null)}
      projects={projects}
      setProjects={setProjects}
      documents={documents}
      setDocuments={setDocuments}
      quotations={quotations}
      setQuotations={setQuotations}
      shipments={shipments}
      setShipments={setShipments}
      shipmentHistory={shipmentHistory}
      setShipmentHistory={setShipmentHistory}
      messages={messages}
      setMessages={setMessages}
      activities={activities}
      setActivities={setActivities}
      resetDemo={resetDemo}
    />
  );
}

type WorkspaceProps = {
  user: DemoUser;
  onLogout: () => void;
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  documents: DocumentItem[];
  setDocuments: Dispatch<SetStateAction<DocumentItem[]>>;
  quotations: Quotation[];
  setQuotations: Dispatch<SetStateAction<Quotation[]>>;
  shipments: Shipment[];
  setShipments: Dispatch<SetStateAction<Shipment[]>>;
  shipmentHistory: ShipmentHistory[];
  setShipmentHistory: Dispatch<SetStateAction<ShipmentHistory[]>>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  activities: Activity[];
  setActivities: Dispatch<SetStateAction<Activity[]>>;
  resetDemo: () => void;
};

function Workspace({
  user,
  onLogout,
  projects,
  setProjects,
  documents,
  setDocuments,
  quotations,
  setQuotations,
  shipments,
  setShipments,
  shipmentHistory,
  setShipmentHistory,
  messages,
  setMessages,
  activities,
  setActivities,
  resetDemo,
}: WorkspaceProps) {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? 0);
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(documents[0]?.id ?? 0);
  const [selectedQuotationId, setSelectedQuotationId] = useState(quotations[0]?.id ?? 0);
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id ?? 0);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [messageText, setMessageText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const isAdmin = user.role === "admin";

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const visibleProjects = useMemo(() => {
    if (user.role === "admin") return projects;
    return projects.filter((project) => project.supplier.toLowerCase().includes("hansen"));
  }, [projects, user.role]);

  const filteredProjects = useMemo(() => {
    const normalized = projectSearch.trim().toLowerCase();
    if (!normalized) return visibleProjects;
    return visibleProjects.filter((project) =>
      `${project.name} ${project.client} ${project.city} ${project.reference}`.toLowerCase().includes(normalized),
    );
  }, [visibleProjects, projectSearch]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? visibleProjects[0] ?? null;

  useEffect(() => {
    if (selectedProject && visibleProjects.some((project) => project.id === selectedProject.id)) return;
    if (visibleProjects[0]) setSelectedProjectId(visibleProjects[0].id);
  }, [visibleProjects, selectedProject]);

  const navItems: { id: AppView; label: string; icon: ReactNode }[] = [
    { id: "dashboard", label: t("Dashboard"), icon: <LayoutDashboard size={18} /> },
    { id: "projects", label: t("Projects"), icon: <FolderKanban size={18} /> },
    { id: "files", label: t("Files"), icon: <ClipboardList size={18} /> },
    { id: "quotations", label: t("Quotations"), icon: <CircleDollarSign size={18} /> },
    { id: "messages", label: t("Messages"), icon: <MessageSquare size={18} /> },
    { id: "shipping", label: t("Shipping"), icon: <Truck size={18} /> },
    { id: "ai", label: "Ghost AI", icon: <Bot size={18} /> },
  ];
  const visibleNav = navItems.filter((item) => item.id !== "ai" || (SHOW_AI && isAdmin));

  const addActivity = (projectId: number, title: string, description: string) => {
    setActivities((current) => [
      { id: Date.now(), projectId, title, description, createdBy: user.name, createdAt: nowDateTime() },
      ...current,
    ]);
  };

  const openProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setActiveView("projects");
  };

  const createProject = () => {
    setEditingProject({
      id: 0,
      name: "",
      client: "",
      city: "",
      country: "Poland",
      reference: "",
      supplier: "Hansen",
      status: "Inquiry",
      value: 0,
      currency: "EUR",
      units: 0,
      area: 0,
      system: "Inova 76",
      owner: user.name,
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setShowProjectModal(true);
  };

  const saveProject = () => {
    if (!editingProject || !editingProject.name.trim()) return;
    if (editingProject.id === 0) {
      const id = Date.now();
      const project = { ...editingProject, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setProjects((current) => [project, ...current]);
      setShipments((current) => [
        ...current,
        {
          id: Date.now() + 1,
          projectId: id,
          status: "Planning",
          plannedDispatch: "",
          eta: "",
          carrier: "",
          trackingNumber: "",
          deliveryAddress: `${project.city}, ${project.country}`,
          notes: "",
          progress: 20,
          updatedBy: user.name,
          updatedAt: nowDateTime(),
        },
      ]);
      addActivity(id, "Project created", `${project.name} was added to the collaboration workspace.`);
      setSelectedProjectId(id);
      setToast("Project created");
    } else {
      setProjects((current) => current.map((project) => project.id === editingProject.id ? { ...editingProject, updatedAt: new Date().toISOString() } : project));
      addActivity(editingProject.id, "Project updated", "Project information was updated.");
      setToast("Project updated");
    }
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
    const document: DocumentItem = {
      id: Date.now(),
      projectId: selectedProject.id,
      name: file.name,
      category: user.role === "supplier" ? "Technical" : "Other",
      fileType: extension,
      folder: user.role === "supplier" ? "Hansen / Uploaded" : "Internal / Uploaded",
      status: "Available",
      source: user.role === "supplier" ? "Hansen" : "Internal Team",
      uploadedBy: user.name,
      uploadedAt: nowDateTime(),
    };
    setDocuments((current) => [document, ...current]);
    setSelectedDocumentId(document.id);
    addActivity(selectedProject.id, "File uploaded", file.name);
    setToast("File added to demo project");
    event.target.value = "";
  };

  const saveQuotation = () => {
    if (!editingQuotation) return;
    setQuotations((current) => current.map((quotation) => quotation.id === editingQuotation.id ? editingQuotation : quotation));
    addActivity(editingQuotation.projectId, "Quotation updated", `${editingQuotation.number} was updated by ${user.name}.`);
    setEditingQuotation(null);
    setToast("Quotation saved");
  };

  const saveShipment = () => {
    if (!editingShipment) return;
    const existing = shipments.find((shipment) => shipment.id === editingShipment.id);
    if (!existing) return;
    const history: ShipmentHistory[] = [];
    const compare = (field: string, oldValue: string, newValue: string) => {
      if (oldValue === newValue) return;
      history.push({
        id: Date.now() + history.length,
        shipmentId: editingShipment.id,
        field,
        oldValue: oldValue || "—",
        newValue: newValue || "—",
        changedBy: user.name,
        changedAt: nowDateTime(),
      });
    };
    compare("Status", existing.status, editingShipment.status);
    compare("Planned dispatch", existing.plannedDispatch, editingShipment.plannedDispatch);
    compare("ETA", existing.eta, editingShipment.eta);
    compare("Carrier", existing.carrier, editingShipment.carrier);
    compare("Tracking number", existing.trackingNumber, editingShipment.trackingNumber);
    compare("Delivery address", existing.deliveryAddress, editingShipment.deliveryAddress);
    compare("Notes", existing.notes, editingShipment.notes);
    const saved = {
      ...editingShipment,
      progress: shipmentProgress[editingShipment.status],
      updatedBy: user.name,
      updatedAt: nowDateTime(),
    };
    setShipments((current) => current.map((shipment) => shipment.id === saved.id ? saved : shipment));
    if (history.length) setShipmentHistory((current) => [...current, ...history]);
    addActivity(saved.projectId, "Shipping updated", `${user.name} updated logistics information.`);
    setEditingShipment(null);
    setToast("Shipping updated");
  };

  const sendMessage = () => {
    if (!selectedProject || !messageText.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        projectId: selectedProject.id,
        authorRole: user.role,
        author: user.name,
        text: messageText.trim(),
        createdAt: nowTime(),
      },
    ]);
    setMessageText("");
  };

  const totalPipelineEUR = visibleProjects
    .filter((project) => project.status !== "Delivered" && project.currency === "EUR")
    .reduce((sum, project) => sum + project.value, 0);
  const totalPipelineUSD = visibleProjects
    .filter((project) => project.status !== "Delivered" && project.currency === "USD")
    .reduce((sum, project) => sum + project.value, 0);
  const reviewFiles = documents.filter((document) => document.status === "Needs review" && visibleProjects.some((project) => project.id === document.projectId));
  const activeShipments = shipments.filter((shipment) => shipment.status !== "Delivered" && visibleProjects.some((project) => project.id === shipment.projectId));

  const titleMap: Record<AppView, { eyebrow: string; title: string; description: string }> = {
    dashboard: {
      eyebrow: user.role === "admin" ? "INTERNAL WORKSPACE" : "SUPPLIER WORKSPACE",
      title: "Collaboration Dashboard",
      description: user.role === "admin"
        ? "Projects, documentation and Hansen collaboration in one operational workspace."
        : "Review assigned projects, quotations, shared documents and logistics.",
    },
    projects: { eyebrow: "PROJECT CENTER", title: "Projects", description: "Manage active projects and review their current status." },
    files: { eyebrow: "DOCUMENT CENTER", title: "Files", description: "Shared project documentation organised across all active projects." },
    quotations: { eyebrow: "COMMERCIAL CENTER", title: "Quotations", description: "Review and update supplier quotation details." },
    messages: { eyebrow: "COMMUNICATION", title: "Messages", description: "Project communication shared between the internal team and Hansen Polska." },
    shipping: { eyebrow: "LOGISTICS CENTER", title: "Shipping", description: "Manage production and transport status with a complete audit trail." },
    ai: { eyebrow: "GHOST AI", title: "AI Operations", description: "Internal automation layer." },
  };

  const attentionItems = [
    ...reviewFiles.slice(0, 2).map((document) => ({ id: `f-${document.id}`, projectId: document.projectId, title: t("Document review"), detail: document.name, icon: <FileText size={16} /> })),
    ...quotations.filter((q) => q.status === "Under review" || q.status === "Draft").slice(0, 2).map((q) => ({ id: `q-${q.id}`, projectId: q.projectId, title: t("Quotation update"), detail: q.number, icon: <CircleDollarSign size={16} /> })),
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src={hansenLogo} alt="Hansen Polska" />
          <div><strong>Hansen Project Hub</strong><span>{t("Facade engineering workspace")}</span></div>
        </div>
        <div className="workspace-role">
          <span>{user.role === "admin" ? "INTERNAL" : "SUPPLIER"}</span>
          <div>{user.role === "admin" ? <ShieldCheck size={16} /> : <Building2 size={16} />}<strong>{t(ROLE_LABEL[user.role])}</strong></div>
        </div>
        <nav className="nav">
          {visibleNav.map((item) => (
            <button key={item.id} className={`nav-item ${activeView === item.id ? "active" : ""}`} onClick={() => setActiveView(item.id)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="mini-user"><div className="mini-avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><span>{user.company}</span></div></div>
          <button className="nav-item" onClick={onLogout}><LogOut size={17} /><span>{t("Logout")}</span></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{t(titleMap[activeView].eyebrow)}</p>
            <h1>{t(titleMap[activeView].title)}</h1>
            <p className="page-description">{t(titleMap[activeView].description)}</p>
          </div>
          <div className="topbar-actions"><LanguageSwitch />
            <label className="global-search"><Search size={17} /><input value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} placeholder={t("Search projects...")} /></label>
            <button className="icon-button"><Bell size={18} /><span className="notification-dot" /></button>
            {isAdmin && <button className="primary-button" onClick={createProject}><Plus size={16} />{t("New project")}</button>}
            <div className="profile-wrapper">
              <button className="top-avatar" onClick={() => setProfileOpen(!profileOpen)}>{initials(user.name)}</button>
              {profileOpen && (
                <div className="profile-menu panel">
                  <div className="profile-menu-head"><strong>{user.name}</strong><span>{user.email}</span></div>
                  {isAdmin && <button onClick={() => { if (window.confirm("Reset demo data?")) { resetDemo(); setProfileOpen(false); setToast("Demo reset"); } }}><RotateCcw size={15} />Reset demo</button>}
                  <button onClick={onLogout}><LogOut size={15} />Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeView === "dashboard" && (
          <>
            <section className="kpi-grid">
              <KpiCard icon={<FolderKanban size={18} />} label={isAdmin ? "Active projects" : "Assigned projects"} value={String(visibleProjects.filter((p) => p.status !== "Delivered").length)} hint="current workspace" />
              <KpiCard icon={<CircleDollarSign size={18} />} label="Commercial pipeline" value={formatMoney(totalPipelineEUR, "EUR")} hint={totalPipelineUSD > 0 ? `${formatMoney(totalPipelineUSD, "USD")} USD` : "active pipeline"} />
              <KpiCard icon={<FileText size={18} />} label="Files to review" value={String(reviewFiles.length)} hint="requires attention" />
              <KpiCard icon={<Truck size={18} />} label="Active logistics" value={String(activeShipments.length)} hint="production & shipping" />
            </section>
            <section className="dashboard-grid">
              <div className="panel dashboard-project-panel">
                <div className="section-head"><div><span className="section-kicker">{t("Projects")}</span><h3>{t("Active workspace")}</h3></div><button className="link-button" onClick={() => setActiveView("projects")}>View all <ArrowRight size={14} /></button></div>
                <div className="dashboard-project-list">
                  {filteredProjects.slice(0, 5).map((project) => (
                    <button key={project.id} className="dashboard-project-row" onClick={() => openProject(project)}>
                      <div className="project-icon-box"><Building2 size={17} /></div>
                      <div className="project-primary"><strong>{project.name}</strong><span>{project.client} · {project.city}</span></div>
                      <span className="status-badge">{t(project.status)}</span>
                      <div className="project-value"><strong>{formatMoney(project.value, project.currency)}</strong><span>{project.units} units</span></div>
                      <ChevronRight size={17} />
                    </button>
                  ))}
                </div>
              </div>
              <aside className="panel attention-panel">
                <div className="section-head"><div><span className="section-kicker">{t("Attention")}</span><h3>{t("Requires action")}</h3></div><span className="attention-count">{attentionItems.length}</span></div>
                <div className="attention-list">
                  {attentionItems.map((item) => {
                    const project = projects.find((p) => p.id === item.projectId);
                    return (
                      <button key={item.id} className="attention-item" onClick={() => project && openProject(project)}>
                        <span className="attention-icon">{item.icon}</span>
                        <div><strong>{item.title}</strong><span>{project?.name}</span><small>{item.detail}</small></div>
                      </button>
                    );
                  })}
                </div>
                {!attentionItems.length && <div className="all-clear"><CheckCircle2 size={26} /><strong>Everything is up to date</strong></div>}
              </aside>
            </section>
            <section className="panel recent-activity-panel">
              <div className="section-head"><div><span className="section-kicker">Activity</span><h3>Recent updates</h3></div></div>
              <div className="activity-strip">
                {activities.filter((a) => visibleProjects.some((p) => p.id === a.projectId)).slice(0, 4).map((activity) => {
                  const project = projects.find((p) => p.id === activity.projectId);
                  return <div key={activity.id} className="activity-card"><span className="activity-icon"><ActivityIcon size={16} /></span><div><strong>{activity.title}</strong><span>{project?.name}</span><small>{activity.createdBy} · {activity.createdAt}</small></div></div>;
                })}
              </div>
            </section>
          </>
        )}

        {activeView === "projects" && (
          <section className="projects-layout">
            <div className="panel project-list-panel">
              <div className="section-head"><div><span className="section-kicker">{t("Project database")}</span><h3>{t("Projects")}</h3></div>{isAdmin && <button className="small-icon-button" onClick={createProject}><Plus size={16} /></button>}</div>
              <div className="project-list">
                {filteredProjects.map((project) => (
                  <button key={project.id} className={`project-list-row ${selectedProject?.id === project.id ? "selected" : ""}`} onClick={() => setSelectedProjectId(project.id)}>
                    <div><strong>{project.name}</strong><span>{project.reference} · {project.city}</span></div><span className="status-badge">{t(project.status)}</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedProject && (
              <div className="project-main">
                <section className="panel project-hero">
                  <div className="project-hero-top">
                    <div><div className="hero-location"><MapPin size={14} />{selectedProject.city}, {selectedProject.country}</div><h2>{selectedProject.name}</h2><p>{selectedProject.description}</p></div>
                    <div className="project-hero-actions"><span className="status-badge hero-status">{selectedProject.status}</span>{isAdmin && <button className="secondary-button" onClick={() => { setEditingProject({ ...selectedProject }); setShowProjectModal(true); }}><Pencil size={14} />{t("Edit")}</button>}</div>
                  </div>
                  <div className="project-metrics">
                    <div><span>{t("Client")}</span><strong>{selectedProject.client}</strong></div>
                    <div><span>{t("Reference")}</span><strong>{selectedProject.reference}</strong></div>
                    <div><span>{t("Supplier")}</span><strong>{selectedProject.supplier}</strong></div>
                    <div><span>{t("Project value")}</span><strong>{formatMoney(selectedProject.value, selectedProject.currency)}</strong></div>
                    <div><span>{t("Units")}</span><strong>{selectedProject.units}</strong></div>
                    <div><span>Area</span><strong>{selectedProject.area > 0 ? `${selectedProject.area} m²` : "—"}</strong></div>
                  </div>
                </section>
                <section className="project-detail-grid">
                  <div className="panel project-section">
                    <div className="section-head"><div><span className="section-kicker">Documentation</span><h3>Project files</h3></div><button className="link-button" onClick={() => setActiveView("files")}>Open files <ArrowRight size={14} /></button></div>
                    <div className="mini-file-list">
                      {documents.filter((d) => d.projectId === selectedProject.id).slice(0, 4).map((document) => (
                        <div key={document.id} className="mini-file-row"><span><FileText size={15} /></span><div><strong>{document.name}</strong><small>{t(document.category)} · {document.source}</small></div><span className="document-status">{t(document.status)}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="panel project-section">
                    <div className="section-head"><div><span className="section-kicker">{t("Commercial")}</span><h3>{t("Quotation")}</h3></div></div>
                    {(() => {
                      const quote = quotations.find((q) => q.projectId === selectedProject.id);
                      return quote ? <><div className="large-money">{formatMoney(quote.amount, quote.currency)}</div><div className="simple-details"><div><span>No.</span><strong>{quote.number}</strong></div><div><span>{t("Status")}</span><strong>{quote.status}</strong></div><div><span>System</span><strong>{quote.profileSystem}</strong></div><div><span>{t("Lead time")}</span><strong>{quote.leadTime}</strong></div></div></> : <div className="empty-small">No quotation yet.</div>;
                    })()}
                  </div>
                </section>
                <section className="panel project-section">
                  <div className="section-head"><div><span className="section-kicker">Timeline</span><h3>Project activity</h3></div></div>
                  <div className="timeline-list">
                    {activities.filter((a) => a.projectId === selectedProject.id).map((activity) => (
                      <div key={activity.id} className="timeline-row"><span className="timeline-dot" /><div><strong>{activity.title}</strong><p>{activity.description}</p><small>{activity.createdBy} · {activity.createdAt}</small></div></div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </section>
        )}

        {activeView === "files" && <FilesView projects={visibleProjects} documents={documents} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} selectedDocumentId={selectedDocumentId} setSelectedDocumentId={setSelectedDocumentId} onUpload={handleFileUpload} />}
        {activeView === "quotations" && <QuotationsView projects={visibleProjects} quotations={quotations} selectedQuotationId={selectedQuotationId} setSelectedQuotationId={setSelectedQuotationId} editingQuotation={editingQuotation} setEditingQuotation={setEditingQuotation} onSave={saveQuotation} />}
        {activeView === "messages" && <MessagesView user={user} projects={visibleProjects} messages={messages} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} messageText={messageText} setMessageText={setMessageText} onSend={sendMessage} />}
        {activeView === "shipping" && <ShippingView projects={visibleProjects} shipments={shipments} history={shipmentHistory} selectedShipmentId={selectedShipmentId} setSelectedShipmentId={setSelectedShipmentId} editingShipment={editingShipment} setEditingShipment={setEditingShipment} onSave={saveShipment} />}
      </main>

      {showProjectModal && editingProject && <ProjectModal project={editingProject} setProject={setEditingProject} onClose={() => { setShowProjectModal(false); setEditingProject(null); }} onSave={saveProject} />}
      {toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}

function FilesView({
  projects,
  documents,
  selectedProjectId,
  setSelectedProjectId,
  selectedDocumentId,
  setSelectedDocumentId,
  onUpload,
}: {
  projects: Project[];
  documents: DocumentItem[];
  selectedProjectId: number;
  setSelectedProjectId: (value: number) => void;
  selectedDocumentId: number;
  setSelectedDocumentId: (value: number) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const { t } = useI18n();
  const project = projects.find((item) => item.id === selectedProjectId) ?? projects[0];
  const projectDocuments = documents.filter((document) => document.projectId === project?.id);
  const selected = documents.find((document) => document.id === selectedDocumentId && document.projectId === project?.id) ?? projectDocuments[0];
  if (!project) return null;

  return (
    <section className="files-layout">
      <div className="panel file-projects-panel">
        <div className="section-head"><div><span className="section-kicker">{t("Projects")}</span><h3>{t("Document source")}</h3></div></div>
        <div className="project-list">
          {projects.map((item) => {
            const count = documents.filter((document) => document.projectId === item.id).length;
            return <button key={item.id} className={`project-list-row ${item.id === project.id ? "selected" : ""}`} onClick={() => { setSelectedProjectId(item.id); const first = documents.find((d) => d.projectId === item.id); if (first) setSelectedDocumentId(first.id); }}><div><strong>{item.name}</strong><span>{count} files</span></div></button>;
          })}
        </div>
      </div>

      <div className="panel document-list-panel">
        <div className="section-head"><div><span className="section-kicker">{project.name}</span><h3>Shared documents</h3></div><label className="primary-button upload-label"><Upload size={15} />Upload<input type="file" hidden onChange={onUpload} /></label></div>
        <div className="document-list">
          {projectDocuments.map((document) => (
            <button key={document.id} className={`document-row ${selected?.id === document.id ? "selected" : ""}`} onClick={() => setSelectedDocumentId(document.id)}>
              <span className="file-extension">{document.fileType}</span>
              <div><strong>{document.name}</strong><span>{document.folder}</span><small>{document.uploadedBy} · {document.uploadedAt}</small></div>
              <span className="document-status">{t(document.status)}</span>
            </button>
          ))}
          {!projectDocuments.length && <div className="empty-small">No files uploaded.</div>}
        </div>
      </div>

      <aside className="panel document-detail-panel">
        {selected ? <>
          <span className="section-kicker">File details</span><h3>{selected.name}</h3>
          <div className="detail-stack">
            <div><span>Project</span><strong>{project.name}</strong></div>
            <div><span>{t("Category")}</span><strong>{selected.category}</strong></div>
            <div><span>{t("Folder")}</span><strong>{selected.folder}</strong></div>
            <div><span>{t("Source")}</span><strong>{selected.source}</strong></div>
            <div><span>{t("Status")}</span><strong>{t(selected.status)}</strong></div>
          </div>
          {selected.previewUrl ? <a
              className="secondary-button full-width file-preview-link"
              href={`${import.meta.env.BASE_URL}${selected.previewUrl.replace(/^\//, "")}`}
              target="_blank"
              rel="noreferrer"
          >
            <Eye size={14} />
            Open real sample file
          </a>: <button className="secondary-button full-width" disabled><Eye size={14} />Preview unavailable</button>}
        </> : <div className="empty-small">Select a file.</div>}
      </aside>
    </section>
  );
}

function QuotationsView({
  projects,
  quotations,
  selectedQuotationId,
  setSelectedQuotationId,
  editingQuotation,
  setEditingQuotation,
  onSave,
}: {
  projects: Project[];
  quotations: Quotation[];
  selectedQuotationId: number;
  setSelectedQuotationId: (value: number) => void;
  editingQuotation: Quotation | null;
  setEditingQuotation: (value: Quotation | null) => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  const visibleQuotations = quotations.filter((quotation) => projects.some((project) => project.id === quotation.projectId));
  const selected = quotations.find((quotation) => quotation.id === selectedQuotationId) ?? visibleQuotations[0] ?? null;
  return (
    <section className="two-column-layout">
      <div className="panel list-panel">
        <div className="section-head"><div><span className="section-kicker">{t("Commercial")}</span><h3>{t("Quotations")}</h3></div></div>
        <div className="quotation-list">
          {visibleQuotations.map((quotation) => {
            const project = projects.find((p) => p.id === quotation.projectId);
            return <button key={quotation.id} className={`quotation-row ${quotation.id === selected?.id ? "selected" : ""}`} onClick={() => { setSelectedQuotationId(quotation.id); setEditingQuotation(null); }}><div><strong>{project?.name}</strong><span>{quotation.number}</span></div><div><b>{formatMoney(quotation.amount, quotation.currency)}</b><span>{t(quotation.status)}</span></div></button>;
          })}
        </div>
      </div>
      {selected && <div className="panel detail-panel">
        <div className="section-head"><div><span className="section-kicker">{t("Quotation")}</span><h3>{selected.number}</h3></div>{!editingQuotation && <button className="secondary-button" onClick={() => setEditingQuotation({ ...selected })}><Pencil size={14} />{t("Edit")}</button>}</div>
        {!editingQuotation ? <>
          <div className="detail-money">{formatMoney(selected.amount, selected.currency)}</div>
          <div className="detail-stack">
            <div><span>{t("Status")}</span><strong>{t(selected.status)}</strong></div><div><span>Date</span><strong>{selected.date}</strong></div><div><span>Profile</span><strong>{selected.profileSystem}</strong></div><div><span>Hardware</span><strong>{selected.hardware}</strong></div><div><span>Security</span><strong>{selected.securityLevel}</strong></div><div><span>{t("Lead time")}</span><strong>{selected.leadTime}</strong></div><div><span>{t("Delivery")}</span><strong>{selected.deliveryTerms}</strong></div><div><span>Validity</span><strong>{selected.validity}</strong></div>
          </div>
        </> : <div className="edit-form">
          <label><span>{t("Amount")}</span><input type="number" value={editingQuotation.amount} onChange={(e) => setEditingQuotation({ ...editingQuotation, amount: Number(e.target.value) || 0 })} /></label>
          <label><span>{t("Status")}</span><select value={editingQuotation.status} onChange={(e) => setEditingQuotation({ ...editingQuotation, status: e.target.value as Quotation["status"] })}><option>Draft</option><option>Sent</option><option>Under review</option><option>Approved</option></select></label>
          <label><span>{t("Lead time")}</span><input value={editingQuotation.leadTime} onChange={(e) => setEditingQuotation({ ...editingQuotation, leadTime: e.target.value })} /></label>
          <label><span>{t("Delivery terms")}</span><input value={editingQuotation.deliveryTerms} onChange={(e) => setEditingQuotation({ ...editingQuotation, deliveryTerms: e.target.value })} /></label>
          <label><span>Validity</span><input value={editingQuotation.validity} onChange={(e) => setEditingQuotation({ ...editingQuotation, validity: e.target.value })} /></label>
          <label><span>{t("Profile system")}</span><input value={editingQuotation.profileSystem} onChange={(e) => setEditingQuotation({ ...editingQuotation, profileSystem: e.target.value })} /></label>
          <div className="edit-actions"><button className="ghost-button" onClick={() => setEditingQuotation(null)}>{t("Cancel")}</button><button className="primary-button" onClick={onSave}><Save size={14} />Save</button></div>
        </div>}
      </div>}
    </section>
  );
}

function MessagesView({
  user,
  projects,
  messages,
  selectedProjectId,
  setSelectedProjectId,
  messageText,
  setMessageText,
  onSend,
}: {
  user: DemoUser;
  projects: Project[];
  messages: Message[];
  selectedProjectId: number;
  setSelectedProjectId: (value: number) => void;
  messageText: string;
  setMessageText: (value: string) => void;
  onSend: () => void;
}) {
  const { t } = useI18n();
  const project = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  if (!project) return null;
  const projectMessages = messages.filter((message) => message.projectId === project.id);
  return (
    <section className="messages-layout">
      <div className="panel message-project-list">
        <div className="section-head"><div><span className="section-kicker">Conversations</span><h3>Project threads</h3></div></div>
        <div className="project-list">
          {projects.map((item) => {
            const count = messages.filter((message) => message.projectId === item.id).length;
            return <button key={item.id} className={`project-list-row ${item.id === project.id ? "selected" : ""}`} onClick={() => setSelectedProjectId(item.id)}><div><strong>{item.name}</strong><span>{count} messages</span></div><ChevronRight size={15} /></button>;
          })}
        </div>
      </div>
      <div className="panel chat-panel">
        <div className="chat-header"><div><span className="section-kicker">Project</span><h3>{project.name}</h3></div><span className="online-badge">{t("Shared channel")}</span></div>
        <div className="chat-messages">
          {projectMessages.map((message) => <div key={message.id} className={`chat-message ${message.authorRole === user.role ? "own" : ""}`}><div className="chat-meta"><strong>{message.author}</strong><span>{message.createdAt}</span></div><p>{message.text}</p></div>)}
        </div>
        <div className="chat-composer"><input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={t(user.role === "admin" ? "Message Hansen..." : "Message Internal Team...")} onKeyDown={(e) => { if (e.key === "Enter") onSend(); }} /><button className="primary-button" onClick={onSend}><Send size={15} />{t("Send")}</button></div>
      </div>
    </section>
  );
}

function ShippingView({
  projects,
  shipments,
  history,
  selectedShipmentId,
  setSelectedShipmentId,
  editingShipment,
  setEditingShipment,
  onSave,
}: {
  projects: Project[];
  shipments: Shipment[];
  history: ShipmentHistory[];
  selectedShipmentId: number;
  setSelectedShipmentId: (value: number) => void;
  editingShipment: Shipment | null;
  setEditingShipment: (value: Shipment | null) => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  const visibleShipments = shipments.filter((shipment) => projects.some((project) => project.id === shipment.projectId));
  const selected = visibleShipments.find((shipment) => shipment.id === selectedShipmentId) ?? visibleShipments[0] ?? null;
  if (!selected) return <div className="panel empty-page">{t("No shipping data.")}</div>;
  const project = projects.find((project) => project.id === selected.projectId);
  const selectedHistory = history.filter((item) => item.shipmentId === selected.id).slice().reverse();
  return (
    <section className="shipping-layout">
      <div className="panel shipping-list-panel">
        <div className="section-head"><div><span className="section-kicker">{t("Logistics")}</span><h3>{t("Shipments")}</h3></div></div>
        <div className="shipping-list">
          {visibleShipments.map((shipment) => {
            const shipmentProject = projects.find((project) => project.id === shipment.projectId);
            return <button key={shipment.id} className={`shipment-row ${selected.id === shipment.id ? "selected" : ""}`} onClick={() => { setSelectedShipmentId(shipment.id); setEditingShipment(null); }}><div><strong>{shipmentProject?.name}</strong><span>{t(shipment.status)}</span></div><div><strong>{shipment.eta || "TBC"}</strong><span>ETA</span></div></button>;
          })}
        </div>
      </div>
      <div className="panel shipment-detail">
        <div className="section-head"><div><span className="section-kicker">{t("Shipment")}</span><h3>{project?.name}</h3></div>{!editingShipment && <button className="secondary-button" onClick={() => setEditingShipment({ ...selected })}><Pencil size={14} />{t("Edit")}</button>}</div>
        {!editingShipment ? <>
          <div className="shipment-progress"><div><span>{t("Progress")}</span><strong>{selected.progress}%</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${selected.progress}%` }} /></div></div>
          <div className="shipment-fields">
            <div><span>{t("Status")}</span><strong>{t(selected.status)}</strong></div><div><span>{t("Planned dispatch")}</span><strong>{selected.plannedDispatch || t("Not set")}</strong></div><div><span>ETA</span><strong>{selected.eta || t("Not set")}</strong></div><div><span>{t("Carrier")}</span><strong>{selected.carrier || t("Not set")}</strong></div><div><span>{t("Tracking")}</span><strong>{selected.trackingNumber || t("Not available")}</strong></div><div><span>{t("Delivery")}</span><strong>{selected.deliveryAddress}</strong></div>
          </div>
          <div className="notes-box"><span>{t("Notes")}</span><p>{selected.notes || t("No notes.")}</p></div>
          <div className="last-updated">Last updated by <strong>{selected.updatedBy}</strong> · {selected.updatedAt}</div>
        </> : <div className="edit-form shipping-edit-grid">
          <label><span>{t("Status")}</span><select value={editingShipment.status} onChange={(e) => setEditingShipment({ ...editingShipment, status: e.target.value as ShipmentStatus })}>{shipmentStatuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select></label>
          <label><span>{t("Planned dispatch")}</span><input type="date" value={editingShipment.plannedDispatch} onChange={(e) => setEditingShipment({ ...editingShipment, plannedDispatch: e.target.value })} /></label>
          <label><span>ETA</span><input type="date" value={editingShipment.eta} onChange={(e) => setEditingShipment({ ...editingShipment, eta: e.target.value })} /></label>
          <label><span>{t("Carrier")}</span><input value={editingShipment.carrier} onChange={(e) => setEditingShipment({ ...editingShipment, carrier: e.target.value })} /></label>
          <label><span>{t("Tracking number")}</span><input value={editingShipment.trackingNumber} onChange={(e) => setEditingShipment({ ...editingShipment, trackingNumber: e.target.value })} /></label>
          <label><span>{t("Delivery address")}</span><input value={editingShipment.deliveryAddress} onChange={(e) => setEditingShipment({ ...editingShipment, deliveryAddress: e.target.value })} /></label>
          <label className="form-wide"><span>{t("Notes")}</span><textarea rows={4} value={editingShipment.notes} onChange={(e) => setEditingShipment({ ...editingShipment, notes: e.target.value })} /></label>
          <div className="edit-actions form-wide"><button className="ghost-button" onClick={() => setEditingShipment(null)}>{t("Cancel")}</button><button className="primary-button" onClick={onSave}><Save size={14} />{t("Save changes")}</button></div>
        </div>}
      </div>
      <aside className="panel history-panel">
        <div className="section-head"><div><span className="section-kicker">{t("Audit trail")}</span><h3>{t("Change history")}</h3></div><History size={17} /></div>
        <div className="history-list">{selectedHistory.map((item) => <div key={item.id} className="history-row"><span className="history-dot" /><div><strong>{item.field}</strong><p>{item.oldValue} → {item.newValue}</p><small>{item.changedBy} · {item.changedAt}</small></div></div>)}{!selectedHistory.length && <div className="empty-small">{t("No changes recorded.")}</div>}</div>
      </aside>
    </section>
  );
}

function ProjectModal({
  project,
  setProject,
  onClose,
  onSave,
}: {
  project: Project;
  setProject: (project: Project) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head"><div><span className="section-kicker">{project.id === 0 ? "Create" : "Edit"}</span><h2>{project.id === 0 ? "New project" : "Project details"}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
        <div className="project-form">
          <label><span>{t("Project name *")}</span><input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} /></label>
          <label><span>{t("Client")}</span><input value={project.client} onChange={(e) => setProject({ ...project, client: e.target.value })} /></label>
          <label><span>{t("Reference")}</span><input value={project.reference} onChange={(e) => setProject({ ...project, reference: e.target.value })} /></label>
          <label><span>{t("City")}</span><input value={project.city} onChange={(e) => setProject({ ...project, city: e.target.value })} /></label>
          <label><span>{t("Country")}</span><input value={project.country} onChange={(e) => setProject({ ...project, country: e.target.value })} /></label>
          <label><span>{t("Supplier")}</span><input value={project.supplier} onChange={(e) => setProject({ ...project, supplier: e.target.value })} /></label>
          <label><span>{t("Status")}</span><select value={t(project.status)} onChange={(e) => setProject({ ...project, status: e.target.value as ProjectStatus })}>{projectStatuses.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select></label>
          <label><span>{t("Project value")}</span><input type="number" value={project.value} onChange={(e) => setProject({ ...project, value: Number(e.target.value) || 0 })} /></label>
          <label><span>{t("Currency")}</span><select value={project.currency} onChange={(e) => setProject({ ...project, currency: e.target.value as Currency })}><option>EUR</option><option>USD</option><option>PLN</option></select></label>
          <label><span>{t("Units")}</span><input type="number" value={project.units} onChange={(e) => setProject({ ...project, units: Number(e.target.value) || 0 })} /></label>
          <label><span>{t("Area m²")}</span><input type="number" step="0.01" value={project.area} onChange={(e) => setProject({ ...project, area: Number(e.target.value) || 0 })} /></label>
          <label><span>{t("Profile system")}</span><input value={project.system} onChange={(e) => setProject({ ...project, system: e.target.value })} /></label>
          <label className="form-wide"><span>{t("Description")}</span><textarea rows={4} value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} /></label>
        </div>
        <div className="modal-actions"><button className="ghost-button" onClick={onClose}>{t("Cancel")}</button><button className="primary-button" onClick={onSave}><Save size={15} />{t("Save project")}</button></div>
      </div>
    </div>
  );
}

function HansenApp() { return <I18nProvider><App /></I18nProvider>; }

export default HansenApp;
