import React, { useState, useEffect } from 'react'
import { FaWalking, FaRegClock, FaChevronRight, FaUser, FaHome, FaMapMarkedAlt, FaSearch } from 'react-icons/fa'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('current')
  const [activeNav, setActiveNav] = useState('home')
  const [isLoading, setIsLoading] = useState(false)
  const [displayCanteens, setDisplayCanteens] = useState([])
  const [selectedTime, setSelectedTime] = useState('12:00')

  const allCanteens = [
    { id: 1, name: 'โรงอาหารA', hours: '07:00 - 18:00', distance: '350m', density: 'โล่ง', statusClass: 'status-low', open: true },
    { id: 2, name: 'โรงอาหารB', hours: '08:00 - 19:00', distance: '200m', density: 'ปานกลาง', statusClass: 'status-med', open: true },
    { id: 3, name: 'โรงอาหารC', hours: '06:00 - 19:00', distance: '480m', density: 'ปานกลาง', statusClass: 'status-med', open: true },
    { id: 4, name: 'โรงอาหารD', hours: '07:00 - 14:00', distance: '600m', density: 'หนาแน่น', statusClass: 'status-high', open: false },
    { id: 5, name: 'โรงอาหารE', hours: '09:00 - 16:00', distance: '750m', density: 'โล่ง', statusClass: 'status-low', open: true },
  ]

  useEffect(() => {
    setDisplayCanteens(allCanteens)
  }, [])

  const handleSearch = () => {
    setIsLoading(true)
    setTimeout(() => {
      // Logic: Filter canteens based on active tab
      if (activeTab === 'current') {
        // Mock filtering: show only open ones or recommended
        setDisplayCanteens(allCanteens.filter(c => c.open))
      } else {
        // Show all or different set for "range"
        setDisplayCanteens(allCanteens)
      }
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 onClick={() => setDisplayCanteens(allCanteens)} style={{ cursor: 'pointer' }}>Canteen Finder</h1>
        <div className="profile-icon-old">
          <FaUser size={20} />
        </div>
      </header>

      <section className="search-section">
        <h2>ระบุเงื่อนไขการค้นหา</h2>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            อิงเวลาปัจจุบัน
          </button>
          <button 
            className={`tab ${activeTab === 'range' ? 'active' : ''}`}
            onClick={() => setActiveTab('range')}
          >
            กำหนดช่วงเวลา
          </button>
        </div>

        {activeTab === 'range' && (
          <div className="time-range-inputs animate-in">
            <div className="time-input-group solitary">
              <input 
                type="time" 
                value={selectedTime} 
                onChange={(e) => setSelectedTime(e.target.value)} 
              />
            </div>
          </div>
        )}
        <button 
          className={`search-button ${isLoading ? 'loading' : ''}`}
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? 'กำลังค้นหา...' : 'ค้นหาโรงอาหาร'}
        </button>
      </section>

      {activeNav === 'home' ? (
        <section className="results-section">
          <div className="results-header">
            <h2>โรงอาหารแนะนำทั้งหมด</h2>
            <span className="count-badge">พบ {displayCanteens.length} แห่ง</span>
          </div>
          <div className="canteen-list animate-in">
            {displayCanteens.map(canteen => (
              <div 
                key={canteen.id} 
                className="canteen-card"
                onClick={() => alert(`คุณกำลังเลือก: ${canteen.name}`)}
              >
                <div className="canteen-info">
                  <span className="canteen-name">{canteen.name}</span>
                  <div className="canteen-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaRegClock size={14} />
                      {canteen.hours}
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaWalking size={14} />
                      {canteen.distance}
                    </div>
                  </div>
                </div>
                <div className="chips">
                  <div className={`status-chip ${canteen.statusClass}`}>
                    {canteen.density}
                  </div>
                  <div className="arrow-icon">
                    <FaChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="map-view animate-in">
          <div className="map-placeholder">
            <FaMapMarkedAlt size={48} color="#ccc" />
            <p>หน้าแผนที่กำลังอยู่ระหว่างการพัฒนา</p>
            <div className="map-hint">คุณอยู่ใกล้โรงอาหาร B มากที่สุด (200m)</div>
          </div>
        </section>
      )}

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
    </div>
  )
}

export default App
