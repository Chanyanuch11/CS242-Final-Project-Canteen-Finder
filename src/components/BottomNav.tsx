import React from 'react'
import { FaHome, FaMapMarkedAlt } from 'react-icons/fa'

interface BottomNavProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeNav, setActiveNav }) => {
  return (
    <nav className="bottom-nav">
      <div 
        className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
        onClick={() => setActiveNav('home')}
      >
        <FaHome size={24} color={activeNav === 'home' ? "var(--primary-pink-dark)" : "currentColor"} />
        <span>หน้าแรก</span>
      </div>
      <div 
        className={`nav-item ${activeNav === 'map' ? 'active' : ''}`}
        onClick={() => setActiveNav('map')}
      >
        <FaMapMarkedAlt size={22} color={activeNav === 'map' ? "var(--primary-pink-dark)" : "currentColor"} />
        <span>แผนที่</span>
      </div>
    </nav>
  )
}

export default BottomNav
