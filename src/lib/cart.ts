export type CartItem = {
  slug: string;
  name: string;
  price: string;
  category: string;
  imageUrl: string | null;
};

const KEY = "rs-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  if (cart.some((i) => i.slug === item.slug)) return;
  setCart([...cart, item]);
}

export function removeFromCart(slug: string) {
  setCart(getCart().filter((i) => i.slug !== slug));
}

export function clearCart() {
  setCart([]);
}
