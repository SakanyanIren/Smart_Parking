import Section from './Section';
import './ParkingZone.css';

const ParkingZone = ({ zone, onPlaceClick, navigatingTo, isAnimating, onCancelNavigation }) => {
  const totalPlaces = zone.sections.reduce(
    (sum, section) => sum + section.places.length,
    0
  );

  const availablePlaces = zone.sections.reduce(
    (sum, section) => sum + section.places.filter(p => p.status === 'available').length,
    0
  );

  const occupiedPlaces = zone.sections.reduce(
    (sum, section) => sum + section.places.filter(p => p.status === 'occupied').length,
    0
  );

  const reservedPlaces = zone.sections.reduce(
    (sum, section) => sum + section.places.filter(p => p.status === 'reserved').length,
    0
  );

  return (
    <div className="parking-zone">
      <div className="zone-header">
        <div>
          <h2>{zone.name}</h2>
          {navigatingTo && (
            <div className="navigation-status">
              <span className="nav-indicator">
                {isAnimating ? '🚗 ՆԱՎԻԳԱՑԻԱ ԴԵՊԻ ՏԵՂ...' : '📍 ՆՊԱՏԱԿԱԿԵՏԸ ՆՇՎԱԾ Է'}
              </span>
              <button className="cancel-nav-btn" onClick={onCancelNavigation}>
                ՉԵՂԱՐԿԵԼ ՆԱՎԻԳԱՑԻԱՆ
              </button>
            </div>
          )}
        </div>
        <div className="zone-summary">
          <div className="summary-item">
            <span className="summary-label">Ընդամենը տեղ</span>
            <span className="summary-value">{totalPlaces}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Ազատ</span>
            <span className="summary-value available">{availablePlaces}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Զբաղված</span>
            <span className="summary-value occupied">{occupiedPlaces}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Ամրագրված</span>
            <span className="summary-value reserved">{reservedPlaces}</span>
          </div>
        </div>
      </div>

      <div className="sections-container">
        {zone.sections.map(section => (
          <Section
            key={section.id}
            section={section}
            onPlaceClick={onPlaceClick}
            navigatingTo={navigatingTo}
            isAnimating={isAnimating}
          />
        ))}
      </div>
    </div>
  );
};

export default ParkingZone;
