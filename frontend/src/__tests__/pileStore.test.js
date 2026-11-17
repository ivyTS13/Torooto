import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

vi.mock('../utils/imagePreload', () => ({
  preloadCardBack: vi.fn(),
  preloadCardImages: vi.fn(),
  preloadImage: vi.fn(),
}));

import api from '../services/api';
import useDrawerStore from '../stores/pileStore';
import { preloadCardImages, preloadImage } from '../utils/imagePreload';

const makeDeck = (count = 10) =>
  Array.from({ length: count }, (_, idx) => ({
    card_id: `card-${idx}`,
    card_name: `Arcana ${idx}`,
    card_suit: 'Major Arcana',
    card_position: idx,
    image_url: `https://ik.imagekit.io/demo/card-${idx}.jpg`,
    card_metadata: { upright: `Upright ${idx}` },
  }));

describe('pileStore (useDrawerStore)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useDrawerStore.setState({
      fullDeck: [],
      availableCards: [],
      numCards: 3,
      drawMode: 'auto',
      allowReversed: true,
      drawnCards: [],
      flippedCards: {},
      isFetchingDeck: true,
      isShuffling: false,
      isLoading: false,
      error: null,
      isSaved: false,
    });
  });

  afterEach(() => {
    useDrawerStore.getState().cancelDrawSequence();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('draws unique cards in auto mode via Fisher-Yates without mutating fullDeck', () => {
    const deck = makeDeck(12);
    const originalIds = deck.map((c) => c.card_id);
    useDrawerStore.setState({
      fullDeck: deck,
      numCards: 5,
      drawMode: 'auto',
      allowReversed: false,
    });

    useDrawerStore.getState().startDrawSequence();
    expect(useDrawerStore.getState().isShuffling).toBe(true);

    vi.advanceTimersByTime(1500);

    const state = useDrawerStore.getState();
    expect(state.isShuffling).toBe(false);
    expect(state.drawnCards).toHaveLength(5);
    expect(new Set(state.drawnCards.map((c) => c.card_id)).size).toBe(5);
    expect(state.drawnCards.every((c) => c.isReversed === false)).toBe(true);
    expect(state.fullDeck.map((c) => c.card_id)).toEqual(originalIds);
    expect(preloadCardImages).toHaveBeenCalledWith(state.drawnCards);
  });

  it('respects allowReversed probability when enabled', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    useDrawerStore.setState({
      fullDeck: makeDeck(6),
      numCards: 3,
      drawMode: 'auto',
      allowReversed: true,
    });

    useDrawerStore.getState().startDrawSequence();
    vi.advanceTimersByTime(1500);

    expect(useDrawerStore.getState().drawnCards.every((c) => c.isReversed === true)).toBe(true);
  });

  it('fills empty manual slots sequentially via pickManualCard and removes chosen cards from availableCards', () => {
    const deck = makeDeck(5);
    useDrawerStore.setState({
      fullDeck: deck,
      numCards: 2,
      drawMode: 'manual',
      allowReversed: false,
    });

    useDrawerStore.getState().startDrawSequence();
    vi.advanceTimersByTime(1500);

    expect(useDrawerStore.getState().drawnCards).toEqual([null, null]);
    expect(useDrawerStore.getState().availableCards).toHaveLength(5);

    const [firstPick, secondPick] = useDrawerStore.getState().availableCards;
    useDrawerStore.getState().pickManualCard(firstPick);
    expect(preloadImage).toHaveBeenCalledWith(firstPick.image_url);
    expect(useDrawerStore.getState().drawnCards[0]?.card_id).toBe(firstPick.card_id);
    expect(useDrawerStore.getState().drawnCards[1]).toBeNull();
    expect(useDrawerStore.getState().availableCards).toHaveLength(4);

    useDrawerStore.getState().pickManualCard(secondPick);
    expect(useDrawerStore.getState().drawnCards[1]?.card_id).toBe(secondPick.card_id);
    expect(useDrawerStore.getState().availableCards).toHaveLength(3);
  });

  it('clears pending shuffle timer on resetBoard so canceled draws never populate later', () => {
    useDrawerStore.setState({
      fullDeck: makeDeck(6),
      numCards: 3,
      drawMode: 'auto',
      drawnCards: [null, null, null],
    });

    useDrawerStore.getState().startDrawSequence();
    expect(useDrawerStore.getState().isShuffling).toBe(true);

    useDrawerStore.getState().resetBoard();
    expect(useDrawerStore.getState().isShuffling).toBe(false);

    vi.advanceTimersByTime(2000);
    expect(useDrawerStore.getState().drawnCards).toEqual([null, null, null]);
  });

  it('submits exact snake_case payload when savePile is called', async () => {
    api.post.mockResolvedValueOnce({ pile_id: 'pile-999' });

    useDrawerStore.setState({
      drawnCards: [
        { card_id: 'c-1', card_name: 'Fool', isReversed: false },
        { card_id: 'c-2', card_name: 'Magician', isReversed: true },
      ],
    });

    await useDrawerStore.getState().savePile();

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/piles/save-fe-pile', {
      cards: [
        { card_id: 'c-1', reversed_card: false, position: 0 },
        { card_id: 'c-2', reversed_card: true, position: 1 },
      ],
    });
    expect(useDrawerStore.getState().isSaved).toBe(true);
    expect(useDrawerStore.getState().isLoading).toBe(false);
  });
});
