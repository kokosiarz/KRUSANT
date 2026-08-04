import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
}: CommonTableProps<T>) {
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
    // You can add filterable: true here if needed
  }));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', height: 'calc(100vh - 120px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {tableTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {rows.length === 0 ? emptyMessage : `Pozycji: ${rows.length}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {dialogs}
          {headerButtons}
        </Box>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
        <DataGrid
          showToolbar
          rows={rows}
          columns={gridColumns}
          disableRowSelectionOnClick
          getRowId={getRowKey ?? ((row) => row.id)}
          localeText={{ noRowsLabel: emptyMessage }}
          getRowClassName={(params) => {
            // If getRowActive is provided and returns false, mark as inactive
            if (typeof getRowActive === 'function') {
              const row = params.row as T;
              return getRowActive(row) ? '' : 'inactive-row';
            }
            return '';
          }}
          // Header/cell/row styling now comes from the theme's MuiDataGrid
          // overrides so every grid in the app matches; only the inactive-row
          // treatment is specific to this component.
          sx={{
            '& .inactive-row': {
              color: 'text.disabled',
              backgroundColor: (theme) => theme.palette.action.hover,
              '& .MuiDataGrid-cell': { opacity: 0.65 },
            },
          }}
          autoHeight={false}
        />
      </Box>
    </Box>
  );
}

export default CommonTable;
