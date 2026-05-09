import { formatAmd } from '../utils/currency';
import { localizeZoneId } from '../utils/localize';
import './ReservationCard.css';

const ReservationCard = ({ reservation, onCheckIn, onCancel }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = () => {
    if (reservation.checkedIn) return 'checked-in';
    return 'active';
  };

  const getStatusText = () => {
    if (reservation.checkedIn) return 'Ստուգված';
    return 'Ակտիվ';
  };

  return (
    <div className="reservation-card">
      <div className="card-corner top-left"></div>
      <div className="card-corner top-right"></div>
      <div className="card-corner bottom-left"></div>
      <div className="card-corner bottom-right"></div>

      <div className="card-header">
        <h3 className="spot-number">ՏԵՂ #{reservation.spotNumber}</h3>
        <span className={`status-badge ${getStatusBadgeClass()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="info-label">Գտնվելու վայրը՝</span>
          <span className="info-value">
            {localizeZoneId(reservation.zoneId)} - Հատված {reservation.sectionId.toUpperCase()}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Գնագոյացում՝</span>
          <span className="info-value">
            {reservation.pricingTier === 'hourly' ? 'Ժամային' : 'Օրային'} - {reservation.duration}{' '}
            {reservation.pricingTier === 'hourly' ? 'ժամ' : 'օր'}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Վճարված ընդամենը՝</span>
          <span className="info-value price">{formatAmd(reservation.totalPrice)}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Ամրագրված՝</span>
          <span className="info-value">{formatDate(reservation.startTime)}</span>
        </div>

        {reservation.checkedIn && (
          <div className="info-row">
            <span className="info-label">Ստուգված՝</span>
            <span className="info-value">{formatDate(reservation.checkedInAt)}</span>
          </div>
        )}

        <div className="info-row">
          <span className="info-label">Ամրագրման ID՝</span>
          <span className="info-value reservation-id">{reservation.id}</span>
        </div>
      </div>

      {!reservation.checkedIn && (
        <div className="card-actions">
          <button
            className="check-in-button"
            onClick={() => onCheckIn(reservation.id)}
          >
            ԿԱՅԱՆԵԼ
          </button>
          <p className="check-in-help">
            Սեղմեք՝ դարպասը բացելու և ձեր ամրագրված տեղ մտնելու համար
          </p>
          <button
            className="cancel-button"
            onClick={() => onCancel(reservation.id)}
          >
            ՉԵՂԱՐԿԵԼ ԱՄՐԱԳՐՈՒՄԸ
          </button>
          <p className="cancel-help">
            Չեղարկեք ամրագրումը և ազատեք կայանատեղը
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
