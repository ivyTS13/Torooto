import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SemicircleDeck from '../components/SemicircleDeck';
import useDrawerStore from '../stores/pileStore';

describe('SemicircleDeck', () => {
  const sampleDeck = [
    { card_id: 'c-1', card_name: 'The Sun', image_url: 'https://ik.imagekit.io/demo/sun.jpg' },
    { card_id: 'c-2', card_name: 'The Moon', image_url: 'https://ik.imagekit.io/demo/moon.jpg' },
    { card_id: 'c-3', card_name: 'The Star', image_url: 'https://ik.imagekit.io/demo/star.jpg' },
  ];

  beforeEach(() => {
    useDrawerStore.setState({
      availableCards: [],
      drawnCards: [null, null],
      allowReversed: false,
    });
  });

  it('renders nothing when availableCards is empty', () => {
    const { container } = render(<SemicircleDeck />);
    expect(container.firstChild).toBeNull();
  });

  it('allows keyboard/click two-step selection to draw a card into the spread', async () => {
    const user = userEvent.setup();
    useDrawerStore.setState({
      availableCards: sampleDeck,
      drawnCards: [null, null],
      allowReversed: false,
    });

    render(<SemicircleDeck />);

    const cardButtons = screen.getAllByRole('button', { name: /Select Tarot card/i });
    expect(cardButtons).toHaveLength(3);
    expect(cardButtons[0]).toHaveAttribute('aria-pressed', 'false');

    // First Enter/click raises/selects the card
    cardButtons[0].focus();
    await user.keyboard('{Enter}');
    expect(cardButtons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(useDrawerStore.getState().drawnCards[0]).toBeNull();

    // Second Enter confirms selection and calls pickManualCard
    await user.keyboard('{Enter}');
    expect(useDrawerStore.getState().drawnCards[0]?.card_id).toBe('c-1');
    expect(useDrawerStore.getState().availableCards.map((c) => c.card_id)).toEqual(['c-2', 'c-3']);
  });

  it('clears active card selection when clicking outside the deck', async () => {
    const user = userEvent.setup();
    useDrawerStore.setState({ availableCards: sampleDeck });

    render(
      <div>
        <button type="button">Outside Target</button>
        <SemicircleDeck />
      </div>,
    );

    const cardBtn = screen.getByRole('button', { name: 'Select Tarot card 2' });
    await user.click(cardBtn);
    expect(cardBtn).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Outside Target' }));
    expect(cardBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
