import React from 'react'
import { FaWalking, FaRegClock, FaChevronRight } from 'react-icons/fa'
import { Canteen } from '../types'

interface CanteenCardProps {
  canteen: Canteen;
}

const CanteenCard: React.FC<CanteenCardProps> = ({ canteen }) => {
  return (
    <div 
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
  )
}

export default CanteenCard
