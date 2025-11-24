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
      // Construct URL with page parameter
      const url = new URL(path, window.location.origin);
      if (!path.includes('?')) {
        url.searchParams.set('page', currentPage);
      } else {
        // If path already has query params, append page
        const separator = path.includes('?') ? '&' : '?';
        const fullPath = path + separator + `page=${currentPage}`;
        return fetchData(); // Refetch with constructed URL
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
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
      if (Array.isArray(json)) {
        rows = json;
        setTotalPages(1);
      } else if (json.data) {
        rows = json.data;
        setTotalPages(json.totalPages || 1);
      } else if (json.users) {
        rows = json.users;
        setTotalPages(json.totalPages || 1);
      } else if (json.products) {
        rows = json.products;
        setTotalPages(json.totalPages || 1);
      } else if (json.history) {
        rows = json.history;
        setTotalPages(json.totalPages || 1);
      }

      setData(rows);
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

    try {
      const res = await fetch(`${path}/${row.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }

      // Remove from local data
      setData(data.filter(item => item.id !== row.id));
      
      if (typeof onDeleteRow === 'function') {
        onDeleteRow(row);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete item: ${err.message}`);
    }
  };

  const handleEdit = (row) => {
    if (typeof onEditRow === 'function') {
      onEditRow(row);
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
        columns={columnConfig}
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