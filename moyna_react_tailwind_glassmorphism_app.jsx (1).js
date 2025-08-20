import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, ExternalLink, Trash2, Plus, NotebookPen, Link2 } from "lucide-react";

// ------------------------------------------------------------
// Moyna — Modern Glassmorphism App (React + Tailwind + Framer Motion)
// Fully self-contained single-file component for GPT-5 Canvas
// Features: Header w/ glow logo, Dark/Light toggle, Video Link Saver,
// Personal Notes, LocalStorage persistence, Responsive UI, Smooth UX
// ------------------------------------------------------------

// Utility: simple URL validator
const isValidUrl = (str) => {
  try {
    const u = new URL(str);
    return !!u.protocol && !!u.hostname;
  } catch (e) {
    return false;
  }
};

// Small helper: format timestamp for display
const formatTime = (ts) => new Date(ts).toLocaleString();

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("moyna.theme");
    if (saved) return saved === "dark";
    // fallback to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem("moyna.theme", dark ? "dark" : "light");
  }, [dark]);

  // ---------- Video Links state ----------
  const [videoInput, setVideoInput] = useState("");
  const [videoLinks, setVideoLinks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("moyna.videoLinks") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("moyna.videoLinks", JSON.stringify(videoLinks));
  }, [videoLinks]);

  // ---------- Notes state ----------
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("moyna.notes") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("moyna.notes", JSON.stringify(notes));
  }, [notes]);

  // derived theme classes
  const appClass = useMemo(() => (
    `${dark ? "dark" : ""}`
  ), [dark]);

  return (
    <div className={appClass}>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-900 transition-colors duration-500">
        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/30 dark:bg-black/20 supports-[backdrop-filter]:bg-white/30 border-b border-white/40 dark:border-white/10">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <div className="w-12" />

            {/* Centered Brand */}
            <motion.h1
              whileHover={{ scale: 1.03, rotate: -0.5 }}
              whileTap={{ scale: 0.98 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight select-none bg-gradient-to-r from-sky-500 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(99,102,241,0.35)]"
              style={{
                textShadow:
                  "0 0 20px rgba(56,189,248,0.35), 0 0 40px rgba(168,85,247,0.25)",
              }}
              aria-label="Moyna"
            >
              Moyna
            </motion.h1>

            {/* Theme Toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className="group inline-flex items-center gap-2 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-2 shadow-sm hover:shadow-md transition-shadow backdrop-blur-md"
              aria-label="Toggle Theme"
            >
              <span className="sr-only">Toggle Theme</span>
              {dark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{dark ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 pb-32 pt-10">
          {/* Intro */}
          <section className="mb-8">
            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              A modern, minimal, and interactive space to save video links and personal notes.
            </p>
          </section>

          {/* Video Link Saver */}
          <SectionShell title="Video Link Saver" subtitle="Paste any video URL and save it below. Click a saved card to open the video.">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = videoInput.trim();
                if (!trimmed) return;
                if (!isValidUrl(trimmed)) {
                  alert("Please enter a valid URL (e.g., https://example.com/video)");
                  return;
                }
                const exists = videoLinks.some((v) => v.url === trimmed);
                if (exists) {
                  alert("This link is already saved.");
                  return;
                }
                const url = new URL(trimmed);
                const item = {
                  id: crypto.randomUUID(),
                  url: trimmed,
                  host: url.hostname.replace("www.", ""),
                  addedAt: Date.now(),
                };
                setVideoLinks([item, ...videoLinks]);
                setVideoInput("");
              }}
              className="grid gap-3 sm:grid-cols-[1fr_auto]"
            >
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Link2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="Paste video URL (YouTube, Facebook, TikTok, Vimeo, etc.)"
                  className="w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-10 py-3 text-base shadow-sm outline-none ring-0 backdrop-blur-md placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 dark:focus:ring-fuchsia-500/30"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-sky-500 to-emerald-500 px-5 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-xl active:scale-[0.98] transition"
              >
                <Plus className="h-5 w-5" /> Save
              </button>
            </form>

            {/* Saved Video Cards */}
            <AnimatePresence initial={false}>
              {videoLinks.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {videoLinks.map((v) => (
                    <motion.a
                      key={v.id}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-3xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 shadow-sm backdrop-blur-md hover:shadow-lg transition block"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">{v.host}</p>
                          <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                            {v.url}
                          </h3>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Saved: {formatTime(v.addedAt)}</p>
                        </div>
                        <ExternalLink className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setVideoLinks((prev) => prev.filter((x) => x.id !== v.id));
                        }}
                        className="absolute right-3 top-3 rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10 p-1.5 shadow hover:shadow-md"
                        aria-label="Delete link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.a>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<ExternalLink className="h-8 w-8" />} text="No links yet. Save your first video above!" />
              )}
            </AnimatePresence>
          </SectionShell>

          {/* Notes */}
          <SectionShell title="Personal Notes" subtitle="Write your thoughts and save them. Your notes stay on this device.">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = noteInput.trim();
                if (!trimmed) return;
                setNotes((prev) => [
                  { id: crypto.randomUUID(), text: trimmed, createdAt: Date.now() },
                  ...prev,
                ]);
                setNoteInput("");
              }}
              className="grid gap-3"
            >
              <div className="relative">
                <div className="pointer-events-none absolute left-0 top-0 pl-3 pt-3">
                  <NotebookPen className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Write your personal note here..."
                  rows={4}
                  className="w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-10 py-3 text-base shadow-sm outline-none ring-0 backdrop-blur-md placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/40 dark:focus:ring-emerald-500/30"
                />
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl active:scale-[0.98] transition"
                >
                  <Plus className="h-5 w-5" /> Save Note
                </button>
              </div>
            </form>

            <AnimatePresence initial={false}>
              {notes.length > 0 ? (
                <div className="mt-5 grid gap-4">
                  {notes.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative rounded-3xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 shadow-sm backdrop-blur-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(n.createdAt)}</p>
                          <p className="mt-1 whitespace-pre-wrap text-slate-800 dark:text-slate-100">{n.text}</p>
                        </div>
                        <button
                          onClick={() => setNotes((prev) => prev.filter((x) => x.id !== n.id))}
                          className="rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10 p-1.5 shadow hover:shadow-md"
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<NotebookPen className="h-8 w-8" />} text="No notes yet. Write something inspiring!" />
              )}
            </AnimatePresence>
          </SectionShell>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/40 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Built with ❤ using React, TailwindCSS & Framer Motion — Moyna
          </div>
        </footer>
      </div>
    </div>
  );
}

// ------------------------ UI Shell Components ------------------------
function SectionShell({ title, subtitle, children }) {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5 shadow-sm backdrop-blur-xl"
      >
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          )}
        </div>
        {children}
      </motion.div>
    </section>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="mt-5 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 p-8 text-center">
      <div className="opacity-70">{icon}</div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  );
}
