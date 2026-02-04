import React from "react";

export default function ServerGridEditDialog({
  formComponent,
  isEditing = false,
  onCancel,
  onSave,
}) {
  const title = isEditing ? "Edit" : "Add";

  const handleSave = () => {
    if (typeof onSave === "function") {
      onSave();
    }
  };

  const handleCancel = () => {
    if (typeof onCancel === "function") {
      onCancel();
    }
  };

  return (
    <div className="product-modal-overlay" onClick={handleCancel}>
      <div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <button
          onClick={handleCancel}
          className="product-modal-close"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="product-modal-title">{title}</h2>

        {formComponent}

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="product-modal-close-btn"
            style={{ backgroundColor: '#111827' }}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="product-modal-print-btn"
            style={{ backgroundColor: '#22c55e' }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
