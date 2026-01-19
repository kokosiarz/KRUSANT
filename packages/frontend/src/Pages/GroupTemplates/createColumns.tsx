import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { GroupTemplate, ColumnConfig } from './types';



export const createColumns = (
  onEdit: (id: number) => void,
  onDuplicate: (template: GroupTemplate) => void,
  onDelete: (template: GroupTemplate) => void,
  actionsLocked: boolean,
  currency: string
): ColumnConfig[] => [
  {
    id: 'id',
    label: 'ID',
    render: (t) => t.id,
  },
  {
    id: 'templateName',
    label: 'Nazwa',
    render: (t) => t.templateName,
  },
  {
    id: 'isActive',
    label: 'Aktywny',
    render: (t) => (t.isActive ? 'Tak' : 'Nie'),
  },
  {
    id: 'cost',
    label: 'Koszt',
    render: (t) => (t.cost?.toFixed ? `${t.cost.toFixed(2)} ${currency}` : t.cost),
  },
  {
    id: 'unitCost',
    label: 'Koszt jednostkowy (h)',
    render: (t) => (t.unitCost?.toFixed ? `${t.unitCost.toFixed(2)} ${currency}` : t.unitCost),
  },
  {
    id: 'numberOfHours',
    label: 'Liczba godzin',
    render: (t) => t.numberOfHours ?? '-',
  },
  {
    id: 'studentIds',
    label: 'Kursanci',
    render: (t) => t.studentIds?.length ?? 0,
  },
  {
    id: 'classIds',
    label: 'Zajęcia',
    render: (t) => t.classIds?.length ?? 0,
  },
  {
    id: 'comment',
    label: 'Komentarz',
    render: (t) => t.comment,
    width: 200,
  },
  {
    id: 'actions',
    label: 'Akcje',
    render: (t) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton size="small" onClick={() => onEdit(t.id)} color="primary" disabled={actionsLocked}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDuplicate(t)} color="primary" disabled={actionsLocked}>
          <FileCopyIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(t)} color="primary" disabled={actionsLocked}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
  },
];

