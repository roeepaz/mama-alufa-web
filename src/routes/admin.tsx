import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Utensils,
  Clock,
  Image as ImageIcon,
  Type,
  Settings,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  RotateCcw,
  Download,
  FileUp,
  ExternalLink,
  Eye,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Home,
} from "lucide-react";

import { useSiteData } from "@/contexts/SiteDataContext";
import {
  type Dish,
  type OpeningHoursEntry,
  type GalleryItem,
  type SiteTexts,
  type SiteSettings,
  BUILTIN_ASSETS,
  resolveImage,
  generateId,
} from "@/data/siteData";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ניהול אתר - אמא אלופה" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

/* ─────────────────────────────────  Auth Helper  ───────────────────────────────── */

const ADMIN_PASS_KEY = "ama_alufa_admin_password";
const DEFAULT_PASSWORD = "mama2024";

function getStoredPassword(): string {
  if (typeof window === "undefined") return DEFAULT_PASSWORD;
  return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASSWORD;
}

function setStoredPassword(newPass: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_PASS_KEY, newPass);
}

/* ─────────────────────────────────  Preset Images  ─────────────────────────────── */

const PRESET_IMAGES = [
  { key: "dish-stew", label: "קדרת בשר" },
  { key: "dish-stuffed", label: "ממולאים" },
  { key: "dish-soup", label: "מרק עוף" },
  { key: "dish-sides", label: "סלטים ותוספות" },
  { key: "dish-cake", label: "עוגה" },
  { key: "hero-table", label: "מגש משפחתי" },
  { key: "gallery-couscous", label: "קוסקוס" },
  { key: "gallery-spring-rolls", label: "אגרולים" },
];

/* ─────────────────────────────────  Main Admin Component  ───────────────────────── */

type AdminTab = "dishes" | "hours" | "gallery" | "texts" | "settings" | "backup";

