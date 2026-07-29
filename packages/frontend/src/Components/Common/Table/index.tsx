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
    <Box sx={{ p: 3, width: '100%', height: 'calc(100vh - 120px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{tableTitle}</Typography>
        {dialogs}
        {headerButtons}
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
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              fontWeight: 700,
              borderBottom: '2px solid',
              borderColor: 'primary.dark',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
            },
            '& .inactive-row': {
              opacity: 0.5,
              backgroundColor: (theme) => theme.palette.action.disabledBackground,
            },
          }}
          autoHeight={false}
        />
      </Box>
    </Box>
  );
}

export default CommonTable;
