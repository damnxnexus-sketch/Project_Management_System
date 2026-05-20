'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { User } from '@/types';

export function StoreInitializer({ currentUser, allUsers }: { currentUser: User, allUsers: User[] }) {
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const setUsers = useStore((state) => state.setUsers);

  useEffect(() => {
    if (currentUser) setCurrentUser(currentUser);
    if (allUsers) setUsers(allUsers);
  }, [currentUser, allUsers, setCurrentUser, setUsers]);

  return null;
}
