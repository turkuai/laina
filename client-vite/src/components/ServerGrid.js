import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Grid from './Grid';
import ServerGridEditDialog from './ServerGridEditDialog';
import ConfirmDialog from './ConfirmDialog';
import { useServerGet } from './serverGet';
import { useServerPost } from './serverPost';
import { useServerDelete } from './serverDelete';
import { useNotification } from './NotificationContext';
import { getApiBase } from '../config';

// Helper function to convert column names to display names
const formatColumnName = (columnName) => {
  if (typeof columnName !== 'string') return '';
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ServerGrid({
  columns,
  columnRenderers,
  path,                 // API endpoint
  allowEditing = false,
  allowDelete = false,
  pageSize = 20,
  showAddButton = true,// Show add button by default (except history tab which doesn't use ServerGrid)
  formComponent : FormComponent,
  transformAddPayload,
  transformEditPayload,
  ...rest               // anything else you want to pass to Grid

}) {
  const query = typeof rest.query === 'string' ? rest.query : '';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showNotification } = useNotification();

  // If search query changes, jump back to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Use hooks for HTTP operations
  const fetchData = useServerGet(path, currentPage, query, setData, setTotalPages, setLoading, setError);
  const performDelete = useServerDelete(path, fetchData, setError);
  const handleAddRow = useServerPost(path, fetchData, setIsAdding, transformAddPayload);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteRequest = (row) => {
    if (!row || !row.id) return;
    setDeleteTarget(row);
  };

  const handleEditRequest = (row) => {
    if (!row || !row.id) {
      console.error('Row has no ID');
      return;
    }
    // Set form data to row's data and open edit dialog
    setFormData({ ...row });
    setEditingRow(row);
    setIsEditing(true);
  };

  const handleCloseEditModal = () => {
    setIsEditing(false);
    setEditingRow(null);
    setFormData({});
  };

  const handleSaveEdit = async () => {
    if (!editingRow || !editingRow.id) {
      console.error('No row to edit');
      return;
    }

    try {
      let updateUrl = `${path.split('?')[0]}/${editingRow.id}`;
      if (!updateUrl.startsWith('/api/')) {
        const cleanPath = updateUrl.startsWith('/') ? updateUrl.slice(1) : updateUrl;
        updateUrl = `/api/${cleanPath}`;
      }

      // Clone formData and drop non-updatable fields; backend will decide what to use
      const payload = { ...formData };

      // Special-case combined "name" field (e.g. Users grid)
      if (typeof payload.name === 'string' && payload.name.trim()) {
        const parts = payload.name.trim().split(/\s+/);
        payload.first_name = parts[0];
        payload.last_name = parts.slice(1).join(' ') || '';
      }
      delete payload.name;
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const finalPayload =
        typeof transformEditPayload === 'function'
          ? transformEditPayload(payload)
          : payload;

      const res = await fetch(getApiBase() + updateUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) {
        let msg = 'Failed to update item';
        try {
          const errorData = await res.json();
          msg = errorData.error || errorData.message || msg;
        } catch (_) {
          // ignore json parse error
        }
        throw new Error(msg);
      }

      // Refresh from server so grid matches DB
      await fetchData();
      handleCloseEditModal();
      showNotification('Item updated successfully!', 'success');
    } catch (err) {
      console.error('Edit error:', err);
      showNotification(err.message || 'Failed to update item', 'error');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAdd = () => {
    setFormData({});
    setIsAdding(true);
  };

  const handleCloseAddModal = () => {
    setIsAdding(false);
    setFormData({});
  };

  // Create column configuration with display names
  const columnConfig = columns.map(col => ({
    field: col,
    displayName: formatColumnName(col)
  }));

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div className="grid-loading-overlay">
          Loading...
        </div>
      )}
      {error && (
        <div className="grid-error-message">
          {error}
        </div>
      )}

      {/* Add Button */}
      {showAddButton && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1rem'
        }}>
          <button
            onClick={handleAdd}
            className="server-grid-add-button"
            type="button"
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      <Grid
        columns={columns}
        columnRenderers={columnRenderers}
        data={data}
        allowEditing={allowEditing}
        allowDelete={allowDelete}
        pageSize={pageSize}
        onEditRow={handleEditRequest}
        onDeleteRow={handleDeleteRequest}
        {...rest}
      />

      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Confirm deletion"
          message={`Are you sure you want to remove this item?`}
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
          cancelLabel="Cancel"
          onCancel={() => {
            if (isDeleting) return;
            setDeleteTarget(null);
          }}
          onConfirm={async () => {
            if (isDeleting || !deleteTarget) return;
            setIsDeleting(true);
            try {
              await performDelete(deleteTarget);
              setDeleteTarget(null);
            } finally {
              setIsDeleting(false);
            }
          }}
          isDestructive={true}
        />
      )}

      {isAdding && FormComponent && (
        <ServerGridEditDialog
          isEditing={false}
          onCancel={handleCloseAddModal}
          onSave={() => handleAddRow(formData)}
          formComponent={
            <FormComponent data={formData} setData={setFormData} />
          } 
        />
      )}

      {isEditing && FormComponent && editingRow && (
        <ServerGridEditDialog
          isEditing={true}
          onCancel={handleCloseEditModal}
          onSave={handleSaveEdit}
          formComponent={
            <FormComponent data={formData} setData={setFormData} />
          } 
        />
      )}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px',
          alignItems: 'center'
        }}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
