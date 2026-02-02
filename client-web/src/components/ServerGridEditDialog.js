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
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        {formComponent}
        <div className="modal-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
