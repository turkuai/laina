import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import './Grid.css';

const formatHeader = (str) =>
  typeof str !== 'string'
    ? ''
    : str
        .split('_')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');

const getField = (col) => (typeof col === 'object' ? col.field : col);
const getHeader = (col) =>
  (typeof col === 'object' && col.displayName) || formatHeader(getField(col));

export default function Grid({
  columns,
  columnRenderers = {},
  data = [],
  allowEditing = false,
  allowDelete = false,
  pageSize = 20,
  height = '500px',
  onEditRow,
  onDeleteRow,
}) {
  const [rows, setRows] = useState(Array.isArray(data) ? data : []);

  useEffect(() => {
    setRows(Array.isArray(data) ? data : []);
  }, [data]);

  const cols = useMemo(() => {
    const list = Array.isArray(columns) && columns.length > 0
      ? columns
      : rows[0]
        ? Object.keys(rows[0])
        : [];

    const dataCols = list.map((col) => {
      const id = getField(col);
      const colObj = typeof col === 'object' ? col : { field: id };
      return {
        id,
        accessorKey: id,
        header: getHeader(col),
        enableSorting: true,
        cell: ({ row, getValue }) => {
          const value = colObj.valueGetter ? colObj.valueGetter(row.original) : getValue();
          const Renderer = columnRenderers[id];
          return Renderer ? <Renderer value={value} data={row.original} /> : (value != null ? String(value) : '');
        },
      };
    });

    if (!allowEditing && !allowDelete) return dataCols;

    return [
      ...dataCols,
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="grid-actions">
              {allowEditing && (
                <button type="button" onClick={() => onEditRow?.(r)} className="icon-btn" aria-label="Edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 21l3.75-1 11.1-11.1a1.5 1.5 0 000-2.12L14.23 2.16a1.5 1.5 0 00-2.12 0L1 13.27V17h3.73L3 21z" fill="#111827" />
                  </svg>
                </button>
              )}
              {allowDelete && (
                <button type="button" onClick={() => onDeleteRow?.(r)} className="icon-btn danger" aria-label="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626" />
                  </svg>
                </button>
              )}
            </div>
          );
        },
      },
    ];
  }, [columns, columnRenderers, rows, allowEditing, allowDelete, onEditRow, onDeleteRow]);

  const table = useReactTable({
    data: rows,
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="grid-wrapper" style={{ width: '100%', height, overflowX: 'auto' }}>
      <table className="data-grid-table">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className={h.column.getCanSort() ? 'sortable' : ''}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.getPageCount() > 1 && (
        <div className="grid-pagination">
          <button
            type="button"
            className="btn-page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            type="button"
            className="btn-page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
