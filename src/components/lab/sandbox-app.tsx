"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExternalLink, Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARTWORKS, LOGIN_BACKDROP, type Artwork } from "./swesso-art";

/**
 * Mini Swesso: a small slice of my art-matching app, built to be tested.
 * Each screen hides a classic locator or timing trap (see `data-lab-hint`
 * and the "Trap:" comments).
 */

const LOAD_DELAY = 1200;
const LOGIN_DELAY = 700;
const TOAST_DURATION = 5000;
const SWIPE_THRESHOLD = 90;

type Screen = "login" | "discover" | "matches";
type Decision = "love" | "pass";

// Swesso's own palette, independent of the portfolio's theme.
const field =
  "w-full rounded-lg border border-[#e2d8c8] bg-white px-3 py-2 text-sm text-[#2b2430] outline-none transition-colors placeholder:text-[#a2979a] focus:border-[#5b6bc4]";
const primary =
  "rounded-full bg-[#2b2430] px-5 py-2 text-sm font-semibold text-[#fffcf6] transition-colors hover:bg-[#4a3f50] disabled:cursor-not-allowed disabled:opacity-60";
const secondary =
  "rounded-full border border-[#d9cfbf] px-5 py-2 text-sm font-medium text-[#2b2430] transition-colors hover:border-[#5b6bc4] hover:text-[#5b6bc4]";
const wordmark = "font-[Georgia,'Times_New_Roman',serif] italic tracking-tight";

function Painting({ art, className, ...rest }: { art: Artwork; className?: string; "data-lab-hint"?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-optimized WebP; skipping Image Optimization keeps this at zero transformations
    <img src={art.image} alt={art.alt} draggable={false} className={className} {...rest} />
  );
}

export default function SandboxApp({ className }: { className?: string }) {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState("");
  const [deckIndex, setDeckIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const decide = (decision: Decision) => {
    const art = ARTWORKS[deckIndex];
    if (!art) return;
    if (decision === "love") {
      setMatches((m) => [art.id, ...m]);
      showToast("It's a match! Saved to your collection.");
    }
    setDeckIndex((i) => i + 1);
  };

  const logOut = () => {
    setMatches([]);
    setDeckIndex(0);
    setScreen("login");
  };

  return (
    <div
      id="sandbox"
      className={cn("relative flex min-h-[36rem] flex-col overflow-hidden bg-[#f5efe4] text-[#2b2430]", className)}
    >
      {screen === "login" ? (
        <LoginScreen
          onLogIn={(name) => {
            setUser(name);
            setScreen("discover");
          }}
        />
      ) : (
        <>
          <Header screen={screen} matchCount={matches.length} onNavigate={setScreen} onLogOut={logOut} />
          {screen === "discover" ? (
            <DiscoverScreen user={user} deckIndex={deckIndex} onDecide={decide} onSeeMatches={() => setScreen("matches")} />
          ) : (
            <MatchesScreen
              matches={matches}
              onRemove={(id) => setMatches((m) => m.filter((x) => x !== id))}
              onDiscover={() => setScreen("discover")}
            />
          )}
        </>
      )}

      {/* Trap: transient UI. It's only on screen for a few seconds. */}
      {toast && (
        <div
          role="status"
          data-lab-hint="transient"
          className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#2b2430] px-4 py-2 text-sm text-[#fffcf6] shadow-lg"
        >
          <Heart className="h-4 w-4 fill-[#e58fa5] text-[#e58fa5]" aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Log in ──

function LoginScreen({ onLogIn }: { onLogIn: (name: string) => void }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center p-6">
      {/* Decorative backdrop: alt="" keeps it out of the accessibility tree. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimized WebP, see Painting */}
      <img
        src={LOGIN_BACKDROP.image}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f5efe4]/40 via-[#f5efe4]/70 to-[#f5efe4]/95" />

      <div className="relative w-full max-w-sm text-center">
        <p className={cn(wordmark, "text-5xl text-[#2b2430] drop-shadow-sm")}>Swesso</p>
        <p className="mt-2 text-sm text-[#4a3f50]">Swipe through museum collections and discover your artistic matches.</p>

        <form
          noValidate
          aria-labelledby={`${id}-heading`}
          className="mt-6 space-y-3 rounded-2xl border border-[#e2d8c8] bg-[#fffcf6]/95 p-5 text-left shadow-xl shadow-[#2b2430]/10 backdrop-blur"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@") || !password) return setError(true);
            setError(false);
            setBusy(true);
            timer.current = setTimeout(() => onLogIn(email.split("@")[0]), LOGIN_DELAY);
          }}
        >
          <h2 id={`${id}-heading`} className="text-base font-semibold">
            Log in
          </h2>
          <div className="space-y-1">
            <label htmlFor={`${id}-email`} className="text-xs font-medium text-[#4a3f50]">
              Email
            </label>
            <input id={`${id}-email`} type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${id}-password`} className="text-xs font-medium text-[#4a3f50]">
              Password
            </label>
            <input
              id={`${id}-password`}
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-[#b23a48]">
              Enter a valid email and password.
            </p>
          )}

          {/* Trap: "Log in" is a substring of "Log in as guest" (and the heading says it too). */}
          <button type="submit" data-lab-hint="disables" disabled={busy} className={cn(primary, "w-full")}>
            {busy ? "Logging in…" : "Log in"}
          </button>
          <button type="button" onClick={() => onLogIn("guest")} className={cn(secondary, "w-full")}>
            Log in as guest
          </button>
        </form>
      </div>

      <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-[#4a3f50]">
        {LOGIN_BACKDROP.title} · {LOGIN_BACKDROP.artist} · {LOGIN_BACKDROP.date}
      </p>
    </div>
  );
}

// ── Header ──

function Header({
  screen,
  matchCount,
  onNavigate,
  onLogOut,
}: {
  screen: Screen;
  matchCount: number;
  onNavigate: (screen: Screen) => void;
  onLogOut: () => void;
}) {
  const tab = (target: Screen) =>
    cn(
      "whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:px-3 sm:text-xs sm:tracking-wider",
      screen === target ? "bg-[#2b2430] text-[#fffcf6]" : "text-[#4a3f50] hover:text-[#5b6bc4]",
    );
  return (
    <header className="flex items-center gap-1 border-b border-[#e2d8c8] bg-[#fffcf6] px-3 py-2.5 sm:gap-2 sm:px-5">
      <p className={cn(wordmark, "mr-1 text-xl sm:mr-2 sm:text-2xl")}>Swesso</p>
      <nav aria-label="Swesso" className="flex items-center gap-1">
        <button type="button" aria-current={screen === "discover" ? "page" : undefined} onClick={() => onNavigate("discover")} className={tab("discover")}>
          Discover
        </button>
        {/* Trap: the accessible name changes with the count. */}
        <button type="button" aria-current={screen === "matches" ? "page" : undefined} onClick={() => onNavigate("matches")} className={tab("matches")}>
          Matches ({matchCount})
        </button>
      </nav>
      <button type="button" onClick={onLogOut} className="ml-auto whitespace-nowrap px-1 py-1.5 text-xs text-[#776c70] sm:px-2 transition-colors hover:text-[#2b2430]">
        Log out
      </button>
    </header>
  );
}

// ── Discover ──

function ArtCard({ art, hidden, offset }: { art: Artwork; hidden?: boolean; offset?: number }) {
  const id = useId();
  return (
    <article
      aria-labelledby={`${id}-title`}
      // Trap: the cards behind the top one are aria-hidden but still in the DOM.
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-[#e2d8c8] bg-[#fffcf6] shadow-xl shadow-[#2b2430]/10"
      style={offset ? { transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.04})`, zIndex: 10 - offset } : undefined}
    >
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#231d26] p-3">
        <Painting art={art} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="px-4 py-3">
        <h3 id={`${id}-title`} className={cn(wordmark, "text-lg leading-snug")}>
          {art.title}
        </h3>
        <p className="text-sm text-[#4a3f50]">{art.artist}</p>
        <p className="text-xs text-[#776c70]">
          {art.date} · {art.medium}
        </p>
      </div>
    </article>
  );
}

