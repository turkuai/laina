import React from "react";

export default function ServerGridEditDialog({ formComponent, onSave }) {
  return (
    <div className="product-modal-overlay">
      <div>Header</div>
      {formComponent}
      <div>
        Footer
        <button
          onClick={() => {
            onSave();
            // close the dialog
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
