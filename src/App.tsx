import React, { useState, useEffect } from 'react'
import { FaMapMarkedAlt } from 'react-icons/fa'
import './index.css'

// Import Components
import Header from './components/Header'
import SearchSection from './components/SearchSection'
import CanteenCard from './components/CanteenCard'
import BottomNav from './components/BottomNav'
import CanteenDetail from './components/CanteenDetail'

// Import Types
import { Canteen } from './types'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('current')
  const [activeNav, setActiveNav] = useState<string>('home')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [displayCanteens, setDisplayCanteens] = useState<Canteen[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('12:00')
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null)

  const allCanteens: Canteen[] = [
    { id: 1, name: 'โรงอาหารA', hours: '07:00 - 18:00', distance: '350m', density: 'โล่ง', statusClass: 'status-low', open: true },
    { id: 2, name: 'โรงอาหารB', hours: '08:00 - 19:00', distance: '200m', density: 'ปานกลาง', statusClass: 'status-med', open: true },
    { id: 3, name: 'โรงอาหารC', hours: '06:00 - 19:00', distance: '480m', density: 'ปานกลาง', statusClass: 'status-med', open: true },
    { id: 4, name: 'โรงอาหารD', hours: '07:00 - 14:00', distance: '600m', density: 'หนาแน่น', statusClass: 'status-high', open: false },
    { id: 5, name: 'โรงอาหารE', hours: '09:00 - 16:00', distance: '750m', density: 'โล่ง', statusClass: 'status-low', open: true },
  ]

  useEffect(() => {
    setDisplayCanteens(allCanteens)
  }, [])

  const handleSearch = (): void => {
    setIsLoading(true)
    setTimeout(() => {
      if (activeTab === 'current') {
        setDisplayCanteens(allCanteens.filter(c => c.open))
      } else {
        setDisplayCanteens(allCanteens)
      }
      setIsLoading(false)
    }, 600)
  }

  const resetCanteens = (): void => setDisplayCanteens(allCanteens)

  if (selectedCanteen) {
    return (
      <div className="app-container" style={{ paddingBottom: '20px' }}>
        <CanteenDetail 
          canteen={selectedCanteen} 
          onBack={() => setSelectedCanteen(null)} 
        />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header resetCanteens={resetCanteens} />

      <SearchSection 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {activeNav === 'home' ? (
        <section className="results-section">
          <div className="results-header">
            <h2>โรงอาหารแนะนำทั้งหมด</h2>
            <span className="count-badge">พบ {displayCanteens.length} แห่ง</span>
          </div>
          <div className="canteen-list animate-in">
            {displayCanteens.map(canteen => (
              <CanteenCard 
                key={canteen.id} 
                canteen={canteen} 
                onClick={setSelectedCanteen}
              />
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

      <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />
    </div>
  )
}

export default App
