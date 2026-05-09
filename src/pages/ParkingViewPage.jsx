import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParkingData } from '../contexts/ParkingDataContext';
import Navigation from '../components/Navigation';
import ParkingZone from '../components/ParkingZone';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import ReservationFlow from '../components/ReservationFlow';
import { PARKING_STATUS } from '../data/parkingData';
import '../App.css';

function ParkingViewPage() {
  const { zones, loading, error, checkInReservation, lockSpot, unlockSpot } = useParkingData();
  const [selectedPlace, setSelectedPlace] = useState(null);   // for info modal (non-available spots)
  const [reservingPlace, setReservingPlace] = useState(null); // for direct reservation flow
  const [selectedZone, setSelectedZone] = useState('');
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Set the first zone once data loads from Supabase
  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0].id);
    }
  }, [zones, selectedZone]);

  // Handle incoming navigation from check-in page
  useEffect(() => {
    const spotData = location.state?.navigateToSpot;
    if (spotData) {
      window.history.replaceState({}, '', '/');
      setSelectedZone(spotData.zoneId);
      setNavigatingTo({ placeId: spotData.placeId, sectionId: spotData.sectionId });
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (spotData.reservationId) {
          checkInReservation(spotData.reservationId, spotData.placeId);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handlePlaceClick = async (place) => {
    if (place.status === PARKING_STATUS.AVAILABLE) {
      // Lock the spot immediately — realtime will show it as 'reserving' for all users
      const { error } = await lockSpot(place.supabase_id);
      if (!error) {
        setReservingPlace(place);
      }
      // If error, spot was taken by someone else — realtime will update the colour
    } else {
      // Show info modal for occupied / reserved / reserving spots
      setSelectedPlace(place);
    }
  };

  const handleCancelNavigation = () => {
    setNavigatingTo(null);
    setIsAnimating(false);
  };

  const currentZone = zones.find(z => z.id === selectedZone);

  if (loading) {
    return (
      <div className="app">
        <Navigation />
        <div className="page-content">
          <div style={{ color: '#e91e8c', fontFamily: 'Courier New', textAlign: 'center', padding: '40px', letterSpacing: '2px' }}>
            ԲԵՌՆՎՈՒՄ ԵՆ ԿԱՅԱՆԱՏԵՂԻ ՏՎՅԱԼՆԵՐԸ...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Navigation />
        <div className="page-content">
          <div style={{ color: '#ef4444', fontFamily: 'Courier New', textAlign: 'center', padding: '40px', letterSpacing: '2px' }}>
            ERROR: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navigation />

      <div className="page-content">
        <div className="app-container">
          <div className="controls-panel">
            <div className="zone-selector">
              <div className="panel-label">ԳՈՏԻՆԵՐ</div>
              <div className="zone-tabs">
                {zones.map(zone => (
                  <button
                    key={zone.id}
                    className={`zone-tab ${selectedZone === zone.id ? 'active' : ''}`}
                    onClick={() => setSelectedZone(zone.id)}
                  >
                    {zone.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="legend">
              <div className="panel-label">ԿԱՐԳԱՎԻՃԱԿ</div>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color available"></div>
                  <span>Ազատ</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color occupied"></div>
                  <span>Զբաղված</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color reserved"></div>
                  <span>Ամրագրված</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color reserving"></div>
                  <span>Ամրագրվում է</span>
                </div>
              </div>
            </div>
          </div>

          {currentZone && (
            <ParkingZone
              zone={currentZone}
              onPlaceClick={handlePlaceClick}
              navigatingTo={navigatingTo}
              isAnimating={isAnimating}
              onCancelNavigation={handleCancelNavigation}
            />
          )}
        </div>
      </div>

      {/* Direct reservation flow — opened immediately when an available spot is clicked */}
      {reservingPlace && (
        <ReservationFlow
          place={reservingPlace}
          onClose={() => setReservingPlace(null)}
          onCancel={() => {
            unlockSpot(reservingPlace.supabase_id);
            setReservingPlace(null);
          }}
        />
      )}

      {/* Info modal for non-available spots */}
      {selectedPlace && (
        <PlaceDetailsModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}

export default ParkingViewPage;
