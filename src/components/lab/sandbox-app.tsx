"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Raccoon Supply Co. — a tiny store built to be tested. Each screen hides a
 * classic locator or timing trap (see `data-lab-hint` and the comments).
 */

const PRODUCTS = [
  { id: "hoodie", name: "Trash Panda Hoodie", category: "Apparel", price: 48 },
  { id: "beanie", name: "Bandit Mask Beanie", category: "Apparel", price: 24 },
  { id: "mug", name: "Midnight Snack Mug", category: "Kitchen", price: 18 },
];

const LOAD_DELAY = 1200;
const SUBMIT_DELAY = 900;
const TOAST_DURATION = 5000;

type Screen = "login" | "shop" | "confirmed";

const money = (n: number) => `$${n.toFixed(2)}`;

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent/60";
const primary =
  "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60";
const secondary =
  "rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-accent-light";

export default function SandboxApp({ className }: { className?: string }) {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  return (
    <div id="sandbox" className={cn("relative flex min-h-[30rem] flex-col bg-surface text-foreground", className)}>
      {screen === "login" && (
        <LoginScreen
          onSignIn={(email) => {
            setUser(email.split("@")[0]);
            setScreen("shop");
          }}
          onGitHub={() => showToast("GitHub sign-in is turned off in the sandbox.")}
        />
      )}
      {screen === "shop" && (
        <ShopScreen
          user={user}
          cart={cart}
          setCart={setCart}
          onSignOut={() => {
            setCart({});
            setScreen("login");
          }}
          onOrderPlaced={() => {
            setCart({});
            setOrderCount((n) => n + 1);
            setScreen("confirmed");
            showToast("Order placed");
          }}
        />
      )}
      {screen === "confirmed" && (
        <ConfirmedScreen orderNumber={`#RS-${1041 + orderCount}`} onContinue={() => setScreen("shop")} />
      )}

      {/* Trap: transient UI. It's only on screen for a few seconds. */}
      {toast && (
        <div
          role="status"
          data-lab-hint="transient"
          className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 py-2 text-sm shadow-lg"
        >
          <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Login ──

function LoginScreen({ onSignIn, onGitHub }: { onSignIn: (email: string) => void; onGitHub: () => void }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form
        noValidate
        aria-labelledby={`${id}-heading`}
        className="w-full max-w-xs space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.includes("@") || !password) return setError(true);
          onSignIn(email);
        }}
      >
        <div className="text-center">
          <ShoppingBag className="mx-auto h-7 w-7 text-accent" aria-hidden="true" />
          <h2 id={`${id}-heading`} className="mt-2 font-display text-lg font-semibold">
            Welcome back
          </h2>
          <p className="text-xs text-muted-foreground">Raccoon Supply Co.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${id}-email`} className="text-xs font-medium">
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-password`} className="text-xs font-medium">
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
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="accent-[var(--accent)]" />
          Remember me
        </label>

        {error && (
          <p role="alert" className="text-xs font-medium text-accent-hover">
            Enter a valid email and password.
          </p>
        )}

        {/* Trap: "Sign in" is a substring of "Sign in with GitHub". */}
        <button type="submit" className={cn(primary, "w-full")}>
          Sign in
        </button>
        <button type="button" onClick={onGitHub} className={cn(secondary, "w-full")}>
          Sign in with GitHub
        </button>
      </form>
    </div>
  );
}

// ── Shop ──

