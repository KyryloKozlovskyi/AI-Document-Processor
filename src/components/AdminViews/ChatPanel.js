import React, { useState } from 'react';
import './ChatPanel.css'; // Import panel-specific CSS file.

const ChatPanel = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Active status.

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    return (
        <div className="chat-panel-container">
            {/* Change className for CSS styling. */}
            <button className={`toggle-button ${isPanelOpen ? 'open' : ''}`} onClick={togglePanel}> 
                {isPanelOpen ? 'Close Panel' : 'Open Panel'}
            </button>
            <div className={`side-panel ${isPanelOpen ? 'open' : ''}`}>
                <h2>Chatbot</h2>
                <p>What can I help you with?</p>
            </div>
        </div>
    );
};

export default ChatPanel;