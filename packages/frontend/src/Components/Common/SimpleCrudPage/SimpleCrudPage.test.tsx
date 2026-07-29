import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import SimpleCrudPage from './index';

interface Widget {
  id: number;
  name: string;
}

function renderPage(api: {
  getAll: () => Promise<Widget[]>;
  create: (data: any) => Promise<Widget>;
  update: (id: number, data: any) => Promise<Widget>;
  remove: (id: number) => Promise<void>;
}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SimpleCrudPage<Widget>
        title="Widżety"
        queryKey="widgets"
        entityLabelAccusative="widżet"
        getItemName={(w) => w.name}
        fields={[{ key: 'name', label: 'Nazwa', type: 'text', required: true }]}
        api={api}
      />
    </QueryClientProvider>,
  );
}

// MUI X DataGrid's toolbar renders CSS that jsdom's layout engine can't
// resolve when @testing-library/dom scans the whole `screen` (document.body)
// for role candidates — so once CommonTable/DataGrid is mounted, any
// `screen.*ByRole(...)` call crashes. Locating the dialog via a raw DOM
// selector (rather than `screen.findByRole('dialog')`) and then scoping all
// further queries with `within()` avoids the DataGrid subtree entirely.
async function findDialog(): Promise<HTMLElement> {
  return waitFor(() => {
    const el = document.querySelector('[role="dialog"]');
    if (!el) throw new Error('dialog not yet in the document');
    return el as HTMLElement;
  });
}

describe('SimpleCrudPage', () => {
  it('lists items returned by the API', async () => {
    renderPage({
      getAll: vi.fn().mockResolvedValue([{ id: 1, name: 'Alpha' }]),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    });
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
  });

  it('creates a new item and refreshes the list', async () => {
    const create = vi.fn().mockResolvedValue({ id: 2, name: 'Beta' });
    const getAll = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 2, name: 'Beta' }]);
    renderPage({ getAll, create, update: vi.fn(), remove: vi.fn() });

    const user = userEvent.setup();
    await user.click(await screen.findByText('Dodaj'));
    const dialog = await findDialog();
    await user.type(within(dialog).getByLabelText(/nazwa/i), 'Beta');
    await user.click(within(dialog).getByText(/utwórz/i));

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: 'Beta' }));
    expect(await screen.findByText('Beta')).toBeInTheDocument();
  });

  it('shows the API error instead of silently closing the dialog on failure', async () => {
    const create = vi.fn().mockRejectedValue(new Error('Nazwa zajęta'));
    renderPage({
      getAll: vi.fn().mockResolvedValue([]),
      create,
      update: vi.fn(),
      remove: vi.fn(),
    });

    const user = userEvent.setup();
    await user.click(await screen.findByText('Dodaj'));
    const dialog = await findDialog();
    await user.type(within(dialog).getByLabelText(/nazwa/i), 'Cokolwiek');
    await user.click(within(dialog).getByText(/utwórz/i));

    expect(await within(dialog).findByText('Nazwa zajęta')).toBeInTheDocument();
    // Dialog must still be open with the entered value intact.
    expect(within(dialog).getByLabelText(/nazwa/i)).toHaveValue('Cokolwiek');
  });

  it('disables submit until required fields are filled', async () => {
    renderPage({
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    });
    const user = userEvent.setup();
    await user.click(await screen.findByText('Dodaj'));
    const dialog = await findDialog();
    expect(within(dialog).getByText(/utwórz/i).closest('button')).toBeDisabled();
  });
});
