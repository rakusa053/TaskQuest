import { useEffect } from 'react';
import { useShopStore } from '../store/shopStore';
import { useProfileStore } from '../store/profileStore';

export function useShop() {
  const { items, purchases, loading, purchasing, fetchItems, fetchPurchases, purchase } =
    useShopStore();
  const { fetch: refetchProfile } = useProfileStore();

  useEffect(() => {
    fetchItems();
  }, []);

  const buyItem = async (itemId: string) => {
    const result = await purchase(itemId);
    await refetchProfile();
    return result;
  };

  return { items, purchases, loading, purchasing, fetchPurchases, buy: buyItem };
}
