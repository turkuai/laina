import React from 'react';
import './Admin.css';

export default function AdminTabs({ tabs, activeTab, onTabClick, getTabLabel, renderTabIcon }) {
  return (
    <div className="admin-tabs" role="tablist">
      <div className="admin-tab-list">
        {tabs.map(tab => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabClick(tab)}
              className={[
                'admin-tab-button',
                isActive ? 'active' : ''
              ].join(' ').trim()}
              role="tab"
              aria-selected={isActive}
            >
              {renderTabIcon && renderTabIcon(tab)}
              {getTabLabel(tab)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
