"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  defaultPreferences, FOLLOWING_KEYS, parsePreferences, parseBaseline, parseInbox,
  readLocal, saveLocal, parseResultsFeed, reconcileResults, mergeInbox,
} from "@/lib/resultados-following.mjs";
import type { Preferences, Baseline, ResultEvent, Result, Schedule } from "@/lib/resultados-following.mjs";
import { LOTERIAS_CONFIG } from "@/lib/loterias-config";
import styles from "./ResultsFollowing.module.css";

type Feed = { results: Result[]; schedule: Schedule[] };
type FollowingContext = {
  ready: boolean; preferences: Preferences; inbox: ResultEvent[]; feed: Feed | null;
  loading: boolean; error: string; storageAvailable: boolean;
  browserStatus: string; toggleFavorite: (game: string) => void;
  setAlerts: (enabled: boolean) => void; enableBrowser: () => Promise<void>;
  disableBrowser: () => void; clearInbox: () => void; clearAll: () => void;
};
const Context = createContext<FollowingContext | null>(null);
const INTERVAL = 180_000;
const MIN_INTERVAL = 120_000;

export function ResultsFollowingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [inbox, setInbox] = useState<ResultEvent[]>([]);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [browserStatus, setBrowserStatus] = useState("As notificações do navegador estão desativadas.");
  const prefsRef = useRef(preferences), inboxRef = useRef(inbox);
  const baselineRef = useRef<Baseline>(parseBaseline(null));
  const pollRef = useRef<{ active: boolean; lastAttempt: number; controller: AbortController | null }>({ active: false, lastAttempt: 0, controller: null });

  const persist = useCallback((key: string, value: unknown) => {
    try {
      if (!saveLocal(window.localStorage, key, value)) setStorageAvailable(false);
    } catch { setStorageAvailable(false); }
  }, []);

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      let next = defaultPreferences(), alerts: ResultEvent[] = [], baseline = parseBaseline(null);
      try {
        const storage = window.localStorage;
        next = parsePreferences(readLocal(storage, FOLLOWING_KEYS.preferences));
        alerts = parseInbox(readLocal(storage, FOLLOWING_KEYS.inbox));
        baseline = parseBaseline(readLocal(storage, FOLLOWING_KEYS.baseline));
        // Detect a storage that exists but refuses writes. The data remains usable in memory.
        if (!saveLocal(storage, FOLLOWING_KEYS.preferences, next)) setStorageAvailable(false);
      } catch { setStorageAvailable(false); }
      prefsRef.current = next; inboxRef.current = alerts; baselineRef.current = baseline;
      setPreferences(next); setInbox(alerts); setReady(true);
      if (!("Notification" in window)) setBrowserStatus("Este navegador não oferece notificações. Os avisos nesta página continuam disponíveis.");
      else if (Notification.permission === "denied") setBrowserStatus("O navegador bloqueou as notificações. Use os avisos nesta página ou altere a permissão nas configurações do navegador.");
      else if (next.browserEnabled && Notification.permission === "granted") setBrowserStatus("Notificações locais ativadas enquanto o site estiver aberto e visível.");
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key === FOLLOWING_KEYS.preferences || event.key === null) {
        const next = parsePreferences(event.newValue);
        prefsRef.current = next; setPreferences(next);
        if (!next.favorites.length) { pollRef.current.controller?.abort(); setLoading(false); }
        if (!next.browserEnabled) setBrowserStatus("As notificações do navegador estão desativadas neste site.");
      }
      if (event.key === FOLLOWING_KEYS.baseline || event.key === null) baselineRef.current = parseBaseline(event.newValue);
      if (event.key === FOLLOWING_KEYS.inbox || event.key === null) {
        const alerts = parseInbox(event.newValue); inboxRef.current = alerts; setInbox(alerts);
      }
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);

  const updatePreferences = useCallback((nextValue: Preferences) => {
    const previous = prefsRef.current, next = parsePreferences(nextValue);
    // Enabling alerts starts from a fresh, silent baseline, never a historical queue.
    baselineRef.current = !previous.alertsEnabled && next.alertsEnabled
      ? parseBaseline(null)
      : reconcileResults(baselineRef.current, [], next.favorites).baseline;
    prefsRef.current = next; setPreferences(next);
    if (!next.favorites.length) { pollRef.current.controller?.abort(); setLoading(false); }
    if (previous.browserEnabled && !next.browserEnabled) setBrowserStatus("As notificações do navegador estão desativadas neste site.");
    persist(FOLLOWING_KEYS.preferences, next); persist(FOLLOWING_KEYS.baseline, baselineRef.current);
  }, [persist]);

  const hasFavorites = preferences.favorites.length > 0;
  useEffect(() => {
    if (!ready || !hasFavorites) return;
    let stopped = false;
    const pollState = pollRef.current;
    pollState.lastAttempt = 0;
    const poll = async () => {
      const current = pollState;
      if (stopped || document.visibilityState !== "visible" || current.active || Date.now() - current.lastAttempt < MIN_INTERVAL) return;
      current.active = true; current.lastAttempt = Date.now();
      const controller = new AbortController(); current.controller = controller;
      const timeout = window.setTimeout(() => controller.abort(), 12_000);
      setLoading(true);
      try {
        const response = await fetch("/api/resultados", { signal: controller.signal, credentials: "same-origin", cache: "default", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("feed");
        const length = Number(response.headers.get("content-length") ?? 0);
        if (length > 300_000) throw new Error("size");
        const text = await response.text();
        if (text.length > 300_000) throw new Error("size");
        const next = parseResultsFeed(JSON.parse(text));
        if (!next) throw new Error("data");
        if (stopped || document.visibilityState !== "visible") return;
        setFeed(next); setError("");
        const prefs = prefsRef.current;
        const reconciled = reconcileResults(baselineRef.current, next.results, prefs.favorites);
        baselineRef.current = reconciled.baseline;
        persist(FOLLOWING_KEYS.baseline, reconciled.baseline);
        if (prefs.alertsEnabled && reconciled.events.length) {
          const events = reconciled.events.filter(event => !inboxRef.current.some(old => old.id === event.id));
          const alerts = mergeInbox(inboxRef.current, events);
          inboxRef.current = alerts; setInbox(alerts); persist(FOLLOWING_KEYS.inbox, { version: 1, events: alerts });
          if (prefs.browserEnabled && "Notification" in window && Notification.permission === "granted") {
            for (const event of events) {
              try {
                const notice = new Notification(event.kind === "new" ? "Novo resultado no Hoje Notícia" : "Resultado corrigido no Hoje Notícia", { body: `${LOTERIAS_CONFIG[event.result.game].name}, concurso ${event.result.concurso}. Abra Meus resultados para conferir os detalhes.`, tag: event.id });
                window.setTimeout(() => notice.close(), 15_000);
              } catch { setBrowserStatus("A notificação do navegador não pôde ser exibida. O aviso foi guardado nesta página."); }
            }
          }
        }
      } catch {
        if (!stopped) setError("Não foi possível consultar os resultados agora. Os dados anteriores foram mantidos; haverá nova tentativa com o site visível.");
      } finally {
        window.clearTimeout(timeout);
        current.active = false; current.controller = null;
        if (!stopped) setLoading(false);
      }
    };
    // A deferred start lets a request aborted when the final favorite was removed
    // finish its cleanup before a newly selected favorite starts the next poll.
    const firstPoll = () => {
      if (stopped) return;
      if (pollState.active) { initialTimer = window.setTimeout(firstPoll, 50); return; }
      void poll();
    };
    let initialTimer = window.setTimeout(firstPoll, 0);
    const timer = window.setInterval(() => { void poll(); }, INTERVAL);
    const visible = () => { if (document.visibilityState === "visible") void poll(); };
    document.addEventListener("visibilitychange", visible);
    return () => {
      stopped = true; window.clearTimeout(initialTimer); window.clearInterval(timer); document.removeEventListener("visibilitychange", visible);
      pollState.controller?.abort();
    };
  }, [ready, hasFavorites, persist]);

  const toggleFavorite = useCallback((game: string) => {
    const current = prefsRef.current;
    updatePreferences({ ...current, favorites: current.favorites.includes(game) ? current.favorites.filter(id => id !== game) : [...current.favorites, game] });
  }, [updatePreferences]);
  const setAlerts = useCallback((enabled: boolean) => {
    updatePreferences({ ...prefsRef.current, alertsEnabled: enabled, browserEnabled: enabled && prefsRef.current.browserEnabled });
  }, [updatePreferences]);
  const enableBrowser = useCallback(async () => {
    if (!("Notification" in window)) { setBrowserStatus("Notificações indisponíveis neste navegador. Você pode usar os avisos nesta página."); return; }
    try {
      // This function is called only by the user's notification button.
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        updatePreferences({ ...prefsRef.current, alertsEnabled: true, browserEnabled: true });
        setBrowserStatus("Notificações locais ativadas enquanto o site estiver aberto e visível.");
      } else setBrowserStatus("Notificações do navegador não autorizadas. Os avisos nesta página continuam disponíveis.");
    } catch { setBrowserStatus("Não foi possível pedir a permissão. Use os avisos nesta página."); }
  }, [updatePreferences]);
  const disableBrowser = useCallback(() => {
    updatePreferences({ ...prefsRef.current, browserEnabled: false });
    setBrowserStatus("As notificações do navegador foram desativadas neste site.");
  }, [updatePreferences]);
  const clearInbox = useCallback(() => {
    inboxRef.current = []; setInbox([]); persist(FOLLOWING_KEYS.inbox, { version: 1, events: [] });
  }, [persist]);
  const clearAll = useCallback(() => {
    const next = defaultPreferences(); prefsRef.current = next; baselineRef.current = parseBaseline(null); inboxRef.current = [];
    pollRef.current.controller?.abort(); setLoading(false);
    setPreferences(next); setInbox([]); setFeed(null); setError(""); setBrowserStatus("As notificações do navegador estão desativadas.");
    persist(FOLLOWING_KEYS.preferences, next); persist(FOLLOWING_KEYS.baseline, baselineRef.current); persist(FOLLOWING_KEYS.inbox, { version: 1, events: [] });
  }, [persist]);

  return <Context.Provider value={{ ready, preferences, inbox, feed, loading, error, storageAvailable, browserStatus, toggleFavorite, setAlerts, enableBrowser, disableBrowser, clearInbox, clearAll }}>{children}</Context.Provider>;
}

export function useResultsFollowing() {
  const context = useContext(Context);
  if (!context) throw new Error("ResultsFollowingProvider must wrap the page.");
  return context;
}

export function FavoriteButton({ game, name }: { game: string; name: string }) {
  const following = useContext(Context);
  const selected = following?.preferences.favorites.includes(game) ?? false;
  if (!following) return <Link className={styles.button} href="/meus-resultados">Acompanhar {name}</Link>;
  return <button type="button" className={styles.button} disabled={!following.ready} aria-pressed={selected} onClick={() => following.toggleFavorite(game)}>{selected ? `Remover ${name} dos favoritos` : `Acompanhar ${name}`}</button>;
}