function ShopScreen({
  user,
  cart,
  setCart,
  onSignOut,
  onOrderPlaced,
}: {
  user: string;
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onSignOut: () => void;
  onOrderPlaced: () => void;
}) {
  const id = useId();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);

  // Trap: async content. Products "arrive from the API" after a delay.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOAD_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const visible = PRODUCTS.filter(
    (p) =>
      (category === "All" || p.category === category) && p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3">
        <h2 className="font-display text-base font-semibold">Raccoon Supply Co.</h2>
        <span className="hidden text-xs text-muted-foreground sm:inline">Hi, {user}</span>
        <div className="ml-auto flex items-center gap-2">
          {/* Trap: the accessible name changes with the count. */}
          <button type="button" onClick={() => setCartOpen(true)} className={cn(secondary, "whitespace-nowrap px-3 py-1.5")}>
            Cart ({count})
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="whitespace-nowrap px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-5 pt-4 sm:flex-row">
        {/* Trap: placeholder, no label. */}
        <input
          type="search"
          placeholder="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(field, "sm:flex-1")}
        />
        <div className="flex items-center gap-2">
          <label htmlFor={`${id}-category`} className="text-xs font-medium text-muted-foreground">
            Category
          </label>
          <select
            id={`${id}-category`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(field, "w-auto py-1.5")}
          >
            <option>All</option>
            <option>Apparel</option>
            <option>Kitchen</option>
          </select>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        {loading ? (
          <ul aria-hidden="true" className="grid gap-3 sm:grid-cols-3">
            {PRODUCTS.map((p) => (
              <li key={p.id} className="h-32 animate-pulse rounded-xl border border-border bg-muted" />
            ))}
          </ul>
        ) : visible.length ? (
          // Trap: three identical "Add to cart" buttons.
          <ul aria-label="Products" className="grid gap-3 sm:grid-cols-3">
            {visible.map((p) => (
              <li key={p.id} className="flex flex-col rounded-xl border border-border bg-background p-4">
                <h3 className="text-sm font-semibold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <p className="mb-3 mt-2 text-sm font-medium">{money(p.price)}</p>
                <button
                  type="button"
                  data-lab-hint="async-list"
                  onClick={() => setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))}
                  className={cn(primary, "mt-auto px-3 py-1.5 text-xs")}
                >
                  Add to cart
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No products match “{query}”.</p>
        )}
      </div>

      {cartOpen && (
        <CartDialog
          cart={cart}
          onRemove={(pid) =>
            setCart((c) => {
              const next = { ...c };
              delete next[pid];
              return next;
            })
          }
          onClose={() => setCartOpen(false)}
          onOrderPlaced={onOrderPlaced}
        />
      )}
    </div>
  );
}

function CartDialog({
  cart,
  onRemove,
  onClose,
  onOrderPlaced,
}: {
  cart: Record<string, number>;
  onRemove: (id: string) => void;
  onClose: () => void;
  onOrderPlaced: () => void;
}) {
  const id = useId();
  const [placing, setPlacing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const submitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lines = PRODUCTS.filter((p) => cart[p.id]);
  const total = lines.reduce((sum, p) => sum + p.price * cart[p.id], 0);

  useEffect(() => {
    closeRef.current?.focus();
    return () => clearTimeout(submitTimer.current);
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex justify-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="flex h-full w-full max-w-xs flex-col border-l border-border bg-surface p-5"
      >
        <div className="flex items-center justify-between">
          <h3 id={`${id}-title`} className="font-display text-base font-semibold">
            Your cart
          </h3>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {lines.length ? (
          <ul className="mt-4 space-y-3">
            {lines.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {cart[p.id]} · {money(p.price * cart[p.id])}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Your cart is empty.</p>
        )}

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <p className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span data-testid="cart-total" className="font-semibold">
              {money(total)}
            </span>
          </p>
          {/* Trap: disabled while submitting. */}
          <button
            type="button"
            data-lab-hint="disables"
            disabled={!lines.length || placing}
            onClick={() => {
              setPlacing(true);
              submitTimer.current = setTimeout(onOrderPlaced, SUBMIT_DELAY);
            }}
            className={cn(primary, "w-full")}
          >
            {placing ? "Placing order…" : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirmation ──

function ConfirmedScreen({ orderNumber, onContinue }: { orderNumber: string; onContinue: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
        <Check className="h-6 w-6 text-emerald-500" aria-hidden="true" />
      </div>
      <h2 className="font-display text-lg font-semibold">Thanks for your order!</h2>
      <p className="text-sm text-muted-foreground">
        Order{" "}
        <strong data-testid="order-number" className="text-foreground">
          {orderNumber}
        </strong>{" "}
        is on its way.
      </p>
      <button type="button" onClick={onContinue} className={cn(secondary, "mt-2")}>
        Continue shopping
      </button>
    </div>
  );
}
