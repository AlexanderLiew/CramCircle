import { useState, useEffect, useCallback } from 'react';
import { apiClient, UnauthorizedError } from '../lib/api-client';
import { API_PATHS, type FriendsListResponse } from '@synccircle/shared';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Friend {
  friendId: string;
  displayName: string;
  createdAt: string;
}

export interface UseFriendsReturn {
  friends: Friend[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook for interacting with the Friends API.
 * Fetches the list of active friends and provides a method to remove a friend.
 * Does NOT use localStorage — all data comes from the backend.
 */
export function useFriends(): UseFriendsReturn {
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(!DEV_BYPASS);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const fetchFriends = useCallback(async () => {
    // Dev bypass: return mock friends from seed data
    if (DEV_BYPASS) {
      setFriends([
        { friendId: 'alice-001', displayName: 'Alice Tan', createdAt: '2026-06-25T10:00:00Z' },
        { friendId: 'bob-002', displayName: 'Bob Lim', createdAt: '2026-06-26T14:30:00Z' },
        { friendId: 'charlie-003', displayName: 'Charlie Wong', createdAt: '2026-06-28T09:15:00Z' },
      ]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<FriendsListResponse>(API_PATHS.FRIENDS);
      setFriends(data.friends);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setError('Session expired. Please log in again.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (DEV_BYPASS) {
      setFriends((prev) => prev.filter((f) => f.friendId !== friendId));
      toast.success('Friend removed (dev mode)');
      return;
    }

    setError(null);
    try {
      const path = API_PATHS.FRIENDS_REMOVE.replace(':friendId', friendId);
      await apiClient.del(path);
      await fetchFriends();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
      throw err;
    }
  }, [fetchFriends, logout]);

  return {
    friends,
    isLoading,
    error,
    refresh: fetchFriends,
    removeFriend,
  };
}
