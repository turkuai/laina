// ServerGrid.js
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

  const fetchData = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(path, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // add credentials: 'include' here if you need cookies/session
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const json = await res.json();

      console.log("Server Response: ", json);
      
      // Handle different response structures
      const rows = Array.isArray(json) 
        ? json 
        : (json.data || json.users || json.history || []);

      setData(rows);
    } catch (err) {
      console.error('ServerGrid fetch error:', err);
      setError(err.message || 'Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataChange = (updatedData) => {
    setData(updatedData);
    if (typeof onDataChange === 'function') {
      onDataChange(updatedData);
    }
  };

  const handleDelete = (row) => {
    // local behaviour
    if (typeof onDeleteRow === 'function') {
      onDeleteRow(row);
    }
  };

  const handleEdit = (row) => {
    if (typeof onEditRow === 'function') {
      onEditRow(row);
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
    </div>
  );
}