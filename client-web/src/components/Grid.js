import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import './Grid.css'; // optional styling

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Grid({
  columns,
  data,
  allowEditing = false,
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

  useEffect(() => {
    setRowData(Array.isArray(data) ? data : []);
  }, [data]);

  const effectiveColumns = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) return columns;
    const firstRow = Array.isArray(data) && data.length > 0 ? data[0] : undefined;
    return firstRow ? Object.keys(firstRow) : [];
  }, [columns, data]);

  const columnDefs = useMemo(() => {
    const baseCols = effectiveColumns.map((fieldName) => ({
      headerName: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
      field: fieldName,
      editable: allowEditing,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      resizable: true,
      flex: 1,
    }));

    const actionCol = {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params) => {
        const row = params.data;
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {allowEditing && (
              <button onClick={() => openEditModal(row)} className="icon-btn" aria-label="Edit">
                {/* pencil icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21l3.75-1 11.1-11.1a1.5 1.5 0 000-2.12L14.23 2.16a1.5 1.5 0 00-2.12 0L1 13.27V17h3.73L3 21z" fill="#111827"/>
                </svg>
              </button>
            )}
            <button onClick={() => onDeleteRow?.(row)} className="icon-btn danger" aria-label="Delete">
              {/* trash icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626"/>
              </svg>
            </button>
          </div>
        );
      },
      sortable: false,
      filter: false,
      width: 150,
    };

    return [...baseCols, actionCol];
  }, [effectiveColumns, allowEditing, onDeleteRow]);

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
      r.id === editingRow.id ? { ...r, ...editValues } : r
    );
    setRowData(updated);
    if (typeof onDataChange === 'function') onDataChange(updated);
    if (typeof onEditRow === 'function') onEditRow(editValues);
    closeEditModal();
  };

  return (
    <div className="ag-theme-alpine" style={{ width: '100%', height }}>
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
        noRowsOverlayComponent={() => <div>No data available</div>}
      />

      {editingRow && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Record</h3>
            {Object.keys(editValues).map((key) => (
              <div key={key} className="form-row">
                <label>{key}</label>
                <input
                  type="text"
                  value={editValues[key]}
                  onChange={(e) => handleEditChange(key, e.target.value)}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-save" onClick={saveEdit}>Save</button>
              <button className="btn-cancel" onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}