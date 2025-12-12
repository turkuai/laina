import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import './Grid.css'; // optional styling

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

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
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setRowData(Array.isArray(data) ? data : []);
  }, [data]);

  const effectiveColumns = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) return columns;
    const firstRow = Array.isArray(data) && data.length > 0 ? data[0] : undefined;
    return firstRow ? Object.keys(firstRow) : [];
  }, [columns, data]);

  const columnDefs = useMemo(() => {
    const baseCols = effectiveColumns.map((fieldName) => {
      // Adjust column widths for mobile
      let width = undefined;
      let minWidth = 100;

      if (isMobile) {
        // Set specific widths for mobile
        if (fieldName === 'name') {
          minWidth = 120;
          width = 140;
        } else if (fieldName === 'email') {
          minWidth = 150;
          width = 180;
        } else if (fieldName === 'role') {
          minWidth = 100;
          width = 110;
        } else if (fieldName === 'description') {
          minWidth = 150;
          width = 180;
        } else if (fieldName.toLowerCase().includes('qty') || fieldName === 'available' || fieldName === 'onLoan') {
          minWidth = 80;
          width = 90;
        }
      }

      return {
        headerName: fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1'),
        field: fieldName,
        editable: allowEditing,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: !isMobile,
        resizable: true,
        flex: isMobile ? undefined : 1,
        width: width,
        minWidth: minWidth,
        wrapText: isMobile,
        autoHeight: isMobile,
        cellRenderer: columnRenderers ? columnRenderers[fieldName] : undefined
      };
    });

    const actionCol = {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params) => {
        const row = params.data;
        return (
          <div className={`grid-actions ${isMobile ? 'mobile' : ''}`}>
            {allowEditing && (
              <button
                onClick={() => openEditModal(row)}
                className={`icon-btn ${isMobile ? 'mobile' : ''}`}
                aria-label="Edit"
              >
                <svg width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none">
                  <path d="M3 21l3.75-1 11.1-11.1a1.5 1.5 0 000-2.12L14.23 2.16a1.5 1.5 0 00-2.12 0L1 13.27V17h3.73L3 21z" fill="#111827" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onDeleteRow?.(row)}
              className={`icon-btn danger ${isMobile ? 'mobile' : ''}`}
              aria-label="Delete"
            >
              <svg width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none">
                <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626" />
              </svg>
            </button>
          </div>
        );
      },
      sortable: false,
      filter: false,
      width: isMobile ? 90 : 120,
      minWidth: isMobile ? 90 : 120,
      maxWidth: isMobile ? 90 : 150,
      pinned: isMobile ? 'right' : undefined,
      lockPosition: true,
      suppressMovable: true,
    };

    return [...baseCols, actionCol];
  }, [effectiveColumns, allowEditing, onDeleteRow, isMobile]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const getRowId = useCallback(
    (params) => params.data.id || params.data.email || JSON.stringify(params.data),
    []
  );

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

  const openEditModal = (row) => {
    setEditingRow(row);
    setEditValues({ ...row });
  };

  const closeEditModal = () => {
    setEditingRow(null);
    setEditValues({});
  };

  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = () => {
    const updated = rowData.map((r) =>
      r.id === editingRow.id || r.email === editingRow.email ? { ...r, ...editValues } : r
    );
    setRowData(updated);
    if (typeof onDataChange === 'function') onDataChange(updated);
    if (typeof onEditRow === 'function') onEditRow(editValues);
    closeEditModal();
  };

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
          suppressClickEdit={!allowEditing}
          onCellValueChanged={allowEditing ? handleCellValueChanged : undefined}
          suppressHorizontalScroll={false}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>
    </>
  );
}
