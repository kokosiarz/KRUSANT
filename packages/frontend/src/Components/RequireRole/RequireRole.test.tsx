import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import RequireRole from './index';
import { useAuth } from '@hooks/useAuth';

vi.mock('@hooks/useAuth');

function renderWithRoles(userRoles: string[] | undefined, requiredRoles: string[]) {
  (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    user: userRoles ? { roles: userRoles } : null,
  });

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route
          path="/protected"
          element={
            <RequireRole roles={requiredRoles}>
              <div>Protected content</div>
            </RequireRole>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  it('renders children when the user has one of the required roles', () => {
    renderWithRoles(['admin'], ['admin', 'teacher']);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to / when the user has none of the required roles', () => {
    renderWithRoles(['student'], ['admin']);
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects to / when the user has no roles at all', () => {
    renderWithRoles([], ['admin']);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects to / when there is no user', () => {
    renderWithRoles(undefined, ['admin']);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
