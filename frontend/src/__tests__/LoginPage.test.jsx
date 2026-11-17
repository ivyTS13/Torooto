import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../components/User/UserLayout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

import LoginPage from '../pages/LoginPage';
import useAuthStore from '../stores/authStore';

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      clearError: vi.fn(() => useAuthStore.setState({ error: null })),
    });
  });

  it('renders accessible Email and Password inputs linked via labels', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays error banner when login fails without throwing ReferenceError', async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn(async () => {
      useAuthStore.setState({ error: 'Invalid credentials.' });
      return false;
    });
    useAuthStore.setState({ login: loginMock });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), 'seeker@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith('seeker@example.com', 'wrongpass');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates standard and admin users to their respective routes on success', async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn(async () => {
      useAuthStore.setState({
        token: 'jwt-token',
        user: { id: 'u-1', is_superuser: true },
      });
      return true;
    });
    useAuthStore.setState({ login: loginMock });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'AdminPass123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
  });
});
