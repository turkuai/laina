import React, { useState, useEffect, useRef } from 'react';
import './Admin.css';

/**
 * ProductModals component - Desktop modals for product borrow/return actions
 * @param {Object} scannedProduct - Scanned product object with name, borrower, borrowDate, returnDate
 * @param {string} productStatus - Product status ('borrowed' or 'available')
 * @param {Function} onClose - Handler to close the modal
 * @param {Function} onReturn - Handler for return button click
 * @param {Function} onBorrow - Handler for borrow button click, receives borrowData object
 * @param {Function} getCurrentDate - Function to get current date formatted
 */
const ProductModals = ({ scannedProduct, productStatus, onClose, onReturn, onBorrow, getCurrentDate }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch users when modal opens
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          const usersList = data.data || data || [];
          setUsers(usersList);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    if (productStatus === 'available') {
      fetchUsers();
    }
  }, [productStatus]);

  useEffect(() => {
    // Filter users based on search query - only match by first name
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => {
      const firstName = (user.first_name || '').toLowerCase();
      // Only check if first name starts with the query
      return firstName.startsWith(query);
    });
    setFilteredUsers(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchQuery, users]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(`${user.first_name} ${user.last_name}`);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedUser(null);
  };

  if (!scannedProduct) return null;

  const handleBorrowClick = () => {
    const returnDate = document.getElementById('desktop-return-date').value;
    if (!selectedUser || !returnDate) {
      alert('Please select a user and fill in return date!');
      return;
    }
    onBorrow({
      selectedUser: selectedUser, // Pass full user object with id
      borrowerName: `${selectedUser.first_name} ${selectedUser.last_name}`,
      borrowerEmail: selectedUser.email,
      returnDate,
      borrowDate: getCurrentDate()
    });
  };

  return (
    <>
      {productStatus === 'borrowed' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button onClick={onClose} className="modal-close">×</button>
            <h2 className="modal-title">{scannedProduct.name}</h2>
            <div className="modal-status"><h3 className="status-borrowed">Borrowed</h3></div>
            <div className="modal-content">
              <p className="info-label">Borrowed by:</p>
              <p className="info-value">{scannedProduct.borrower}</p>
              <p className="info-value">{scannedProduct.borrowDate}</p>
              <p className="info-label">Return deadline:</p>
              <p className="info-value">{scannedProduct.returnDate}</p>
              <p className="info-label">Return date:</p>
              <div className="return-date-display">{getCurrentDate()}</div>
            </div>
            <button onClick={onReturn} className="modal-action-btn">Return</button>
          </div>
        </div>
      )}

      {productStatus === 'available' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button onClick={onClose} className="modal-close">×</button>
            <h2 className="modal-title">{scannedProduct.name}</h2>
            <div className="modal-status"><h3 className="status-available">Available</h3></div>
            <div className="modal-content">
              <div className="info-input-wrapper" style={{ position: 'relative' }}>
                <label className="info-label">Borrowing to:</label>
                <input 
                  type="text" 
                  placeholder="Type to search user..." 
                  className="info-input" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(filteredUsers.length > 0)}
                  ref={inputRef}
                />
                {showDropdown && filteredUsers.length > 0 && (
                  <div 
                    ref={dropdownRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      marginTop: '4px'
                    }}
                  >
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: 500, color: '#1f2937' }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {user.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="info-input-wrapper">
                <label className="info-label">Email:</label>
                <input 
                  type="email" 
                  className="info-input" 
                  value={selectedUser?.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div className="info-input-wrapper">
                <label className="info-label">Return deadline:</label>
                <input
                  type="date"
                  className="info-input"
                  id="desktop-return-date"
                />
              </div>
            </div>
            <button
              onClick={handleBorrowClick}
              className="modal-action-btn"
            >
              Borrow
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductModals;
