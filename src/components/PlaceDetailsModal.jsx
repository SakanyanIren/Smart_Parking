import { PARKING_STATUS } from '../data/parkingData';
import './PlaceDetailsModal.css';

const PlaceDetailsModal = ({ place, onClose }) => {
  if (!place) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Ազատ',
      occupied: 'Զբաղված',
      reserved: 'Ամրագրված',
      reserving: 'Ամրագրվում է',
    };
    return labels[status] ?? status;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Կայանատեղ #{place.number}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Տեղի ID՝</span>
            <span className="detail-value">{place.id}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Կարգավիճակ՝</span>
            <span className={`status-badge ${place.status}`}>
              {getStatusLabel(place.status)}
            </span>
          </div>

          {place.status === PARKING_STATUS.OCCUPIED && place.vehicle && (
            <div className="detail-section">
              <h3>Տրանսպորտային միջոցի տեղեկություններ</h3>
              <div className="detail-row">
                <span className="detail-label">Ժամանել է՝</span>
                <span className="detail-value">{formatDate(place.vehicle.arrivedAt)}</span>
              </div>
            </div>
          )}

          {place.status === PARKING_STATUS.RESERVING && (
            <div className="detail-section">
              <h3>Այս տեղը ամրագրվում է</h3>
              <p style={{ color: '#888', fontFamily: 'Courier New', fontSize: '13px', margin: 0 }}>
                Մեկ այլ օգտատեր ներկայումս ավարտում է իր ամրագրումը: Խնդրում ենք ընտրել այլ տեղ:
              </p>
            </div>
          )}

          {place.status === PARKING_STATUS.RESERVED && (
            <div className="detail-section">
              <h3>Այս տեղն ամրագրված է</h3>
              <p style={{ color: '#888', fontFamily: 'Courier New', fontSize: '13px', margin: 0 }}>
                Այս տեղն արդեն ամրագրված է: Խնդրում ենք ընտրել այլ տեղ:
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailsModal;
