import React, { useEffect, useMemo, useState } from 'react';

export default function Grid({
  columns,
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
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState(new Set());

  useEffect(() => {
    setRowData(Array.isArray(data) ? data : []);
  }, [data]);

  const effectiveColumns = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) return columns;
    const firstRow = Array.isArray(data) && data.length > 0 ? data[0] : undefined;
    return firstRow ? Object.keys(firstRow) : [];
  }, [columns, data]);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return rowData.slice(start, end);
  }, [rowData, currentPage, pageSize]);

  const totalPages = Math.ceil(rowData.length / pageSize);

  const handleCellChange = (rowIndex, field, value) => {
    const updated = [...rowData];
    updated[currentPage * pageSize + rowIndex] = {
      ...updated[currentPage * pageSize + rowIndex],
      [field]: value,
    };
    setRowData(updated);
    if (typeof onDataChange === 'function') onDataChange(updated);
  };

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

  const toggleRowSelection = (row) => {
    const newSelected = new Set(selectedRows);
    const rowId = row.id || row.email;
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ 
        overflowX: 'auto', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        height: height,
      }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0 }}>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {allowSelection && (
                <th style={{ 
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151',
                  width: '40px',
                }}>
                  <input type="checkbox" onChange={() => {}} />
                </th>
              )}
              {effectiveColumns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    borderRight: '1px solid #e5e7eb',
                  }}
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
              {(allowEditing || allowDelete) && (
                <th style={{ 
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#374151',
                  width: '150px',
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => {
                const isSelected = selectedRows.has(row.id || row.email);
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: isSelected ? '#eff6ff' : 'white',
                    }}
                  >
                    {allowSelection && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(row)}
                        />
                      </td>
                    )}
                    {effectiveColumns.map((col) => (
                      <td
                        key={col}
                        style={{
                          padding: '12px',
                          color: '#111827',
                          borderRight: '1px solid #f3f4f6',
                        }}
                      >
                        {allowEditing ? (
                          <input
                            type="text"
                            value={row[col] || ''}
                            onChange={(e) => handleCellChange(idx, col, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontFamily: 'inherit',
                              fontSize: 'inherit',
                            }}
                          />
                        ) : (
                          row[col] || '-'
                        )}
                      </td>
                    ))}
                    {(allowEditing || allowDelete) && (
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center',
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                      }}>
                        {allowEditing && (
                          <button
                            onClick={() => openEditModal(row)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            aria-label="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 21l3.75-1 11.1-11.1a1.5 1.5 0 000-2.12L14.23 2.16a1.5 1.5 0 00-2.12 0L1 13.27V17h3.73L3 21z" fill="#111827"/>
                            </svg>
                          </button>
                        )}
                        {allowDelete && (
                          <button
                            onClick={() => onDeleteRow?.(row)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            aria-label="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626"/>
                            </svg>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={effectiveColumns.length + (allowSelection ? 2 : 1) + (allowEditing || allowDelete ? 1 : 0)}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          Page {currentPage + 1} of {totalPages || 1} | Total: {rowData.length} rows
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: currentPage === 0 ? '#e5e7eb' : '#2563eb',
              color: currentPage === 0 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 0 ? 'default' : 'pointer',
            }}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            style={{
              padding: '6px 12px',
              backgroundColor: currentPage === totalPages - 1 ? '#e5e7eb' : '#2563eb',
              color: currentPage === totalPages - 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages - 1 ? 'default' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
              Edit Record
            </h3>
            {Object.keys(editValues).map((key) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="text"
                  value={editValues[key]}
                  onChange={(e) => handleEditChange(key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeEditModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}