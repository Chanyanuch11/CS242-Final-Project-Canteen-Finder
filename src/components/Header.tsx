import React from 'react'
import { FaUser } from 'react-icons/fa'

interface HeaderProps {
  resetCanteens: () => void;
}

const Header: React.FC<HeaderProps> = ({ resetCanteens }) => {
  return (
    <header className="header">
      <h1 onClick={resetCanteens} style={{ cursor: 'pointer' }}>Canteen Finder</h1>
      <div className="profile-icon-old">
        <FaUser size={20} />
      </div>
    </header>
  )
}

export default Header
