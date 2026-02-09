import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import './Grid.css'; // optional styling

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

// Helper function to format column names
const formatColumnName = (columnName) => {
  if (typeof columnName !== 'string') return '';
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper to get field name from column (handles both string and object format)
const getColumnField = (col) => typeof col === 'object' ? col.field : col;

// Helper to get display name from column
const getColumnDisplay = (col) => {
  if (typeof col === 'object' && col.displayName) {
    return col.displayName;
  }
  const fieldName = getColumnField(col);
  return formatColumnName(fieldName);
};

export default function Grid({
  columns,
  columnRenderers,
  data,
  allowEditing = false,
  allowDelete = false,
  pageSize = 20,
  height = '500px',
  onDataChange,
  onEditRow,
  onDeleteRow,
  allowSelection = true,
}) {
  const [rowData, setRowData] = useState(Array.isArray(data) ? data : []);
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    setRowData(Array.isArray(data) ? data : []);
  }, [data]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const effectiveColumns = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) return columns;
    const firstRow = Array.isArray(data) && data.length > 0 ? data[0] : undefined;
    return firstRow ? Object.keys(firstRow) : [];
  }, [columns, data]);

  const columnDefs = useMemo(() => {
    const baseCols = effectiveColumns.map((col) => {
      const fieldName = getColumnField(col);
      const displayName = getColumnDisplay(col);
      
      const colDef = {
        headerName: displayName,
        field: fieldName,
        editable: false, // prevent inline editing; use modal instead
        sortable: true,
        filter: false,
        floatingFilter: false,
        resizable: false,
        suppressMenu: true,
        suppressMovable: true,
        flex: isNarrow ? undefined : 1,
        minWidth: isNarrow ? 140 : undefined,
        cellRenderer: columnRenderers ? columnRenderers[fieldName] : undefined
      };

      // Add valueGetter if provided in column config
      if (typeof col === 'object' && col.valueGetter) {
        colDef.valueGetter = (params) => col.valueGetter(params.data);
      }

      return colDef;
    });

    const actionCol = {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params) => {
        const row = params.data;
        return (
          <div className="grid-actions">
            {allowEditing && (
              <button
                onClick={() => onEditRow?.(row)}
                className="icon-btn"
                aria-label="Edit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21l3.75-1 11.1-11.1a1.5 1.5 0 000-2.12L14.23 2.16a1.5 1.5 0 00-2.12 0L1 13.27V17h3.73L3 21z" fill="#111827" />
                </svg>
              </button>
            )}
            {allowDelete && (
              <button 
                onClick={() => onDeleteRow?.(row)} 
                className="icon-btn danger"
                aria-label="Delete"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626"/>
                </svg>
              </button>
            )}
          </div>
        );
      },
      sortable: false,
      filter: false,
      width: 120,
      minWidth: 120,
      lockPosition: true,
      suppressMovable: true,
    };

    // Only show the Actions column when editing or deleting is enabled
    if (!allowEditing && !allowDelete) return baseCols;

    return [...baseCols, actionCol];
  }, [effectiveColumns, allowEditing, allowDelete, onDeleteRow, onEditRow, isNarrow, columnRenderers]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: false,
    resizable: false,
    suppressMovable: true, // prevent dragging/reordering columns
    suppressMenu: true,
    floatingFilter: false,
  }), []);

  const getRowId = useCallback((params) => {
    return params.data.id != null ? params.data.id : JSON.stringify(params.data);
  }, []);

  const handleCellValueChanged = useCallback(
    (event) => {
      setRowData((prev) => {
        const updated = prev.map((row) =>
          row === event.node.data ? event.data : row
        );
        if (typeof onDataChange === 'function') onDataChange(updated);
        return updated;
      });
    },
    [onDataChange]
  );

  return (
    <>
      <div className="ag-theme-alpine" style={{ width: '100%', height, overflowX: 'auto' }}>
        <AgGridReact
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          animateRows={true}
          pagination={true}
          paginationPageSize={pageSize}
          rowSelection={allowSelection ? 'multiple' : 'none'}
          suppressClickEdit={true} // disable double-click inline edit; editing via modal only
          onCellValueChanged={allowEditing ? handleCellValueChanged : undefined}
          suppressHorizontalScroll={false}
          suppressMovableColumns={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>

    </>
  );
}