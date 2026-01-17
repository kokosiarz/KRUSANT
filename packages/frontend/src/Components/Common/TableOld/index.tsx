import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

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

function CommonTable<T>({
  columns,
  rows,
  tableTitle,
  dialogs,
  headerButtons,
  getRowKey = (row: any) => row.id,
  getRowActive = (row: any) => row.isActive !== false,
  emptyMessage = 'Brak danych',
}: CommonTableProps<T>) {
  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{tableTitle}</Typography>
        {dialogs}
        {headerButtons}
      </Box>
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} sx={{
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" fontStyle="italic">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  sx={{ opacity: getRowActive(row) ? 1 : 0.6, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CommonTable;
