import React from 'react'

interface SearchSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({ 
  activeTab, 
  setActiveTab, 
  selectedTime, 
  setSelectedTime, 
  onSearch, 
  isLoading 
}) => {
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
        onClick={onSearch}
        disabled={isLoading}
      >
        {isLoading ? 'กำลังค้นหา...' : 'ค้นหาโรงอาหาร'}
      </button>
    </section>
  )
}

export default SearchSection
