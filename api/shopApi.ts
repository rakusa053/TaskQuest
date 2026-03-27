import apiClient from './client';
import type { ShopItem, PurchaseLog } from '../types';

interface PurchaseResponse {
  success: boolean;
  item: ShopItem;
  remainingMoney: number;
  gachaTickets?: number;
  xpBoostExpiresAt?: number;
}

export const shopApi = {
  items: () =>
    apiClient.get<ShopItem[]>('/api/shop').then((r) => r.data),

  purchases: () =>
    apiClient.get<PurchaseLog[]>('/api/shop/purchases').then((r) => r.data),

  purchase: (itemId: string) =>
    apiClient.post<PurchaseResponse>(`/api/shop/purchase/${itemId}`).then((r) => r.data),
};
