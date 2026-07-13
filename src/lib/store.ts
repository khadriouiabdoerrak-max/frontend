import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackAddToCart } from './tracking';

export interface CartProduct {
  id: string;
  slug: string;
  nameAr: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  isBundle?: boolean;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getCartTotal: () => number;
  getIndividualCount: () => number;
  hasBundle: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...product, quantity: 1 }],
            isOpen: true,
          };
        });
        trackAddToCart({
          content_ids: [product.id],
          content_name: product.nameAr,
          value: product.price,
          currency: 'MAD',
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== productId)
              : state.items.map((item) =>
                  item.id === productId ? { ...item, quantity } : item,
                ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getCartTotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),

      getIndividualCount: () =>
        get()
          .items.filter((item) => !item.isBundle)
          .reduce((total, item) => total + item.quantity, 0),

      hasBundle: () => get().items.some((item) => item.isBundle),
    }),
    {
      name: 'tajouki-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
