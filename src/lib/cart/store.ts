'use client';
import { useSyncExternalStore } from 'react';

/**
 * Carrito en localStorage. Solo guarda qué y cuánto: los precios se calculan
 * con el catálogo vigente y el servidor los recalcula al crear el pedido.
 */
export type CartItem =
  | { key: string; kind: 'product'; productId: string; qty: number }
  | { key: string; kind: 'combo'; boxProductId: string; category: string; qty: number }
  | { key: string; kind: 'surprise'; category: string; qty: number };

type NewCartItem =
  | { kind: 'product'; productId: string; qty?: number }
  | { kind: 'combo'; boxProductId: string; category: string; qty?: number }
  | { kind: 'surprise'; category: string; qty?: number };

const KEY = 'ec-cart-v1';
const EMPTY: CartItem[] = [];
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    cache = Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.qty === 'number' && i.qty > 0) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Sin almacenamiento (modo privado): el carrito vive solo en memoria.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', onStorage);
  };
}

export function itemKey(i: NewCartItem): string {
  if (i.kind === 'product') return `p:${i.productId}`;
  if (i.kind === 'combo') return `c:${i.boxProductId}:${i.category}`;
  return `s:${i.category}`;
}

export const cart = {
  add(i: NewCartItem, maxQty = 20) {
    const key = itemKey(i);
    const items = read();
    const existing = items.find((x) => x.key === key);
    const qty = i.qty ?? 1;
    if (existing) {
      write(items.map((x) => (x.key === key ? { ...x, qty: Math.min(maxQty, x.qty + qty) } : x)));
    } else {
      write([...items, { ...i, key, qty: Math.min(maxQty, qty) } as CartItem]);
    }
  },
  setQty(key: string, qty: number) {
    write(read().flatMap((x) => (x.key !== key ? [x] : qty > 0 ? [{ ...x, qty: Math.min(20, qty) }] : [])));
  },
  remove(key: string) {
    write(read().filter((x) => x.key !== key));
  },
  clear() {
    write([]);
  },
};

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount(): number {
  return useCart().reduce((n, i) => n + i.qty, 0);
}
