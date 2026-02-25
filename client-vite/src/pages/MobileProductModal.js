import React, { useState, useEffect, useRef } from 'react';
import './Admin.css';
import { useNotification } from '../components/NotificationContext';
import { getApiBase } from '../config';

/**
 * MobileProductModal component - Mobile-only modal popup for scanned QR code products
 * @param {Object} scannedProduct - Scanned product object with name, borrower, borrowDate, returnDate
 * @param {string} productStatus - Product status ('borrowed' or 'available')
 * @param {Function} onClose - Handler to close the modal
 * @param {Function} onReturn - Handler for return button click
 * @param {Function} onBorrow - Handler for borrow button click, receives borrowData object
 * @param {Function} getCurrentDate - Function to get current date formatted
 */
const MobileProductModal = ({ scannedProduct, productStatus, onClose, onReturn, onBorrow, getCurrentDate }) => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch users when modal opens
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/users`, {
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
    if (!selectedUser || !returnDate) {
      showNotification('Please select a user and fill in return date!', 'error');
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
    <div className="mobile-product-modal-overlay" onClick={onClose}>
      <div className="mobile-product-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="mobile-product-modal-close" aria-label="Close">
          ×
        </button>
        
        <h2 className="mobile-product-modal-title">{scannedProduct.name}</h2>
        
        <div className="mobile-product-modal-status">
          {productStatus === 'borrowed' ? 'Lainassa' : 'Vapaa'}
        </div>

        {productStatus === 'borrowed' ? (
          <>
            <div className="mobile-product-modal-info-section">
              <p className="mobile-product-modal-label">Lainaataan:</p>
              <p className="mobile-product-modal-value">Nimi: {scannedProduct.borrower}</p>
              <p className="mobile-product-modal-value">Pvm: {scannedProduct.borrowDate}</p>
            </div>
            <div className="mobile-product-modal-info-section">
              <p className="mobile-product-modal-label">Viimeinen palautuspäivä:</p>
              <p className="mobile-product-modal-value">{scannedProduct.returnDate}</p>
            </div>
            <button
              onClick={onReturn}
              className="mobile-product-modal-action-button"
            >
              Palauta
            </button>
          </>
        ) : (
          <>
            <div className="mobile-product-modal-info-section">
              <p className="mobile-product-modal-label">Lainaataan:</p>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type to search user..."
                  className="mobile-product-modal-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(filteredUsers.length > 0)}
                  ref={inputRef}
                />
                {showDropdown && filteredUsers.length > 0 && (
                  <div 
                    ref={dropdownRef}
                    className="mobile-product-modal-dropdown"
                  >
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="mobile-product-modal-dropdown-item"
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
            </div>
            <div className="mobile-product-modal-info-section">
              <p className="mobile-product-modal-label">Email:</p>
              <input
                type="email"
                className="mobile-product-modal-input"
                value={selectedUser?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <div className="mobile-product-modal-info-section">
              <p className="mobile-product-modal-label">Viimeinen palautuspäivä:</p>
              <input
                type="date"
                className="mobile-product-modal-input"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleBorrowClick}
              className="mobile-product-modal-action-button"
            >
              Lainaa
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileProductModal;
