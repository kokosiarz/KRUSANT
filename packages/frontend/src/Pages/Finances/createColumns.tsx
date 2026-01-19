import React from 'react';
import { FinanceEntry } from './types';

export function createColumns() {
  return [
    {
      id: 'date',
      label: 'Data',
      render: (entry: FinanceEntry) => new Date(entry.date).toLocaleDateString(),
    },
    {
      id: 'amount',
      label: 'Kwota',
      render: (entry: FinanceEntry) => (
        <span style={{ color: entry.amount < 0 ? '#d32f2f' : '#388e3c' }}>
          {entry.amount.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'studentName',
      label: 'Kursant',
      render: (entry: FinanceEntry) => entry.studentName,
    },
    {
      id: 'type',
      label: 'Typ',
      render: (entry: FinanceEntry) => entry.type === 'payment' ? 'Wpłata' : 'Obciążenie',
    },
    {
      id: 'comment',
      label: 'Komentarz',
      render: (entry: FinanceEntry) => entry.comment || '',
    },
    {
      id: 'proofType',
      label: 'Dowód wpłaty',
      render: (entry: FinanceEntry) => entry.type === 'payment' ? (entry.proofType === 'invoice' ? 'Faktura' : 'Paragon') : '',
    },
    {
      id: 'fiscalized',
      label: 'Zafiskalizowano',
      render: (entry: FinanceEntry) => entry.type === 'payment' ? (entry.fiscalized ? 'Tak' : 'Nie') : '',
    },
    {
      id: 'entitlement',
      label: 'Tytułem',
      render: (entry: FinanceEntry) => entry.type === 'debit' ? (entry.entitlement || '') : '',
    },
    // {
    //   id: 'classId',
    //   label: 'ID zajęć',
    //   render: (entry: FinanceEntry) => entry.type === 'debit' ? (entry.classId || '') : '',
    // },
  ];
}
