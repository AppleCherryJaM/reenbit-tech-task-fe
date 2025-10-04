import React from 'react'
import "./Header.css";

interface HeaderProps {
	firstName: string;
	lastName: string;
}

function Header({firstName, lastName} : HeaderProps) {
	return (
		<div className="chat-header">
        <div className="chat-avatar">
          {firstName[0]}{lastName[0]}
        </div>
        <div className="chat-info">
          <h3>{firstName} {lastName}</h3>
          <span className="chat-status">Online</span>
        </div>
      </div>
	)
}

export default Header