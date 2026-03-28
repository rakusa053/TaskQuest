import { create } from 'zustand';
import { shopApi } from '../api/shopApi';
import type { ShopItem, PurchaseLog } from '../types';

interface ShopState {
  items: ShopItem[];
  purchases: PurchaseLog[];
  loading: boolean;
  purchasing: boolean;
  fetchItems: () => Promise<void>;
  fetchPurchases: () => Promise<void>;
  purchase: (itemId: string) => Promise<{
    remainingMoney: number;
    gachaTickets?: number;
    xpBoostExpiresAt?: number;
  }>;
}

export const useShopStore = create<ShopState>((set) => ({
  items: [],
  purchases: [],
  loading: false,
  purchasing: false,

  fetchItems: async () => {
    set({ loading: true });
    try {
      const items = await shopApi.items();
      set({ items });
    } catch {
      // サーバー未起動時はスキップ
    } finally {
      set({ loading: false });
    }
  },

  fetchPurchases: async () => {
    try {
      const purchases = await shopApi.purchases();
      set({ purchases });
    } catch {
      // サーバー未起動時はスキップ
    }
  },

  purchase: async (itemId) => {
    set({ purchasing: true });
    try {
      const result = await shopApi.purchase(itemId);
      return {
        remainingMoney: result.remainingMoney,
        gachaTickets: result.gachaTickets,
        xpBoostExpiresAt: result.xpBoostExpiresAt,
      };
    } finally {
      set({ purchasing: false });
    }
  },
}));
