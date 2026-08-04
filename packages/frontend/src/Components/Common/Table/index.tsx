import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

export interface TableColumn<T> {
  id: string;
  label: React.ReactNode;
  render: (row: T) => React.ReactNode;
}

export interface CommonTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  tableTitle: string;
  dialogs?: React.ReactNode;
  headerButtons?: React.ReactNode;
  getRowKey?: (row: T) => string | number;
  getRowActive?: (row: T) => boolean;
  emptyMessage?: string;
  /** Column shown as the card heading on mobile. Defaults to the first column. */
  primaryColumnId?: string;
  /** Column pinned to the card footer on mobile. Defaults to `actions`. */
  actionsColumnId?: string;
}

/**
 * One row as a card. A DataGrid at 390px hides most of its columns with no way
 * to reach them — on the Students page that meant balance, the funds forecast
 * and the edit/delete buttons were simply unreachable on a phone. Cards show
 * every column as a label/value pair instead.
 */
function MobileRowCard<T extends { id: string | number }>({
  row,
  primary,
  actions,
  details,
  dimmed,
}: {
  row: T;
  primary?: TableColumn<T>;
  actions?: TableColumn<T>;
  details: TableColumn<T>[];
  dimmed: boolean;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, opacity: dimmed ? 0.6 : 1, borderRadius: 2.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {primary && (
          <Typography variant="subtitle1" sx={{ fontWeight: 650, minWidth: 0 }}>
            {primary.render(row)}
          </Typography>
        )}
        {actions && <Box sx={{ flexShrink: 0, mt: -0.5 }}>{actions.render(row)}</Box>}
      </Box>

      <Stack spacing={0.75} sx={{ mt: 1.5 }}>
        {details.map((col) => (
          <Box
            key={col.id}
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8125rem',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {col.label}
            </Box>
            <Box sx={{ textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>
              {col.render(row)}
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function CommonTable<T extends { id: string | number }>({
  columns,
  rows,
  tableTitle,
  dialogs,
  headerButtons,
  emptyMessage = 'Brak danych',
  getRowActive,
  getRowKey,
  primaryColumnId,
  actionsColumnId = 'actions',
}: CommonTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Map TableColumn<T> to GridColDef. `label` is typed as ReactNode (e.g. a
  // header with an explanatory tooltip), but DataGrid's `headerName` only
  // accepts a string — fall back to `renderHeader` for anything richer, and
  // use the column id as headerName so column-picker/menu UIs still have a
  // real name to show.
  const gridColumns: GridColDef[] = columns.map((col) => ({
    field: col.id,
    headerName: typeof col.label === 'string' ? col.label : col.id,
    renderHeader: typeof col.label === 'string' ? undefined : () => <>{col.label}</>,
    flex: 1,
    sortable: true,
    renderCell: (params: GridRenderCellParams<any, T>) => col.render(params.row),
    minWidth: 120,
  }));

  const rowKey = getRowKey ?? ((row: T) => row.id);
  const primary =
    columns.find((c) => c.id === (primaryColumnId ?? columns[0]?.id)) ?? undefined;
  const actions = columns.find((c) => c.id === actionsColumnId);
  const details = columns.filter(
    (c) => c.id !== primary?.id && c.id !== actions?.id,
  );

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        width: '100%',
        // On mobile the list flows with the page instead of being trapped in a
        // fixed-height scroller inside a scroller.
        height: { xs: 'auto', md: 'calc(100vh - 120px)' },
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          // Title and actions sit side by side once there's room; on a phone
          // the actions get their own full-width row rather than squeezing
          // the title into a column of stacked buttons.
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '1.375rem' } }}>
            {tableTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {rows.length === 0 ? emptyMessage : `Pozycji: ${rows.length}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {dialogs}
          {headerButtons}
        </Box>
      </Box>

      {isMobile ? (
        rows.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {emptyMessage}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {rows.map((row) => (
              <MobileRowCard
                key={rowKey(row)}
                row={row}
                primary={primary}
                actions={actions}
                details={details}
                dimmed={typeof getRowActive === 'function' && !getRowActive(row)}
              />
            ))}
          </Stack>
        )
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
          <DataGrid
            showToolbar
            rows={rows}
            columns={gridColumns}
            disableRowSelectionOnClick
            getRowId={rowKey}
            localeText={{ noRowsLabel: emptyMessage }}
            getRowClassName={(params) => {
              if (typeof getRowActive === 'function') {
                return getRowActive(params.row as T) ? '' : 'inactive-row';
              }
              return '';
            }}
            // Header/cell/row styling comes from the theme's MuiDataGrid
            // overrides so every grid matches; only the inactive-row treatment
            // is specific to this component.
            sx={{
              '& .inactive-row': {
                color: 'text.disabled',
                backgroundColor: (t) => t.palette.action.hover,
                '& .MuiDataGrid-cell': { opacity: 0.65 },
              },
            }}
            autoHeight={false}
          />
        </Box>
      )}
    </Box>
  );
}

export default CommonTable;
