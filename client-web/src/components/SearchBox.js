import React from 'react';
import '../pages/Admin.css'; // Reusing Admin.css for user-search styles

/**
 * Reusable SearchBox component
 * @param {string} value - Current search query value
 * @param {function} onChange - Handler for input changes
 * @param {string} placeholder - Placeholder text (default: "Search ...")
 */
const SearchBox = ({ value, onChange, placeholder = "Search ..." }) => {
  return (
    <div className="user-search">
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBox;
