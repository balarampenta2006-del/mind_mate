import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Tabs Component
 * @param {Object} props
 * @param {Array<{id: string, label: string, content: React.ReactNode}>} props.tabs - Array of tab objects
 * @param {string} props.defaultTabId - The ID of the initially active tab
 */
export default function Tabs({ tabs, defaultTabId }) {
  const [activeTab, setActiveTab] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : null));

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="tabs-container">
      <div className="tabs-bar" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content" role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired
  })).isRequired,
  defaultTabId: PropTypes.string
};
