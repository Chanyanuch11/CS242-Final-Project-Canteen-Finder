import { FaWalking, FaRegClock, FaChevronRight, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'
import { Canteen } from '../types'

interface CanteenCardProps {
  canteen: Canteen;
  onClick: (canteen: Canteen) => void;
}

const CanteenCard: React.FC<CanteenCardProps> = ({ canteen, onClick }) => {
  return (
    <div
      className="canteen-card"
      onClick={() => onClick(canteen)}
    >
      <div className="canteen-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {canteen.rank && canteen.rank < 99 && (
            <div className="rank-badge">อันดับที่ {canteen.rank}</div>
          )}
          <span className="canteen-name">{canteen.name}</span>
        </div>
        {canteen.trend && (
          <div className={`trend-info ${canteen.trend === 'กำลังเพิ่มขึ้น' ? 'trend-up' : canteen.trend === 'กำลังลดลง' ? 'trend-down' : 'trend-stable'}`}>
            {canteen.trend === 'กำลังเพิ่มขึ้น' ? <FaArrowUp size={10} /> : canteen.trend === 'กำลังลดลง' ? <FaArrowDown size={10} /> : <FaMinus size={10} />}
            <span>{canteen.trend}</span>
          </div>
        )}
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
