import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  inlineEdit = false,
  editingRowId = null,
  onSaveRow,
  onCancelEdit,
}) {
  const [rowData, setRowData] = useState(Array.isArray(data) ? data : []);
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const pendingDeleteTimerRef = useRef(null);

  useEffect(() => {
    setRowData(Array.isArray(data) ? data : []);
  }, [data]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Reset pending delete when data changes
  useEffect(() => {
    setPendingDeleteId(null);
  }, [data]);

  // Cleanup pending-delete timer on unmount
  useEffect(() => {
    return () => {
      if (pendingDeleteTimerRef.current) {
        clearTimeout(pendingDeleteTimerRef.current);
      }
    };
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
        editable: inlineEdit ? (params) => params.data?.id != null && params.data.id === editingRowId : false,
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

        if (inlineEdit) {
          const isEditingThisRow = editingRowId != null && row?.id != null && editingRowId === row.id;
          const isPendingDelete = pendingDeleteId != null && row?.id != null && pendingDeleteId === row.id;

          return (
            <div className="grid-actions">
              {allowEditing && !isEditingThisRow && (
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
              {allowEditing && isEditingThisRow && (
                <>
                  <button
                    onClick={() => {
                      params.api.stopEditing();
                      setTimeout(() => {
                        const rowNode = params.api.getRowNode(String(row.id));
                        onSaveRow?.(rowNode?.data || row);
                      }, 0);
                    }}
                    className="icon-btn inline-save"
                    aria-label="Save"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#16a34a" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      params.api.stopEditing(true);
                      onCancelEdit?.();
                    }}
                    className="icon-btn inline-cancel"
                    aria-label="Cancel"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280" />
                    </svg>
                  </button>
                </>
              )}
              {allowDelete && !isEditingThisRow && (
                <button
                  onClick={() => {
                    if (isPendingDelete) {
                      setPendingDeleteId(null);
                      if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
                      onDeleteRow?.(row);
                    } else {
                      setPendingDeleteId(row?.id);
                      if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
                      pendingDeleteTimerRef.current = setTimeout(() => setPendingDeleteId(null), 3000);
                    }
                  }}
                  className={`icon-btn danger${isPendingDelete ? ' confirm-delete' : ''}`}
                  aria-label={isPendingDelete ? 'Confirm Delete' : 'Delete'}
                >
                  {isPendingDelete ? (
                    <span className="confirm-delete-text">Confirm?</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
        }

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
      width: inlineEdit ? 160 : 120,
      minWidth: inlineEdit ? 160 : 120,
      lockPosition: true,
      suppressMovable: true,
    };

    // Only show the Actions column when editing or deleting is enabled
    if (!allowEditing && !allowDelete) return baseCols;

    return [...baseCols, actionCol];
  }, [effectiveColumns, allowEditing, allowDelete, onDeleteRow, onEditRow, isNarrow, columnRenderers, inlineEdit, editingRowId, pendingDeleteId, onSaveRow, onCancelEdit]);

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
          suppressClickEdit={!inlineEdit}
          singleClickEdit={inlineEdit}
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