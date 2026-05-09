import { useState, useEffect } from 'react';
import ParkingPlace from './ParkingPlace';
import './Section.css';

const Section = ({ section, onPlaceClick, navigatingTo, isAnimating }) => {
  const placeWidth = 60;
  const placeHeight = 90;
  const roadWidth = 120;
  const [carPosition, setCarPosition] = useState(0); // 0 to 1 along the path

  // Organize places into rows
  const rows = [];
  for (let i = 0; i < section.rows; i++) {
    const startIdx = i * section.placesPerRow;
    const endIdx = startIdx + section.placesPerRow;
    rows.push(section.places.slice(startIdx, endIdx));
  }

  const svgWidth = section.placesPerRow * placeWidth + 100;
  const svgHeight = section.rows * placeHeight + roadWidth + 130;

  // Entrance point
  const entranceX = 20;
  const entranceY = svgHeight / 2;

  // Find target place if navigating to a spot in this section
  const isNavigatingHere = navigatingTo && section.places.some(p => p.id === navigatingTo.placeId);
  const targetPlace = isNavigatingHere ? section.places.find(p => p.id === navigatingTo.placeId) : null;

  // Calculate target position if we have a target place
  let targetX = 0;
  let targetY = 0;
  if (targetPlace) {
    const placeIndex = section.places.indexOf(targetPlace);
    const rowIndex = Math.floor(placeIndex / section.placesPerRow);
    const colIndex = placeIndex % section.placesPerRow;
    const isTopHalf = rowIndex < section.rows / 2;

    targetY = isTopHalf
      ? 30 + rowIndex * placeHeight + placeHeight / 2
      : svgHeight - 30 - (section.rows - rowIndex) * placeHeight + placeHeight / 2;
    targetX = 50 + colIndex * placeWidth + placeWidth / 2;
  }

  // Animate car movement
  useEffect(() => {
    if (isAnimating && isNavigatingHere) {
      setCarPosition(0);
      const duration = 5000; // 5 seconds
      const fps = 60;
      const totalFrames = (duration / 1000) * fps;
      let frame = 0;

      const interval = setInterval(() => {
        frame++;
        setCarPosition(frame / totalFrames);

        if (frame >= totalFrames) {
          clearInterval(interval);
        }
      }, 1000 / fps);

      return () => clearInterval(interval);
    } else {
      setCarPosition(0);
    }
  }, [isAnimating, isNavigatingHere]);

  // Calculate current car position along the path
  const getCarPosition = (progress) => {
    if (!targetPlace) return { x: 0, y: 0 };

    // Path: entrance -> along road to column -> turn into parking row -> to spot
    const roadX = 50 + (section.places.indexOf(targetPlace) % section.placesPerRow) * placeWidth + placeWidth / 2;

    if (progress < 0.6) {
      // Moving along the road
      const roadProgress = progress / 0.6;
      return {
        x: entranceX + (roadX - entranceX) * roadProgress,
        y: entranceY
      };
    } else {
      // Turning into parking spot
      const turnProgress = (progress - 0.6) / 0.4;
      return {
        x: roadX,
        y: entranceY + (targetY - entranceY) * turnProgress
      };
    }
  };

  const currentCarPos = isAnimating && isNavigatingHere ? getCarPosition(carPosition) : null;

  return (
    <div className="section">
      <div className="section-header">
        <h3>{section.name}</h3>
        <div className="section-stats">
          <span className="stat available">
            {section.places.filter(p => p.status === 'available').length} ԱԶԱՏ
          </span>
          <span className="stat occupied">
            {section.places.filter(p => p.status === 'occupied').length} ԶԲԱՂՎԱԾ
          </span>
          <span className="stat reserved">
            {section.places.filter(p => p.status === 'reserved').length} ԱՄՐԱԳՐՎԱԾ
          </span>
        </div>
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        className="section-svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        <defs>
          {/* Asphalt texture pattern */}
          <pattern id="asphalt" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="#E2E8F0"/>
            <circle cx="5" cy="5" r="1" fill="#CBD5E1" opacity="0.5"/>
            <circle cx="25" cy="15" r="0.5" fill="#94A3B8" opacity="0.3"/>
            <circle cx="40" cy="30" r="1.5" fill="#CBD5E1" opacity="0.3"/>
            <circle cx="15" cy="40" r="0.8" fill="#94A3B8" opacity="0.3"/>
            <circle cx="35" cy="45" r="1" fill="#CBD5E1" opacity="0.25"/>
          </pattern>

          {/* Road texture */}
          <pattern id="road" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="#CBD5E1"/>
            <circle cx="10" cy="10" r="1.2" fill="#94A3B8" opacity="0.4"/>
            <circle cx="35" cy="25" r="0.8" fill="#B0BAC8" opacity="0.3"/>
            <circle cx="50" cy="45" r="1" fill="#94A3B8" opacity="0.35"/>
          </pattern>
        </defs>

        {/* Background asphalt */}
        <rect
          x="0"
          y="0"
          width={svgWidth}
          height={svgHeight}
          fill="url(#asphalt)"
        />

        {/* Main driving road in the middle */}
        <rect
          x="0"
          y={svgHeight / 2 - roadWidth / 2}
          width={svgWidth}
          height={roadWidth}
          fill="url(#road)"
        />

        {/* Road center dashed line */}
        <line
          x1="0"
          y1={svgHeight / 2}
          x2={svgWidth}
          y2={svgHeight / 2}
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="20,15"
          opacity="0.8"
        />

        {/* Road edge lines */}
        <line
          x1="0"
          y1={svgHeight / 2 - roadWidth / 2 + 5}
          x2={svgWidth}
          y2={svgHeight / 2 - roadWidth / 2 + 5}
          stroke="#64748B"
          strokeWidth="2"
          opacity="0.5"
        />
        <line
          x1="0"
          y1={svgHeight / 2 + roadWidth / 2 - 5}
          x2={svgWidth}
          y2={svgHeight / 2 + roadWidth / 2 - 5}
          stroke="#64748B"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Entrance marker */}
        <g transform={`translate(${entranceX}, ${entranceY})`}>
          <rect
            x="-15"
            y="-40"
            width="30"
            height="80"
            fill="#16A34A"
            opacity="0.2"
            stroke="#16A34A"
            strokeWidth="2"
          />
          <text
            x="0"
            y="5"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#16A34A"
            fontFamily="Arial, sans-serif"
          >
            ՄՈՒՏՔ
          </text>
          <polygon
            points="-10,-20 10,-20 0,0"
            fill="#16A34A"
            opacity="0.7"
          />
        </g>

        {/* Navigation route path */}
        {isNavigatingHere && targetPlace && (
          <g className="navigation-route">
            {/* Path from entrance to target */}
            <line
              x1={entranceX}
              y1={entranceY}
              x2={targetX}
              y2={entranceY}
              stroke="#1741D4"
              strokeWidth="4"
              strokeDasharray="10,10"
              opacity="0.7"
              className="route-line"
            />
            <line
              x1={targetX}
              y1={entranceY}
              x2={targetX}
              y2={targetY}
              stroke="#1741D4"
              strokeWidth="4"
              strokeDasharray="10,10"
              opacity="0.7"
              className="route-line"
            />

            {/* Target marker pulsing circle */}
            <g transform={`translate(${targetX}, ${targetY})`}>
              <circle
                r="35"
                fill="none"
                stroke="#1741D4"
                strokeWidth="3"
                opacity="0.6"
                className="target-pulse"
              />
              <circle
                r="25"
                fill="none"
                stroke="#1741D4"
                strokeWidth="2"
                opacity="0.8"
                className="target-pulse-2"
              />
              <circle
                r="15"
                fill="#1741D4"
                opacity="0.3"
              />
            </g>
          </g>
        )}

        {/* Animated car moving to destination */}
        {currentCarPos && (
          <g transform={`translate(${currentCarPos.x}, ${currentCarPos.y})`} className="navigating-car">
            {/* Car body */}
            <rect x="-20" y="-26" width="40" height="52" rx="4" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
            {/* Car roof */}
            <rect x="-15" y="-14" width="30" height="28" rx="2" fill="#60a5fa" stroke="#2563eb" strokeWidth="1"/>
            {/* Windshield */}
            <rect x="-13" y="-12" width="26" height="8" rx="1" fill="#bfdbfe" opacity="0.8"/>
            {/* Wheels */}
            <ellipse cx="-12" cy="-26" rx="5" ry="7" fill="#1f2937"/>
            <ellipse cx="12" cy="-26" rx="5" ry="7" fill="#1f2937"/>
            <ellipse cx="-12" cy="26" rx="5" ry="7" fill="#1f2937"/>
            <ellipse cx="12" cy="26" rx="5" ry="7" fill="#1f2937"/>
            {/* Headlights */}
            <rect x="-16" y="-28" width="6" height="3" rx="1" fill="#fbbf24" opacity="0.9"/>
            <rect x="10" y="-28" width="6" height="3" rx="1" fill="#fbbf24" opacity="0.9"/>
            {/* Glow effect */}
            <circle r="45" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" className="car-glow"/>
          </g>
        )}

        {/* Render parking places in rows */}
        {rows.map((row, rowIndex) => (
          <g key={rowIndex}>
            {row.map((place, colIndex) => {
              const isTopHalf = rowIndex < section.rows / 2;
              const y = isTopHalf
                ? 30 + rowIndex * placeHeight
                : svgHeight - 30 - (section.rows - rowIndex) * placeHeight;
              const x = 50 + colIndex * placeWidth;

              return (
                <g
                  key={place.id}
                  transform={`translate(${x}, ${y}) ${!isTopHalf ? 'rotate(180 30 45)' : ''}`}
                >
                  <ParkingPlace
                    place={place}
                    onClick={onPlaceClick}
                    isFlipped={!isTopHalf}
                  />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Section;
