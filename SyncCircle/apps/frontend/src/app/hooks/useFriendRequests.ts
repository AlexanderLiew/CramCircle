import { useState, useEffect, useCallback } from 'react';
import { apiClient, UnauthorizedError } from '../lib/api-client';
import {
  API_PATHS,
  type IncomingRequestsResponse,
  type OutgoingRequestsResponse,
  type CreateFriendRequestResponse,
  type AcceptRejectCancelResponse,
} from '@synccircle/shared';
import { useAuth } from './useAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IncomingRequest {
  requestId: string;
  senderDisplayName: string;
  createdAt: string;
}

export interface OutgoingRequest {
  requestId: string;
  recipientEmail: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface UseFriendRequestsReturn {
  incoming: IncomingRequest[];
  outgoing: OutgoingRequest[];
  isLoading: boolean;
  error: string | null;
  sendRequest: (email: string, displayName: string) => Promise<CreateFriendRequestResponse>;
  acceptRequest: (requestId: string) => Promise<AcceptRejectCancelResponse>;
  rejectRequest: (requestId: string) => Promise<AcceptRejectCancelResponse>;
  cancelRequest: (requestId: string) => Promise<AcceptRejectCancelResponse>;
  refresh: () => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook for interacting with the Friend Requests API.
 * Manages incoming/outgoing requests and provides mutation methods.
 * Does NOT use localStorage — all data comes from the backend.
 */
export function useFriendRequests(): UseFriendRequestsReturn {
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(!DEV_BYPASS);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const fetchRequests = useCallback(async () => {
    // Dev bypass: return mock data
    if (DEV_BYPASS) {
      setIncoming([
        { requestId: 'req-1', senderDisplayName: 'David Chen', createdAt: '2026-07-01T08:00:00Z' },
      ]);
      setOutgoing([
        { requestId: 'req-2', recipientEmail: 'eve@school.edu', status: 'pending', createdAt: '2026-06-30T16:00:00Z' },
      ]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [incomingData, outgoingData] = await Promise.all([
        apiClient.get<IncomingRequestsResponse>(API_PATHS.FRIEND_REQUESTS_INCOMING),
        apiClient.get<OutgoingRequestsResponse>(API_PATHS.FRIEND_REQUESTS_OUTGOING),
      ]);
      setIncoming(incomingData.requests);
      setOutgoing(outgoingData.requests);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setError('Session expired. Please log in again.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch friend requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sendRequest = useCallback(async (email: string, displayName: string): Promise<CreateFriendRequestResponse> => {
    if (DEV_BYPASS) {
      const mockResponse: CreateFriendRequestResponse = { requestId: `req-${Date.now()}`, status: 'pending' } as any;
      setOutgoing((prev) => [...prev, { requestId: mockResponse.requestId, recipientEmail: email, status: 'pending', createdAt: new Date().toISOString() }]);
      return mockResponse;
    }

    setError(null);
    try {
      const response = await apiClient.post<CreateFriendRequestResponse>(API_PATHS.FRIEND_REQUESTS, {
        recipientEmail: email,
        recipientDisplayName: displayName,
      });
      await fetchRequests();
      return response;
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
      }
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
      throw err;
    }
  }, [fetchRequests, logout]);

  const acceptRequest = useCallback(async (requestId: string): Promise<AcceptRejectCancelResponse> => {
    if (DEV_BYPASS) {
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
      return { message: 'Accepted (dev mode)' } as any;
    }

    setError(null);
    try {
      const path = API_PATHS.FRIEND_REQUESTS_ACCEPT.replace(':requestId', requestId);
      const response = await apiClient.post<AcceptRejectCancelResponse>(path);
      await fetchRequests();
      return response;
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
      }
      setError(err instanceof Error ? err.message : 'Failed to accept friend request');
      throw err;
    }
  }, [fetchRequests, logout]);

  const rejectRequest = useCallback(async (requestId: string): Promise<AcceptRejectCancelResponse> => {
    if (DEV_BYPASS) {
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
      return { message: 'Rejected (dev mode)' } as any;
    }

    setError(null);
    try {
      const path = API_PATHS.FRIEND_REQUESTS_REJECT.replace(':requestId', requestId);
      const response = await apiClient.post<AcceptRejectCancelResponse>(path);
      await fetchRequests();
      return response;
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
      }
      setError(err instanceof Error ? err.message : 'Failed to reject friend request');
      throw err;
    }
  }, [fetchRequests, logout]);

  const cancelRequest = useCallback(async (requestId: string): Promise<AcceptRejectCancelResponse> => {
    if (DEV_BYPASS) {
      setOutgoing((prev) => prev.filter((r) => r.requestId !== requestId));
      return { message: 'Cancelled (dev mode)' } as any;
    }

    setError(null);
    try {
      const path = API_PATHS.FRIEND_REQUESTS_CANCEL.replace(':requestId', requestId);
      const response = await apiClient.post<AcceptRejectCancelResponse>(path);
      await fetchRequests();
      return response;
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
      }
      setError(err instanceof Error ? err.message : 'Failed to cancel friend request');
      throw err;
    }
  }, [fetchRequests, logout]);

  return {
    incoming,
    outgoing,
    isLoading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    refresh: fetchRequests,
  };
}
