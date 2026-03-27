import { useEffect, useState } from 'react';
import { partyApi } from '../api/partyApi';
import type { Party, Boss } from '../types';

export function useParty() {
  const [party, setParty] = useState<Party | null>(null);
  const [partyBoss, setPartyBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const p = await partyApi.get();
      setParty(p);
      if (p) {
        const b = await partyApi.boss();
        setPartyBoss(b);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const create = async (name?: string) => {
    const p = await partyApi.create(name);
    setParty(p);
    const b = await partyApi.boss();
    setPartyBoss(b);
    return p;
  };

  const join = async (inviteCode: string) => {
    const p = await partyApi.join(inviteCode);
    setParty(p);
    const b = await partyApi.boss();
    setPartyBoss(b);
    return p;
  };

  const leave = async () => {
    await partyApi.leave();
    setParty(null);
    setPartyBoss(null);
  };

  const damageBoss = async (data: {
    taskId: string;
    priority: 'low' | 'medium' | 'high';
    isOnTime: boolean;
    displayName?: string;
  }) => {
    const result = await partyApi.damageBoss(data);
    if (partyBoss) setPartyBoss({ ...partyBoss, hp: result.newHp });
    return result;
  };

  return { party, partyBoss, loading, create, join, leave, damageBoss, refetch: fetch };
}