function AdminPage() {
  const {
    data,
    updateDishes,
    updateOpeningHours,
    updateGallery,
    updateTexts,
    updateSettings,
    resetToDefaults,
  } = useSiteData();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("ama_admin_auth") === "true";
  });

  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("dishes");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = getStoredPassword();
    if (passwordInput === currentPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ama_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("סיסמה שגויה, נסה שוב.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("ama_admin_auth");
    setPasswordInput("");
  };

  /* ─── If not authenticated: show Login Screen ─── */
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12" dir="rtl">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">כניסה לפאנל ניהול</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ניהול תפריט, שעות פתיחה, תמונות ותוכן של "אמא אלופה"
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                סיסמת מנהל
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError("");
                }}
                placeholder="הזן סיסמה (ברירת מחדל: mama2024)"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {authError && (
                <p className="mt-2 flex items-center gap-1 text-sm text-destructive font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow transition hover:brightness-110 active:scale-[0.99]"
            >
              כניסה למערכת
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              <Home className="h-4 w-4" />
              חזרה לעמוד הראשי של האתר
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Authenticated Admin Dashboard ─── */
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              א
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">פאנל ניהול אדמין</h1>
                <span className="rounded-full bg-olive/15 px-2.5 py-0.5 text-xs font-semibold text-olive">
                  אמא אלופה
                </span>
              </div>
              <p className="text-xs text-muted-foreground">שינויים נשמרים מיידית בזמן אמת</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <Eye className="h-4 w-4 text-primary" />
              <span>תצוגה מקדימה באתר</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs sm:text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              title="התנתק"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">התנתק</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
          <nav className="flex space-x-2 space-x-reverse border-t border-border pt-2 pb-2">
            {[
              { id: "dishes", label: "מנות ותפריט", icon: Utensils, count: data.dishes.length },
              { id: "hours", label: "שעות פתיחה", icon: Clock, count: data.openingHours.length },
              { id: "gallery", label: "גלריית תמונות", icon: ImageIcon, count: data.gallery.length },
              { id: "texts", label: "טקסטים ותוכן", icon: Type },
              { id: "settings", label: "הגדרות וקישורים", icon: Settings },
              { id: "backup", label: "גיבוי ואיפוס", icon: Save },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted-foreground/15 text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === "dishes" && (
          <DishesTab
            dishes={data.dishes}
            onChange={(newDishes) => {
              updateDishes(newDishes);
              showToast("התפריט עודכן בהצלחה!");
            }}
          />
        )}

        {activeTab === "hours" && (
          <HoursTab
            hours={data.openingHours}
            onChange={(newHours) => {
              updateOpeningHours(newHours);
              showToast("שעות הפתיחה עודכנו!");
            }}
          />
        )}

        {activeTab === "gallery" && (
          <GalleryTab
            gallery={data.gallery}
            onChange={(newGallery) => {
              updateGallery(newGallery);
              showToast("הגלריה עודכנה!");
            }}
          />
        )}

        {activeTab === "texts" && (
          <TextsTab
            texts={data.texts}
            onChange={(partial) => {
              updateTexts(partial);
              showToast("הטקסטים נשמרו בהצלחה!");
            }}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            settings={data.settings}
            onChange={(partial) => {
              updateSettings(partial);
              showToast("ההגדרות נשמרו!");
            }}
            showToast={showToast}
          />
        )}

        {activeTab === "backup" && (
          <BackupTab
            data={data}
            onRestore={() => {
              resetToDefaults();
              showToast("האתר אופס לברירת המחדל בהצלחה!");
            }}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════  1. Dishes Tab  ═══════════════════════════════════ */

function DishesTab({
  dishes,
  onChange,
}: {
  dishes: Dish[];
  onChange: (dishes: Dish[]) => void;
}) {
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddDish = (newDish: Dish) => {
    onChange([...dishes, newDish]);
    setIsAddingNew(false);
  };

  const handleSaveEdit = (updated: Dish) => {
    onChange(dishes.map((d) => (d.id === updated.id ? updated : d)));
    setEditingDish(null);
  };

  const handleDeleteDish = (id: string) => {
    if (confirm("האם למחוק מנה זו מהתפריט?")) {
      onChange(dishes.filter((d) => d.id !== id));
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= dishes.length) return;
    const next = [...dishes];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ניהול מנות התפריט</h2>
          <p className="text-sm text-muted-foreground">
            הוסף, ערוך, מחק ושנה את סדר המנות המוצגות באתר
          </p>
        </div>
        <button
          onClick={() => {
            setIsAddingNew(true);
            setEditingDish({
              id: generateId(),
              name: "",
              note: "",
              img: "dish-stew",
            });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          הוסף מנה חדשה
        </button>
      </div>

      {/* Dish Form Modal/Card */}
      {editingDish && (
        <div className="rounded-3xl border-2 border-primary/30 bg-card p-6 shadow-lg animate-in fade-in zoom-in-95">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {isAddingNew ? "✨ הוספת מנה חדשה" : "✏️ עריכת מנה"}
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  שם המנה *
                </label>
                <input
                  type="text"
                  value={editingDish.name}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  placeholder="לדוגמה: מרק קובה עשיר"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  תיאור קצר / פירוט המנה *
                </label>
                <input
                  type="text"
                  value={editingDish.note}
                  onChange={(e) => setEditingDish({ ...editingDish, note: e.target.value })}
                  placeholder="לדוגמה: מוגש עם אורז ושקדים קלויים"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  בחירת תמונה
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  בחר תמונה מוכנה, הזן קישור (URL) או העלה תמונה מהמחשב:
                </p>

                {/* Preset Picker */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_IMAGES.slice(0, 6).map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setEditingDish({ ...editingDish, img: preset.key })}
                      className={`relative overflow-hidden rounded-xl border-2 transition ${
                        editingDish.img === preset.key
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <img
                        src={resolveImage(preset.key)}
                        alt={preset.label}
                        className="h-14 w-full object-cover"
                      />
                      <span className="block bg-card/90 py-0.5 text-center text-[10px] font-medium text-foreground truncate px-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom URL or File Upload */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingDish.img.startsWith("data:") ? "תמונה מקומית הועלתה" : editingDish.img}
                    onChange={(e) => setEditingDish({ ...editingDish, img: e.target.value })}
                    placeholder="הזן URL של תמונה חיצונית..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    העלה קובץ
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) {
                            setEditingDish({ ...editingDish, img: reader.result as string });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-4">
              <span className="text-xs font-semibold text-muted-foreground mb-2">תצוגה מקדימה של הכרטיס</span>
              <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <img
                  src={resolveImage(editingDish.img)}
                  alt="תצוגה"
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = resolveImage("dish-stew");
                  }}
                />
                <div className="p-4">
                  <h4 className="font-bold text-foreground text-lg">
                    {editingDish.name || "שם המנה יוצג כאן"}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {editingDish.note || "תיאור המנה יוצג כאן"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
            <button
              onClick={() => {
                setEditingDish(null);
                setIsAddingNew(false);
              }}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              ביטול
            </button>
            <button
              onClick={() => {
                if (!editingDish.name.trim()) {
                  alert("נא להזין שם למנה");
                  return;
                }
                if (isAddingNew) {
                  handleAddDish(editingDish);
                } else {
                  handleSaveEdit(editingDish);
                }
              }}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow hover:brightness-110"
            >
              {isAddingNew ? "הוסף לתפריט" : "שמור שינויים"}
            </button>
          </div>
        </div>
      )}

      {/* Dishes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish, idx) => (
          <div
            key={dish.id || idx}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
          >
            <div>
              <div className="relative mb-3 overflow-hidden rounded-2xl">
                <img
                  src={resolveImage(dish.img)}
                  alt={dish.name}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = resolveImage("dish-stew");
                  }}
                />
                <span className="absolute top-2 right-2 rounded-full bg-foreground/75 px-2.5 py-0.5 text-xs font-bold text-background backdrop-blur">
                  #{idx + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-card-foreground">{dish.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{dish.note}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              {/* Reorder Buttons */}
              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  title="הזז למעלה"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  disabled={idx === dishes.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  title="הזז למטה"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              {/* Edit / Delete */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingDish({ ...dish });
                  }}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  עריכה
                </button>
                <button
                  onClick={() => handleDeleteDish(dish.id)}
                  className="rounded-xl p-1.5 text-destructive hover:bg-destructive/10"
                  title="מחק מנה"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════  2. Hours Tab  ═══════════════════════════════════ */

function HoursTab({
  hours,
  onChange,
}: {
  hours: OpeningHoursEntry[];
  onChange: (hours: OpeningHoursEntry[]) => void;
}) {
  const [list, setList] = useState<OpeningHoursEntry[]>(hours);

  const handleUpdate = (id: string, field: "label" | "hours", value: string) => {
    const updated = list.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    setList(updated);
    onChange(updated);
  };

  const handleAddRow = () => {
    const updated = [...list, { id: generateId(), label: "ימים מיוחדים / חג", hours: "10:00–16:00" }];
    setList(updated);
    onChange(updated);
  };

  const handleDeleteRow = (id: string) => {
    const updated = list.filter((item) => item.id !== id);
    setList(updated);
    onChange(updated);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">שעות פתיחה ופעילות</h2>
          <p className="text-sm text-muted-foreground">
            קבע את שעות הפעילות המוצגות בכרטיס המיקום ובתחתית האתר
          </p>
        </div>
        <button
          onClick={handleAddRow}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          הוסף שורה
        </button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        {list.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">ימים</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleUpdate(item.id, "label", e.target.value)}
                placeholder="למשל: ראשון–חמישי"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">שעות</label>
              <input
                type="text"
                value={item.hours}
                onChange={(e) => handleUpdate(item.id, "hours", e.target.value)}
                placeholder="למשל: 8:30–19:00 או סגור"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-end pt-5">
              <button
                onClick={() => handleDeleteRow(item.id)}
                disabled={list.length <= 1}
                className="rounded-xl p-2.5 text-destructive hover:bg-destructive/10 disabled:opacity-30"
                title="מחק שורה"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════  3. Gallery Tab  ═════════════════════════════════ */

function GalleryTab({
  gallery,
  onChange,
}: {
  gallery: GalleryItem[];
  onChange: (gallery: GalleryItem[]) => void;
}) {
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const newItem: GalleryItem = {
      id: generateId(),
      img: "gallery-couscous",
      alt: "תמונה מהמטבח",
      caption: "מנות חמות וטריות מהמטבח של אמא",
    };
    onChange([...gallery, newItem]);
  };

  const handleUpdate = (id: string, partial: Partial<GalleryItem>) => {
    onChange(gallery.map((g) => (g.id === id ? { ...g, ...partial } : g)));
  };

  const handleDelete = (id: string) => {
    if (confirm("למחוק תמונה זו מהגלריה?")) {
      onChange(gallery.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">גלריית תמונות מהמטבח</h2>
          <p className="text-sm text-muted-foreground">
            נהל את התמונות והכיתובים המוצגים בסקציית הגלריה
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          הוסף תמונה לגלריה
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {gallery.map((item, idx) => (
          <div
            key={item.id || idx}
            className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={resolveImage(item.img)}
                alt={item.alt}
                className="h-52 w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = resolveImage("gallery-couscous");
                }}
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  כיתוב מתחת לתמונה (Caption)
                </label>
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => handleUpdate(item.id, { caption: e.target.value })}
                  placeholder="כיתוב תיאורי קצר"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  טקסט נגישות (Alt Text)
                </label>
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => handleUpdate(item.id, { alt: e.target.value })}
                  placeholder="תיאור התמונה לקוראי מסך"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  מקור התמונה (URL או העלאה)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.img.startsWith("data:") ? "תמונה מקומית הועלתה" : item.img}
                    onChange={(e) => handleUpdate(item.id, { img: e.target.value })}
                    placeholder="קישור לתמונה..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    החלף קובץ
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <button
                onClick={() => handleDelete(item.id)}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                מחק תמונה מהגלריה
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && editingItem) {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                handleUpdate(editingItem.id, { img: reader.result as string });
              }
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════  4. Texts Tab  ═══════════════════════════════════ */

function TextsTab({
  texts,
  onChange,
}: {
  texts: SiteTexts;
  onChange: (texts: Partial<SiteTexts>) => void;
}) {
  const [form, setForm] = useState<SiteTexts>(texts);

  const handleChange = (field: keyof SiteTexts, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange(updated);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">עריכת טקסטים ותכנים</h2>
        <p className="text-sm text-muted-foreground">
          ערוך את כל הכותרות, התיאורים והניסוחים באתר
        </p>
      </div>

      {/* Section 1: Hero */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <span>🌟</span> ראש הדף (Hero)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              תגית כשרות עליונה
            </label>
            <input
              type="text"
              value={form.heroKashrut}
              onChange={(e) => handleChange("heroKashrut", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              כותרת ראשית (H1)
            </label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) => handleChange("heroTitle", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              תיאור קצר מתחת לכותרת
            </label>
            <textarea
              rows={2}
              value={form.heroSubtitle}
              onChange={(e) => handleChange("heroSubtitle", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              טקסט כפתור 1 (Wolt)
            </label>
            <input
              type="text"
              value={form.heroCta1}
              onChange={(e) => handleChange("heroCta1", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              טקסט כפתור 2 (לתפריט)
            </label>
            <input
              type="text"
              value={form.heroCta2}
              onChange={(e) => handleChange("heroCta2", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: About & Kashrut */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <span>📖</span> הסיפור שלנו והכשרות (About)
        </h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                כותרת עליונה (Kicker)
              </label>
              <input
                type="text"
                value={form.aboutKicker}
                onChange={(e) => handleChange("aboutKicker", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                כותרת הסקציה
              </label>
              <input
                type="text"
                value={form.aboutTitle}
                onChange={(e) => handleChange("aboutTitle", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              פסקה ראשונה
            </label>
            <textarea
              rows={2}
              value={form.aboutP1}
              onChange={(e) => handleChange("aboutP1", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              פסקה שנייה
            </label>
            <textarea
              rows={2}
              value={form.aboutP2}
              onChange={(e) => handleChange("aboutP2", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              פרטי תעודת כשרות
            </label>
            <input
              type="text"
              value={form.kashrutDetail}
              onChange={(e) => handleChange("kashrutDetail", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Call to action (Order banner) */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <span>🛵</span> באנר הזמנה ומשלוחים (CTA)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              כותרת הבאנר
            </label>
            <input
              type="text"
              value={form.ctaTitle}
              onChange={(e) => handleChange("ctaTitle", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              טקסט פירוט
            </label>
            <textarea
              rows={2}
              value={form.ctaSubtitle}
              onChange={(e) => handleChange("ctaSubtitle", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Location and Footer texts */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <span>📍</span> מיקום וכתובת
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">כתובת</label>
            <input
              type="text"
              value={form.locationAddress}
              onChange={(e) => handleChange("locationAddress", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">מתחם / אזור</label>
            <input
              type="text"
              value={form.locationArea}
              onChange={(e) => handleChange("locationArea", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">הערת משלוחים</label>
            <input
              type="text"
              value={form.deliveryNote}
              onChange={(e) => handleChange("deliveryNote", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════  5. Settings Tab  ═════════════════════════════════ */

function SettingsTab({
  settings,
  onChange,
  showToast,
}: {
  settings: SiteSettings;
  onChange: (settings: Partial<SiteSettings>) => void;
  showToast: (msg: string) => void;
}) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveSettings = () => {
    onChange(form);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      alert("נא להזין סיסמה חדשה");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("הסיסמאות אינן תואמות");
      return;
    }
    setStoredPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    showToast("סיסמת האדמין שונתה בהצלחה!");
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">הגדרות כלליות ואבטחה</h2>
        <p className="text-sm text-muted-foreground">קישורים חיצוניים, מפה ושינוי סיסמה</p>
      </div>

      {/* External Links */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>🔗</span> קישורים חיצוניים ומפה
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              קישור להזמנות ב-Wolt
            </label>
            <input
              type="url"
              value={form.woltUrl}
              onChange={(e) => {
                const val = e.target.value;
                setForm({ ...form, woltUrl: val });
                onChange({ woltUrl: val });
              }}
              placeholder="https://wolt.com/he/isr/..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              שאילתת מיקום ל-Google Maps
            </label>
            <input
              type="text"
              value={decodeURIComponent(form.mapQuery)}
              onChange={(e) => {
                const encoded = encodeURIComponent(e.target.value);
                setForm({ ...form, mapQuery: encoded });
                onChange({ mapQuery: encoded });
              }}
              placeholder="השריג 2 בנימינה"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              משמש להצגת המפה האינטראקטיבית באתר
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          שינוי סיסמת אדמין
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                סיסמה חדשה
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="הזן סיסמה חדשה..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                אימות סיסמה חדשה
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן שוב לאימות..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80"
          >
            עדכן סיסמה
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════  6. Backup Tab  ═══════════════════════════════════ */

function BackupTab({
  data,
  onRestore,
  showToast,
}: {
  data: any;
  onRestore: () => void;
  showToast: (msg: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ama-alufa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("קובץ הגיבוי הורד בהצלחה!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        localStorage.setItem("ama-alufa-site-data", JSON.stringify(parsed));
        window.location.reload();
      } catch (err) {
        alert("קובץ גיבוי לא תקין");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">גיבוי, שחזור ואיפוס</h2>
        <p className="text-sm text-muted-foreground">
          שמור עותק של כל תוכן האתר או שחזר נתונים מקובץ
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Export Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">ייצוא גיבוי (Download JSON)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              מוריד קובץ גיבוי של כל המנות, השעות, התמונות והטקסטים למחשב שלך.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow hover:brightness-110"
          >
            <Download className="h-4 w-4" />
            הורד קובץ גיבוי
          </button>
        </div>

        {/* Import Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <FileUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">ייבוא מגיבוי (Restore JSON)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              טען קובץ גיבוי שנשמר בעבר כדי לשחזר את כל תוכן האתר.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <FileUp className="h-4 w-4" />
            בחר קובץ לשחזור
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      {/* Factory Reset */}
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-destructive font-bold">
          <RotateCcw className="h-5 w-5" />
          <span>איפוס לברירת מחדל המקורית</span>
        </div>
        <p className="text-sm text-muted-foreground">
          פעולה זו תמחק את כל השינויים שבוצעו ותחזיר את האתר לתוכן המקורי שלו.
        </p>
        <button
          onClick={() => {
            if (confirm("האם אתה בטוח שברצונך לאפס את כל תוכן האתר לברירת המחדל?")) {
              onRestore();
            }
          }}
          className="rounded-xl border border-destructive/40 bg-background px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
        >
          איפוס מלא לברירת מחדל
        </button>
      </div>
    </div>
  );
}
