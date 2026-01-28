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
  typeOptions = [],
  locationOptions = [],
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
    const baseCols = effectiveColumns.map((col) => {
      const fieldName = getColumnField(col);
      const displayName = getColumnDisplay(col);
      
      // Base widths; mobile will just flex to screen
      let width = undefined;
      let minWidth = isMobile ? 80 : 100;

      const colDef = {
        headerName: displayName,
        field: fieldName,
        editable: false, // prevent inline editing; use modal instead
        sortable: true,
        filter: 'agTextColumnFilter',

        // Disable floating filters to remove the per-column search inputs
        floatingFilter: false,
        resizable: true,
        suppressMovable: true, // prevent dragging/reordering columns
        flex: 1,
        width: width,
        minWidth: minWidth,
        wrapText: isMobile,
        autoHeight: isMobile,
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
            {allowDelete && (
              <button 
                onClick={() => onDeleteRow?.(row)} 
                className={`icon-btn danger ${isMobile ? 'mobile' : ''}`}
                aria-label="Delete"
              >
                <svg width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none">
                  <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626"/>
                </svg>
              </button>
            )}
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

    // Only show the Actions column when editing or deleting is enabled
    if (!allowEditing && !allowDelete) return baseCols;

    return [...baseCols, actionCol];
  }, [effectiveColumns, allowEditing, allowDelete, onDeleteRow, isMobile]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: true, // prevent dragging/reordering columns
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
          suppressClickEdit={true} // disable double-click inline edit; editing via modal only
          onCellValueChanged={allowEditing ? handleCellValueChanged : undefined}
          suppressHorizontalScroll={false}
          suppressMovableColumns={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>

      {/* Generic edit popup for rows */}
      {allowEditing && editingRow && (
        <div className="product-modal-overlay" onClick={closeEditModal}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <button
              onClick={closeEditModal}
              className="product-modal-close"
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="product-modal-title">Edit</h2>

            <div className="add-product-form-grid">
              {effectiveColumns
                .map(getColumnField)
                .filter((field) =>
                  // exclude technical fields from generic editor
                  !['id', 'password', 'qr_code', 'created_at', 'updated_at'].includes(field)
                )
                .map((field) => (
                  <div key={field}>
                    <label className="form-label">{formatColumnName(field)}</label>
                    {field === 'role' ? (
                      <select
                        className="form-select"
                        value={editValues[field] ?? ''}
                        onChange={(e) => handleEditChange(field, e.target.value)}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                      </select>
                    ) : field === 'status' ? (
                      <input
                        type="text"
                        className="form-input"
                        value={editValues[field] ?? ''}
                        readOnly
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      />
                    ) : field === 'type_name' && typeOptions.length > 0 ? (
                      <select
                        className="form-select"
                        value={editValues.device_type_id ?? editingRow?.device_type_id ?? ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedType = typeOptions.find(
                            (t) => String(t.id) === String(selectedId)
                          );
                          setEditValues((prev) => ({
                            ...prev,
                            device_type_id: selectedId ? parseInt(selectedId, 10) : null,
                            type_name: selectedType?.type_name || prev.type_name,
                          }));
                        }}
                      >
                        <option value="">Select type...</option>
                        {typeOptions.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.type_name}
                          </option>
                        ))}
                      </select>
                    ) : field === 'location_name' && locationOptions.length > 0 ? (
                      <select
                        className="form-select"
                        value={editValues.location_id ?? editingRow?.location_id ?? ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedLoc = locationOptions.find(
                            (loc) => String(loc.id) === String(selectedId)
                          );
                          setEditValues((prev) => ({
                            ...prev,
                            location_id: selectedId ? parseInt(selectedId, 10) : null,
                            location_name: selectedLoc?.location_name || prev.location_name,
                          }));
                        }}
                      >
                        <option value="">Select location...</option>
                        {locationOptions.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.location_name}
                          </option>
                        ))}
                      </select>
                    ) : field === 'purchase_date' ? (
                      <input
                        type="number"
                        className="form-input"
                        value={editValues[field] ?? ''}
                        onChange={(e) => handleEditChange(field, e.target.value)}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-input"
                        value={editValues[field] ?? ''}
                        onChange={(e) => handleEditChange(field, e.target.value)}
                      />
                    )}
                  </div>
                ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="product-modal-close-btn"
                style={{ backgroundColor: '#ef4444' }}
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="product-modal-print-btn"
                style={{ backgroundColor: '#22c55e' }}
                onClick={saveEdit}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}