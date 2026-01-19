import React, { useEffect, useState, useCallback } from 'react';
import Grid from './Grid';

// Helper function to convert column names to display names
const formatColumnName = (columnName) => {
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
  ...rest               // anything else you want to pass to Grid
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

      const res = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const json = await res.json();

      console.log("Server Response: ", json);
      
      // Handle different response structures
      let rows = [];
      let pages = 1;

      if (Array.isArray(json)) {
        rows = json;
        pages = 1;
      } else if (json.data) {
        rows = json.data;
        pages = json.totalPages || 1;
      } else if (json.users) {
        rows = json.users;
        pages = json.totalPages || 1;
      } else if (json.products) {
        rows = json.products;
        pages = json.totalPages || 1;
      } else if (json.history) {
        rows = json.history;
        pages = json.totalPages || 1;
      }

      setData(rows);
      setTotalPages(pages);
    } catch (err) {
      console.error('ServerGrid fetch error:', err);
      setError(err.message || 'Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }, [path, currentPage]);

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

    // If parent provided a delete handler, let it decide (and usually confirm)
    if (typeof onDeleteRow === 'function') {
      const shouldDelete = await onDeleteRow(row);
      if (shouldDelete === false) {
        return; // parent cancelled deletion
      }
    } else {
      // Default confirmation for grids that don't have a custom handler
      const label =
        row.product_name ||
        (row.first_name && row.last_name && `${row.first_name} ${row.last_name}`) ||
        row.email ||
        row.name ||
        'this item';

      const ok = window.confirm(`Are you sure you want to delete ${label}?`);
      if (!ok) return;
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

      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }

      // Remove from local data so UI updates immediately
      setData(data.filter(item => item.id !== row.id));
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
