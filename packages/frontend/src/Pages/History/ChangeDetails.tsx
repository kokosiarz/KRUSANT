import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import type { ChangeRow } from './changeSummary';

const OPERATION_HEADING: Record<'create' | 'update' | 'delete', string> = {
  create: 'Utworzono z wartościami:',
  update: 'Zmienione pola:',
  delete: 'Usunięty rekord zawierał:',
};

/** A value as it was, or as it became — muted when there was nothing there. */
const Value: React.FC<{ children: string; dim?: boolean; strike?: boolean }> = ({
  children,
  dim,
  strike,
}) => (
  <Typography
    variant="body2"
    component="span"
    sx={{
      color: dim ? 'text.disabled' : 'text.primary',
      textDecoration: strike ? 'line-through' : 'none',
      wordBreak: 'break-word',
    }}
  >
    {children}
  </Typography>
);

/**
 * The field-by-field detail behind one history entry.
 *
 * Laid out as label / old / new rather than a text diff: these are structured
 * records, and "Sala: Pracownia A → Pracownia B" answers the question a text
 * diff would make the reader assemble themselves. Roster changes show only who
 * joined or left, since a class can carry a dozen students and listing both
 * sides in full means diffing names by eye.
 */
const ChangeDetails: React.FC<{
  rows: ChangeRow[];
  operation: 'create' | 'update' | 'delete';
}> = ({ rows, operation }) => {
  if (rows.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {/* An update that changed nothing still gets logged; saying so is more
            use than an empty panel that looks broken. */}
        Zapisano bez zmian w danych.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
        {OPERATION_HEADING[operation]}
      </Typography>
      <Stack spacing={1}>
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: 'grid',
              // The label column is fixed on anything but a phone so the values
              // line up down the list instead of stepping in and out.
              gridTemplateColumns: { xs: '1fr', sm: '190px 1fr' },
              gap: { xs: 0.25, sm: 1.5 },
              alignItems: 'baseline',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {row.label}
            </Typography>

            {row.added || row.removed ? (
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {row.added?.map((name) => (
                  <Chip key={`+${name}`} size="small" color="success" variant="outlined" label={`+ ${name}`} />
                ))}
                {row.removed?.map((name) => (
                  <Chip key={`-${name}`} size="small" color="error" variant="outlined" label={`− ${name}`} />
                ))}
                {!row.added?.length && !row.removed?.length && (
                  <Value dim>—</Value>
                )}
              </Stack>
            ) : (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}
              >
                {row.before !== undefined && (
                  <Value dim={row.before === '—'} strike={row.after !== undefined}>
                    {row.before}
                  </Value>
                )}
                {row.before !== undefined && row.after !== undefined && (
                  <ArrowRightAltIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                )}
                {row.after !== undefined && (
                  <Value dim={row.after === '—'}>{row.after}</Value>
                )}
              </Stack>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ChangeDetails;
