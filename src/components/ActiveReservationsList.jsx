import { useEffect } from 'react';
import { useParkingData } from '../contexts/ParkingDataContext';
import ReservationCard from './ReservationCard';

const ActiveReservationsList = ({ onCheckIn, onCancel }) => {
  const { getReservationsByUser, fetchReservations } = useParkingData();

  useEffect(() => {
    fetchReservations();
  }, []);

  const userReservations = getReservationsByUser();

  if (userReservations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📍</div>
        <h3>Ակտիվ ամրագրումներ չկան</h3>
        <p>Անցեք կայանատեղի էջ՝ տեղ ամրագրելու համար</p>
      </div>
    );
  }

  return (
    <div className="reservations-list">
      {userReservations.map(reservation => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onCheckIn={onCheckIn}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

export default ActiveReservationsList;
