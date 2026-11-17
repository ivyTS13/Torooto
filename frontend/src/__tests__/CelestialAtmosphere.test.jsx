import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CelestialCanvas from '../components/common/CelestialCanvas';
import LunarPhaseDial from '../components/common/LunarPhaseDial';
import RegistrationMarks from '../components/common/RegistrationMarks';
import TarotWorkspace from '../components/reading/TarotWorkspace';
import useDrawerStore from '../stores/pileStore';

describe('Celestial Atmosphere & Tactile Ornamentation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useDrawerStore.setState({
      isShuffling: false,
      isFetchingDeck: false,
      drawnCards: [],
      availableCards: [],
      flippedCards: {},
    });
  });

  it('renders CelestialCanvas safely in non-2D environments without throwing', () => {
    const { container } = render(<CelestialCanvas />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('computes accurate lunar phase telemetry and rotates brass ring on activation', async () => {
    const user = userEvent.setup();
    // Reference known New Moon epoch (2000-01-06T18:14Z) -> New Moon ~0%
    render(<LunarPhaseDial pulseStep={1} date={new Date(Date.UTC(2000, 0, 6, 18, 14, 0))} />);

    const dialBtn = screen.getByRole('button', {
      name: /Lunar telemetry: New Moon, 0% illuminated/i,
    });
    expect(dialBtn).toBeInTheDocument();
    expect(screen.getByText('New Moon')).toBeInTheDocument();

    const ringGroup = dialBtn.querySelector('svg g');
    expect(ringGroup).toHaveStyle({ transform: 'rotate(45deg)' });

    await user.click(dialBtn);
    expect(ringGroup).toHaveStyle({ transform: 'rotate(90deg)' });
  });

  it('renders RegistrationMarks cleanly as decorative brackets', () => {
    const { container } = render(<RegistrationMarks size="md" tone="oxblood" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper.querySelectorAll('span')).toHaveLength(4);
  });

  it('renders engraved brass shuffle astrolabe overlay during active shuffle', () => {
    useDrawerStore.setState({
      fullDeck: [{ card_id: 'c-1', card_name: 'The Magician', image_url: '' }],
      isFetchingDeck: false,
      isShuffling: true,
      drawnCards: [],
      availableCards: [],
    });

    render(<TarotWorkspace />);
    expect(screen.getByText(/Shuffling the Deck…/i)).toBeInTheDocument();
  });
});
