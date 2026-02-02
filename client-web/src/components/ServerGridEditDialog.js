import react from "react";

export default function ServerGridEditDialog({ formComponent}) {
  return (
    <div className="product-model-overlay">
      <div>Header</div>
      {formComponent}
      <div>
        Footer
        <button>Save</button>
      </div>
    </div>
  );
}
