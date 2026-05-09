import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParkingData } from '../contexts/ParkingDataContext';
import Navigation from '../components/Navigation';
import ActiveReservationsList from '../components/ActiveReservationsList';
import GateOpeningAnimation from '../components/GateOpeningAnimation';
import './CheckInPage.css';

const CheckInPage = () => {
  const [showGateAnimation, setShowGateAnimation] = useState(false);
  const [selectedSpotNumber, setSelectedSpotNumber] = useState(null);
  const checkedInReservationRef = useRef(null);
  const { reservations, cancelReservation } = useParkingData();
  const navigate = useNavigate();

  const handleCheckIn = (reservationId) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    setSelectedSpotNumber(reservation.spotNumber);
    checkedInReservationRef.current = reservation;
    setShowGateAnimation(true);
  };

  const handleCancel = (reservationId) => {
    if (window.confirm('Վստա՞հ եք, որ ցանկանում եք չեղարկել այս ամրագրումը:')) {
      cancelReservation(reservationId);
    }
  };

  const handleCloseAnimation = () => {
    setShowGateAnimation(false);
    setSelectedSpotNumber(null);

    // Navigate to parking view with driving animation data
    const reservation = checkedInReservationRef.current;
    if (reservation) {
      checkedInReservationRef.current = null;
      navigate('/', {
        state: {
          navigateToSpot: {
            placeId: reservation.placeId,
            sectionId: reservation.sectionId,
            zoneId: reservation.zoneId,
            reservationId: reservation.id,
          },
        },
      });
    }
  };

  return (
    <div className="check-in-page">
      <Navigation />

      <div className="check-in-content">
        <div className="check-in-container">
          <div className="page-header">
            <h1>ԻՄ ԱՄՐԱԳՐՈՒՄՆԵՐԸ</h1>
            <p className="page-subtitle">Կառավարեք ձեր կայանատեղի ամրագրումները</p>
          </div>

          <div className="reservations-section">
            <ActiveReservationsList onCheckIn={handleCheckIn} onCancel={handleCancel} />
          </div>
        </div>
      </div>

      {showGateAnimation && (
        <GateOpeningAnimation
          spotNumber={selectedSpotNumber}
          onClose={handleCloseAnimation}
        />
      )}
    </div>
  );
};

export default CheckInPage;
