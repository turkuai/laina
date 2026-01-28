import React, { useEffect, useState, useCallback } from 'react';
import Grid from './Grid';
import { useNotification } from './NotificationContext';

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
  onDataChange,
  onEditRow,
  onDeleteRow,
  onAdd,                // Callback for add button click
  showAddButton = true, // Show add button by default (except history tab which doesn't use ServerGrid)
  ...rest               // anything else you want to pass to Grid
}) {
  const query = typeof rest.query === 'string' ? rest.query : '';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showNotification } = useNotification();

  // If search query changes, jump back to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const fetchData = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);

    try {
      // Build the full URL with page parameter
      let fullUrl = path;
      // Ensure /api/ prefix if not present; avoid accidental double slashes
      if (!fullUrl.startsWith('/api/')) {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = fullUrl.startsWith('/') ? fullUrl.slice(1) : fullUrl;
        fullUrl = `/api/${cleanPath}`;
      }
      
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}page=${currentPage}`;

      // Optional server-side search
      const trimmedQuery = query.trim();
      if (trimmedQuery !== '') {
        fullUrl = `${fullUrl}&search=${encodeURIComponent(trimmedQuery)}`;
      }

      const res = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parse response safely (handle HTML error pages)
      const contentType = res.headers.get('content-type') || '';
      let payload;

      if (contentType.includes('application/json')) {
        try {
          payload = await res.json();
        } catch (parseErr) {
          const text = await res.text().catch(() => '');
          const message = text
            ? `Invalid JSON response: ${text.slice(0, 200)}`
            : 'Invalid JSON response from server.';
          throw new Error(message);
        }
      } else {
        const text = await res.text().catch(() => '');
        const message = text
          ? `Unexpected response (status ${res.status}): ${text.slice(0, 200)}`
          : `Unexpected non-JSON response (status ${res.status}).`;
        throw new Error(message);
      }

      if (!res.ok) {
        throw new Error(
          payload?.error ||
          payload?.message ||
          `Request failed with status ${res.status}`
        );
      }
      
      // Handle different response structures
      let rows = [];
      let pages = 1;

      if (Array.isArray(payload)) {
        rows = payload;
        pages = 1;
      } else if (payload.data) {
        rows = payload.data;
        pages = payload.totalPages || 1;
      } else if (payload.users) {
        rows = payload.users;
        pages = payload.totalPages || 1;
      } else if (payload.products) {
        rows = payload.products;
        pages = payload.totalPages || 1;
      } else if (payload.history) {
        rows = payload.history;
        pages = payload.totalPages || 1;
      }

      setData(rows);
      setTotalPages(pages);
    } catch (err) {
      console.error('ServerGrid fetch error:', err);
      setError(err.message || 'Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }, [path, currentPage, query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataChange = (updatedData) => {
    setData(updatedData);
    if (typeof onDataChange === 'function') {
      onDataChange(updatedData);
    }
  };

  const handleDelete = async (row) => {
    if (!row.id) {
      console.error('Row has no ID');
      return;
    }

    // Check with parent callback first - if it returns false, don't delete
    if (typeof onDeleteRow === 'function') {
      const shouldDelete = await onDeleteRow(row);
      if (shouldDelete === false) {
        return; // Parent prevented deletion
      }
    }

    try {
      let deleteUrl = `${path.split('?')[0]}/${row.id}`;
      // Ensure /api/ prefix if not present; avoid accidental double slashes
      if (!deleteUrl.startsWith('/api/')) {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = deleteUrl.startsWith('/') ? deleteUrl.slice(1) : deleteUrl;
        deleteUrl = `/api/${cleanPath}`;
      }

      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Try to parse response as JSON, but handle HTML/plain text errors
      let responseData = {};
      const contentType = res.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          responseData = await res.json();
        } catch (e) {
          // If JSON parse fails, use empty object
        }
      }

      if (!res.ok) {
        // Check for database constraint errors
        const errorMessage = responseData.error || responseData.message || `Delete failed with status ${res.status}`;
        
        // Check if it's a foreign key constraint error
        const errorStr = String(errorMessage).toLowerCase();
        if (errorStr.includes('foreign key constraint') || 
            errorStr.includes('borrow_history') || 
            errorStr.includes('cannot delete') ||
            errorStr.includes('1451')) {
          showNotification(
            'Cannot delete user because they have borrowing history. Please return all borrowed items first.',
            'error'
          );
          throw new Error('Cannot delete user because they have borrowing history. Please return all borrowed items first.');
        }
        
        showNotification(errorMessage, 'error');
        throw new Error(errorMessage);
      }

      // Refresh data after successful deletion
      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete item: ${err.message}`);
    }
  };

  const handleEdit = async (row) => {
    if (!row.id) {
      console.error('Row has no ID');
      return;
    }

    try {
      let updateUrl = `${path.split('?')[0]}/${row.id}`;
      if (!updateUrl.startsWith('/api/')) {
        const cleanPath = updateUrl.startsWith('/') ? updateUrl.slice(1) : updateUrl;
        updateUrl = `/api/${cleanPath}`;
      }

      // Clone row and drop non-updatable fields; backend will decide what to use
      const payload = { ...row };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const res = await fetch(updateUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Update failed with status ${res.status}`);
      }

      // Refresh from server so grid matches DB
      await fetchData();

      if (typeof onEditRow === 'function') {
        onEditRow(row);
      }
    } catch (err) {
      console.error('Edit error:', err);
      setError(`Failed to update item: ${err.message}`);
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
    if (typeof onAdd === 'function') {
      onAdd();
    } else {
      // Default behavior: refresh data or show alert
      console.log('Add button clicked - no handler provided');
    }
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
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>+</span>
            <span>Add</span>
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
        onDataChange={handleDataChange}
        onEditRow={handleEdit}
        onDeleteRow={handleDelete}
        {...rest}
      />

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
