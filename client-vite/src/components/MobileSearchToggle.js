import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const MobileSearchToggle = ({ value, onChange, placeholder = "Search ..." }) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  if (open) {
    return (
      <div className="mobile-search-bar">
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          name="mobile-search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button onClick={() => { setOpen(false); onChange({ target: { value: '' } }); }} aria-label="Close search">
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <button className="mobile-search-toggle" onClick={() => setOpen(true)} aria-label="Open search">
      <Search size={18} />
    </button>
  );
};

export default MobileSearchToggle;