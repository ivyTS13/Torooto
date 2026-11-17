import React, { Profiler } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardSlot from '../components/CardSlot';
import useDrawerStore from '../stores/pileStore';

describe('CardSlot', () => {
  const cardOne = {
    card_id: 'card-1',
    card_name: 'The Fool',
    image_url: 'https://ik.imagekit.io/demo/fool.jpg',
    isReversed: false,
  };
  const cardTwo = {
    card_id: 'card-2',
    card_name: 'The Tower',
    image_url: 'https://ik.imagekit.io/demo/tower.jpg',
    isReversed: true,
  };

  beforeEach(() => {
    useDrawerStore.setState({
      drawnCards: [cardOne, cardTwo],
      flippedCards: {},
    });
  });

  it('renders empty slot label when no card is assigned at index', () => {
    useDrawerStore.setState({ drawnCards: [null] });
    render(<CardSlot index={0} />);

    expect(screen.getByText(/SLOT 1/i)).toBeInTheDocument();
  });

  it('supports keyboard activation (Enter/Space) and click to toggle flip state', async () => {
    const user = userEvent.setup();
    render(<CardSlot index={0} />);

    const cardButton = screen.getByRole('button', { name: /The Fool/i });
    expect(cardButton).toHaveAttribute('aria-pressed', 'false');

    cardButton.focus();
    await user.keyboard('{Enter}');
    expect(useDrawerStore.getState().flippedCards['card-1']).toBe(true);
    expect(cardButton).toHaveAttribute('aria-pressed', 'true');

    await user.keyboard(' ');
    expect(useDrawerStore.getState().flippedCards['card-1']).toBe(false);
    expect(cardButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('isolates flip updates so sibling CardSlot does not re-render when another slot flips', async () => {
    const user = userEvent.setup();
    let slotTwoRenders = 0;

    render(
      <>
        <CardSlot index={0} />
        <Profiler
          id="slot-1"
          onRender={() => {
            slotTwoRenders += 1;
          }}
        >
          <CardSlot index={1} />
        </Profiler>
      </>,
    );

    const rendersAfterMount = slotTwoRenders;
    const firstSlotBtn = screen.getByRole('button', { name: /The Fool/i });
    await user.click(firstSlotBtn);

    expect(useDrawerStore.getState().flippedCards['card-1']).toBe(true);
    expect(useDrawerStore.getState().flippedCards['card-2']).toBeUndefined();
    expect(slotTwoRenders).toBe(rendersAfterMount);

    // Ensure direct store update to card-2 still triggers slot 2 render when appropriate
    act(() => {
      useDrawerStore.getState().toggleFlip('card-2');
    });
    expect(useDrawerStore.getState().flippedCards['card-2']).toBe(true);
  });

  it('displays rotated card artwork container with upright nameplate and REVERSED badge', () => {
    render(<CardSlot index={1} />);

    expect(screen.getByRole('button', { name: /The Tower \(Reversed\)/i })).toBeInTheDocument();
    expect(screen.getByText('REVERSED')).toBeInTheDocument();
    expect(screen.getByText('The Tower')).toBeInTheDocument();
    expect(screen.getAllByText('II').length).toBeGreaterThanOrEqual(1);
    const img = screen.getByAltText('The Tower');
    expect(img.parentElement).toHaveClass('rotate-180');
  });
});