function DiscoverScreen({
  user,
  deckIndex,
  onDecide,
  onSeeMatches,
}: {
  user: string;
  deckIndex: number;
  onDecide: (decision: Decision) => void;
  onSeeMatches: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [drag, setDrag] = useState<{ startX: number; dx: number } | null>(null);
  const loveRef = useRef<HTMLButtonElement>(null);
  const passRef = useRef<HTMLButtonElement>(null);

  // Trap: async content. The stack "arrives from the API" after a delay.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOAD_DELAY);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Swipes and arrow keys press the real button, tagged so the Lab can explain
   * that it recorded the accessible button rather than the gesture.
   */
  const pressButton = (decision: Decision) => {
    const button = (decision === "love" ? loveRef : passRef).current;
    if (!button) return;
    button.dataset.labHint = "swipe";
    button.click();
    button.dataset.labHint = "async-list";
  };

  const stack = ARTWORKS.slice(deckIndex, deckIndex + 3);
  const [top, ...behind] = stack;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-5">
      <p className="text-sm text-[#776c70]">
        {user === "guest" ? "Browsing as a guest" : `Welcome back, ${user}`} · {Math.max(ARTWORKS.length - deckIndex, 0)} left in your stack
      </p>

      {loading ? (
        <div aria-busy="true" className="mt-4 w-full max-w-sm">
          <div className="h-[24rem] animate-pulse rounded-2xl border border-[#e2d8c8] bg-[#ece4d6]" />
          <p className="mt-3 text-center text-xs text-[#776c70]">Curating your stack…</p>
        </div>
      ) : top ? (
        <>
          <div className="relative mt-4 h-[24rem] w-full max-w-sm">
            {behind.map((art, i) => (
              <ArtCard key={art.id} art={art} hidden offset={i + 1} />
            ))}
            <div
              key={top.id}
              role="group"
              tabIndex={0}
              aria-label="Current artwork. Use the left and right arrow keys to pass or love it."
              className="absolute inset-0 z-10 cursor-grab touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#5b6bc4] active:cursor-grabbing"
              style={drag ? { transform: `translateX(${drag.dx}px) rotate(${drag.dx / 18}deg)` } : { transition: "transform 200ms ease-out" }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag({ startX: e.clientX, dx: 0 });
              }}
              onPointerMove={(e) => drag && setDrag({ ...drag, dx: e.clientX - drag.startX })}
              onPointerUp={() => {
                if (drag && Math.abs(drag.dx) > SWIPE_THRESHOLD) pressButton(drag.dx > 0 ? "love" : "pass");
                setDrag(null);
              }}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") pressButton("love");
                if (e.key === "ArrowLeft") pressButton("pass");
              }}
            >
              <ArtCard art={top} />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-5">
            {/* Icon-only buttons: their accessible names come from aria-label. */}
            <button
              ref={passRef}
              type="button"
              aria-label="Pass"
              data-lab-hint="async-list"
              onClick={() => onDecide("pass")}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d9cfbf] bg-[#fffcf6] text-[#776c70] shadow-sm transition-colors hover:border-[#2b2430] hover:text-[#2b2430]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              ref={loveRef}
              type="button"
              aria-label="Love it"
              data-lab-hint="async-list"
              onClick={() => onDecide("love")}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2b2430] text-[#e58fa5] shadow-lg transition-transform hover:scale-105"
            >
              <Heart className="h-6 w-6 fill-current" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#a2979a]">Drag the card, or use the arrow keys</p>
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className={cn(wordmark, "text-2xl")}>That&apos;s the whole collection.</p>
          <button type="button" onClick={onSeeMatches} className={cn(primary, "mt-4")}>
            See your matches
          </button>
        </div>
      )}
    </div>
  );
}

