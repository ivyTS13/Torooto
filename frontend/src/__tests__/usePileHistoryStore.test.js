import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/api', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockApi, api: mockApi };
});

import api from '../services/api';
import usePileHistoryStore from '../stores/usePileHistoryStore';

describe('usePileHistoryStore', () => {
  beforeEach(() => {
    usePileHistoryStore.setState({
      piles: [],
      totalPages: 1,
      currentPage: 1,
      isLoading: false,
      error: null,
      currentPile: null,
      isLoadingPile: false,
      pileError: null,
    });
  });

  it('stores piles and snake_case pagination metadata from fetchPiles', async () => {
    api.get.mockResolvedValueOnce({
      items: [
        { pile_id: 'p-1', drawn_at: '2026-11-17T00:00:00Z', pile_contents: [] },
        { pile_id: 'p-2', drawn_at: '2026-11-16T00:00:00Z', pile_contents: [] },
      ],
      total_pages: 4,
      page: 2,
    });

    await usePileHistoryStore.getState().fetchPiles(2, 5);

    const state = usePileHistoryStore.getState();
    expect(api.get).toHaveBeenCalledWith('/piles/list?page=2&pageSize=5');
    expect(state.piles).toHaveLength(2);
    expect(state.totalPages).toBe(4);
    expect(state.currentPage).toBe(2);
    expect(state.isLoading).toBe(false);
  });

  it('filters deleted reading by snake_case pile_id on deletePile', async () => {
    api.delete.mockResolvedValueOnce({ success: true });
    usePileHistoryStore.setState({
      piles: [
        { pile_id: 'p-1', drawn_at: '2026-11-17T00:00:00Z' },
        { pile_id: 'p-2', drawn_at: '2026-11-16T00:00:00Z' },
      ],
    });

    const res = await usePileHistoryStore.getState().deletePile('p-1');

    expect(res).toEqual({ success: true });
    expect(api.delete).toHaveBeenCalledWith('/piles/p-1');
    expect(usePileHistoryStore.getState().piles).toEqual([
      { pile_id: 'p-2', drawn_at: '2026-11-16T00:00:00Z' },
    ]);
  });

  it('preserves list and returns error when deletePile fails', async () => {
    api.delete.mockRejectedValueOnce('Permission denied');
    usePileHistoryStore.setState({
      piles: [{ pile_id: 'p-1' }],
    });

    const res = await usePileHistoryStore.getState().deletePile('p-1');

    expect(res).toEqual({ success: false, error: 'Permission denied' });
    expect(usePileHistoryStore.getState().piles).toHaveLength(1);
  });
});
