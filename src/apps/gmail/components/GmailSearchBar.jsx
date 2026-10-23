import React from 'react';
import { Menu, Search, X } from 'lucide-react';

export default function GmailSearchBar({ 
  searchQuery, 
  setSearchQuery, 
  onToggleDrawer, 
  account 
}) {
  return (
    <div className="gmail-search-wrapper">
      <div className="gmail-search-bar">
        <button
          className="gmail-icon-btn"
          onClick={onToggleDrawer}
          title="Open menu"
        >
          <Menu size={18} />
        </button>

        <input
          type="text"
          className="gmail-search-input"
          placeholder="Search in mail"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchQuery ? (
          <button
            className="gmail-icon-btn"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            <X size={16} />
          </button>
        ) : (
          <div className="gmail-profile-avatar" title={account.email}>
            <span>{account.initial || 'N'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
