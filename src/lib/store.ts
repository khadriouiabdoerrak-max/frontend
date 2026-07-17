import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  isCheckoutOpen: boolean;
  addItem: (product: CartProduct, options?: { open?: boolean }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  resetCheckoutFlow: () => void;
  getCartTotal: () => number;
  getIndividualCount: () => number;
  hasBundle: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isCheckoutOpen: false,

      addItem: (product, options) => {
        const shouldOpen = options?.open !== false;
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
              isOpen: shouldOpen ? true : state.isOpen,
            };
          }
          return {
            items: [...state.items, { ...product, quantity: 1 }],
            isOpen: shouldOpen ? true : state.isOpen,
          };
        });
        void import('./tracking').then(({ trackAddToCart }) =>
          trackAddToCart({
            content_ids: [product.id],
            content_name: product.nameAr,
            value: product.price,
            currency: 'MAD',
          }),
        );
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

      clearCart: () =>
        set({ items: [], isOpen: false, isCheckoutOpen: false }),

      toggleCart: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          isCheckoutOpen: false,
        })),

      openCart: () => set({ isOpen: true, isCheckoutOpen: false }),

      closeCart: () => set({ isOpen: false }),

      /** Cart closes first — only the checkout form stays on screen. */
      openCheckout: () => set({ isOpen: false, isCheckoutOpen: true }),

      closeCheckout: () => set({ isCheckoutOpen: false }),

      resetCheckoutFlow: () =>
        set({ isOpen: false, isCheckoutOpen: false }),

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