// ── Matches ──

function MatchesScreen({
  matches,
  onRemove,
  onDiscover,
}: {
  matches: string[];
  onRemove: (id: string) => void;
  onDiscover: () => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Recently matched");

  const matched = matches.flatMap((m) => ARTWORKS.filter((a) => a.id === m));
  const q = query.trim().toLowerCase();
  const visible = matched
    .filter((a) => `${a.title} ${a.artist}`.toLowerCase().includes(q))
    .sort((a, b) => (sort === "Artist" ? a.artist.localeCompare(b.artist) : sort === "Year" ? a.year - b.year : 0));

  return (
    <div className="flex flex-1 flex-col px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h2 id={`${id}-heading`} className={cn(wordmark, "text-2xl")}>
            Your matches
          </h2>
          <p data-testid="match-count" className="text-xs text-[#776c70]">
            {matched.length} artwork{matched.length === 1 ? "" : "s"}
          </p>
        </div>
        {/* Trap: placeholder, no label. */}
        <input
          type="search"
          placeholder="Search your matches"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(field, "w-full sm:w-52")}
        />
        <div className="flex items-center gap-2">
          <label htmlFor={`${id}-sort`} className="text-xs font-medium text-[#4a3f50]">
            Sort by
          </label>
          <select id={`${id}-sort`} value={sort} onChange={(e) => setSort(e.target.value)} className={cn(field, "w-auto py-1.5")}>
            <option>Recently matched</option>
            <option>Artist</option>
            <option>Year</option>
          </select>
        </div>
      </div>

      {!matched.length ? (
        <div className="mt-14 text-center">
          <p className="text-sm text-[#776c70]">No matches yet. Head back and love something.</p>
          <button type="button" onClick={onDiscover} className={cn(primary, "mt-4")}>
            Start discovering
          </button>
        </div>
      ) : !visible.length ? (
        <p className="mt-14 text-center text-sm text-[#776c70]">Nothing matches “{query}”.</p>
      ) : (
        // Trap: every card has its own "Remove" button and "View at The Met" link.
        <ul aria-labelledby={`${id}-heading`} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((art) => (
            <li key={art.id} className="flex flex-col overflow-hidden rounded-xl border border-[#e2d8c8] bg-[#fffcf6]">
              <div className="flex h-40 items-center justify-center bg-[#231d26] p-2">
                <Painting art={art} className="max-h-full max-w-full object-contain" data-lab-hint={art.alt ? undefined : "missing-alt"} />
              </div>
              <div className="flex flex-1 flex-col px-3 py-2.5">
                <h3 className="text-sm font-semibold leading-snug">{art.title}</h3>
                <p className="text-xs text-[#4a3f50]">{art.artist}</p>
                <p className="text-xs text-[#776c70]">{art.date}</p>
                <div className="mt-auto flex items-center justify-between pt-2.5">
                  {/* Trap: opens a new tab, so the test needs to catch the popup. */}
                  <a
                    href={art.metUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#5b6bc4] hover:underline"
                  >
                    View at The Met
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                  <button type="button" onClick={() => onRemove(art.id)} className="text-xs text-[#776c70] hover:text-[#b23a48]">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-auto pt-6 text-center text-[10px] text-[#a2979a]">
        Artworks: The Metropolitan Museum of Art, Open Access (public domain)
      </p>
    </div>
  );
}
