import React from 'react'
import { FaLocationArrow } from 'react-icons/fa'

interface SearchSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  onSearch: () => void;
  onGetLocation: () => void;
  isLoading: boolean;
  isLocationLoading: boolean;
  hasLocation: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({ 
  activeTab, 
  setActiveTab, 
  startTime, 
  setStartTime, 
  endTime, 
  setEndTime, 
  onSearch, 
  onGetLocation,
  isLoading,
  isLocationLoading,
  hasLocation
}) => {
  // Generate time options every 30 minutes
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  return (
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

      <div className="search-controls-container animate-in">
        {activeTab === 'range' && (
          <div className="time-range-group">
            <div className="time-picker-wrapper">
              <label>ตั้งแต่</label>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {timeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="time-picker-wrapper">
              <label>ถึง</label>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                {timeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}

        <button 
          className={`location-fetch-button ${hasLocation ? 'success' : ''}`}
          onClick={onGetLocation}
          disabled={isLocationLoading}
        >
          <FaLocationArrow className={isLocationLoading ? 'spinning' : ''} />
          {isLocationLoading ? 'กำลังดึงตำแหน่ง...' : hasLocation ? 'ระบุตำแหน่งสำเร็จ' : 'ระบุตำแหน่งเพื่อเริ่มค้นหา'}
        </button>
      </div>
      
      <button 
        className={`search-button ${isLoading ? 'loading' : ''}`}
        onClick={onSearch}
        disabled={isLoading}
      >
        {isLoading ? 'กำลังค้นหา...' : 'ค้นหาโรงอาหาร'}
      </button>
    </section>
  )
}

export default SearchSection
