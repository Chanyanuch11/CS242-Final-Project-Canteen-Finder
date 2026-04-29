import React from 'react'
import { FaChevronLeft, FaMapMarkerAlt, FaMapMarkedAlt, FaImage } from 'react-icons/fa'
import { Canteen } from '../types'

interface CanteenDetailProps {
  canteen: Canteen;
  onBack: () => void;
}

const CanteenDetail: React.FC<CanteenDetailProps> = ({ canteen, onBack }) => {
  return (
    <div className="canteen-detail-container animate-in">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <FaChevronLeft size={16} />
        </button>
        <h2>{canteen.name}</h2>
        <div style={{ width: 36 }}></div> {/* Spacer for centering */}
      </div>

      <div className="image-placeholder">
        {canteen.image ? (
          <img src={canteen.image} alt={canteen.name} />
        ) : (
          <div className="placeholder-icon">
            <FaImage size={64} color="#f48fb1" opacity={0.5} />
          </div>
        )}
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <h3>{canteen.name}</h3>
          <div className={`status-chip ${canteen.statusClass}`}>
            {canteen.density}
          </div>
        </div>
        
        <div className="location-info">
          <FaMapMarkerAlt size={14} color="#666" />
          <span>{canteen.locationDesc || 'ข้อมูลสถานที่'}</span>
        </div>

        <div className="info-boxes">
          <div className="info-box">
            <span className="info-label">เวลาเปิด-ปิด</span>
            <span className="info-value">{canteen.hours}</span>
          </div>
          <div className="info-box">
            <span className="info-label">จำนวนที่นั่ง</span>
            <span className="info-value">{canteen.capacity || '100 ที่นั่ง'}</span>
          </div>
        </div>

        <button className="navigate-button">
          <FaMapMarkedAlt size={18} />
          นำทางไปที่นี่ (Google Maps)
        </button>
      </div>
    </div>
  )
}

export default CanteenDetail
