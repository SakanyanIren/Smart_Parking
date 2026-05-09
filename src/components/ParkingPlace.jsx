import { PARKING_STATUS } from '../data/parkingData';
import './ParkingPlace.css';

const ParkingPlace = ({ place, onClick, isFlipped = false }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(place);
    }
  };

  const getStatusColor = () => {
    switch (place.status) {
      case PARKING_STATUS.AVAILABLE:
        return '#16A34A';
      case PARKING_STATUS.OCCUPIED:
        return '#DC2626';
      case PARKING_STATUS.RESERVED:
        return '#CA8A04';
      case PARKING_STATUS.RESERVING:
        return '#EA580C';
      default:
        return '#9ca3af';
    }
  };

  return (
    <g
      className="parking-place"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Parking spot background */}
      <rect
        width="58"
        height="88"
        rx="2"
        fill="#EEF2FF"
        opacity="1"
      />

      {/* Parking spot marking lines */}
      <rect
        x="1"
        y="1"
        width="56"
        height="86"
        rx="2"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* Left boundary line */}
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="88"
        stroke="#94A3B8"
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Right boundary line */}
      <line
        x1="58"
        y1="0"
        x2="58"
        y2="88"
        stroke="#94A3B8"
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Parking number painted on ground */}
      {place.status === PARKING_STATUS.AVAILABLE && (
        <text
          x="29"
          y="50"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#64748B"
          opacity="0.8"
          fontFamily="Arial, sans-serif"
        >
          {place.number}
        </text>
      )}

      {/* Status indicator - car for occupied */}
      {place.status === PARKING_STATUS.OCCUPIED && (
        <g transform={`translate(9, ${isFlipped ? 15 : 25})`}>
          {/* Realistic car from top view */}
          {/* Car body */}
          <rect x="0" y="8" width="40" height="52" rx="4" fill="#0d0b1a" stroke="#07051a" strokeWidth="1"/>

          {/* Car roof/cabin */}
          <rect x="5" y="20" width="30" height="28" rx="2" fill="#251d3a" stroke="#0d0b1a" strokeWidth="1"/>

          {/* Windshield */}
          <rect x="7" y="22" width="26" height="8" rx="1" fill="#1a3a4a" opacity="0.8"/>

          {/* Rear window */}
          <rect x="7" y="42" width="26" height="6" rx="1" fill="#1a3a4a" opacity="0.8"/>

          {/* Side mirrors */}
          <rect x="-1" y="28" width="3" height="6" rx="1" fill="#07051a"/>
          <rect x="38" y="28" width="3" height="6" rx="1" fill="#07051a"/>

          {/* Front wheels */}
          <ellipse cx="8" cy="8" rx="5" ry="7" fill="#07051a"/>
          <ellipse cx="32" cy="8" rx="5" ry="7" fill="#07051a"/>

          {/* Rear wheels */}
          <ellipse cx="8" cy="60" rx="5" ry="7" fill="#07051a"/>
          <ellipse cx="32" cy="60" rx="5" ry="7" fill="#07051a"/>

          {/* Wheel details */}
          <ellipse cx="8" cy="8" rx="3" ry="4" fill="#251d3a"/>
          <ellipse cx="32" cy="8" rx="3" ry="4" fill="#251d3a"/>
          <ellipse cx="8" cy="60" rx="3" ry="4" fill="#251d3a"/>
          <ellipse cx="32" cy="60" rx="3" ry="4" fill="#251d3a"/>

          {/* Front headlights */}
          <rect x="4" y="2" width="6" height="3" rx="1" fill="#ffeb3b" opacity="0.6"/>
          <rect x="30" y="2" width="6" height="3" rx="1" fill="#ffeb3b" opacity="0.6"/>

          {/* Rear lights */}
          <rect x="4" y="63" width="6" height="3" rx="1" fill="#ff1744" opacity="0.6"/>
          <rect x="30" y="63" width="6" height="3" rx="1" fill="#ff1744" opacity="0.6"/>
        </g>
      )}

      {/* Reserving status - spot is being claimed (temporary lock) */}
      {place.status === PARKING_STATUS.RESERVING && (
        <g>
          <text
            x="29"
            y="50"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="#EA580C"
            opacity="0.9"
            fontFamily="Arial, sans-serif"
          >
            ...
          </text>
          <text
            x="29"
            y="68"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#64748B"
            opacity="0.8"
            fontFamily="Arial, sans-serif"
          >
            {place.number}
          </text>
        </g>
      )}

      {/* Reserved status - big R on ground */}
      {place.status === PARKING_STATUS.RESERVED && (
        <g>
          <text
            x="29"
            y="50"
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            fill="#CA8A04"
            opacity="0.9"
            fontFamily="Arial, sans-serif"
          >
            R
          </text>
          <text
            x="29"
            y="68"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#64748B"
            opacity="0.8"
            fontFamily="Arial, sans-serif"
          >
            {place.number}
          </text>
        </g>
      )}

      {/* Status glow effect */}
      <rect
        x="1"
        y="1"
        width="56"
        height="86"
        rx="2"
        fill="none"
        stroke={getStatusColor()}
        strokeWidth="1"
        opacity="0.4"
        className="status-glow"
      />
    </g>
  );
};

export default ParkingPlace;
