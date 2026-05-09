import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useParkingData } from '../contexts/ParkingDataContext';
import PricingTierSelector from './PricingTierSelector';
import PaymentForm from './PaymentForm';
import GateOpeningAnimation from './GateOpeningAnimation';
import { getCardLast4 } from '../utils/reservationHelpers';
import { formatAmd } from '../utils/currency';
import { localizeZoneId } from '../utils/localize';
import './ReservationFlow.css';

const ReservationFlow = ({ place, onClose, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pricingSelection, setPricingSelection] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentValid, setPaymentValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [showGateAnimation, setShowGateAnimation] = useState(false);

  const { user } = useAuth();
  const { createReservation } = useParkingData();
  const navigate = useNavigate();

  const handlePricingChange = (selection) => {
    setPricingSelection(selection);
  };

  const handlePaymentValidation = (isValid, data) => {
    setPaymentValid(isValid);
    setPaymentData(data);
  };

  const handleNext = () => {
    if (currentStep === 1 && pricingSelection) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setPaymentError(null);
    }
  };

  const handlePayNow = async () => {
    if (!paymentValid || !paymentData) return;

    setIsProcessing(true);
    setPaymentError(null);

    const { data: newReservation, error } = await createReservation({
      place,
      pricingTier: pricingSelection.tierId,
      duration: pricingSelection.duration,
      totalPrice: parseFloat(pricingSelection.totalPrice),
      cardLast4: getCardLast4(paymentData.cardNumber),
      expirationDate: paymentData.expiry,
    });

    setIsProcessing(false);

    if (error) {
      setPaymentError(error.message || 'Վճարումը ձախողվեց: Խնդրում ենք կրկին փորձել:');
      return;
    }

    setReservation(newReservation);
    setCurrentStep(3);
  };

  const handleViewReservation = () => {
    navigate('/check-in');
    onClose();
  };

  const handleCheckInNow = () => {
    setShowGateAnimation(true);
  };

  const handleCloseAnimation = () => {
    setShowGateAnimation(false);

    if (reservation && reservation.placeId && reservation.sectionId && reservation.zoneId) {
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
      onClose();
    } else {
      console.error('Missing reservation data:', reservation);
      onClose();
    }
  };

  // Called when user closes without completing payment — triggers spot unlock
  const handleCancel = () => {
    if (onCancel) onCancel();
    else onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleCancel}>
        <div className="reservation-flow-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Ամրագրել կայանատեղ #{place.number}</h2>
            <button className="close-button" onClick={handleCancel}>×</button>
          </div>

          <div className="progress-indicator">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Գնագոյացում</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Վճարում</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Հաստատում</div>
            </div>
          </div>

          <div className="modal-body">
            {currentStep === 1 && (
              <>
                <PricingTierSelector onSelectionChange={handlePricingChange} />
                <div className="modal-actions">
                  <button
                    className="action-button secondary"
                    onClick={handleCancel}
                  >
                    ՉԵՂԱՐԿԵԼ
                  </button>
                  <button
                    className="action-button primary"
                    onClick={handleNext}
                    disabled={!pricingSelection}
                  >
                    ՀԱՋՈՐԴ
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="pricing-summary">
                  <h4>Ընտրված պլան</h4>
                  <p>
                    {pricingSelection.tierId === 'hourly' ? 'Ժամային դրույք' : 'Օրային դրույք'} - {pricingSelection.duration}{' '}
                    {pricingSelection.tierId === 'hourly' ? 'ժամ' : 'օր'}
                  </p>
                  <p className="summary-total">Ընդամենը՝ {formatAmd(pricingSelection.totalPrice)}</p>
                </div>

                <PaymentForm onValidationChange={handlePaymentValidation} />

                {paymentError && (
                  <div className="payment-error">
                    {paymentError}
                  </div>
                )}

                <div className="modal-actions">
                  <button className="action-button secondary" onClick={handleBack} disabled={isProcessing}>
                    ՀԵՏ
                  </button>
                  <button
                    className="action-button primary"
                    onClick={handlePayNow}
                    disabled={!paymentValid || isProcessing}
                  >
                    {isProcessing ? 'ԲԵՌՆՎՈՒՄ Է...' : 'ՎՃԱՐԵԼ ՀԻՄԱ'}
                  </button>
                </div>
              </>
            )}

            {currentStep === 3 && reservation && (
              <div className="confirmation-screen">
                <div className="success-icon">✓</div>
                <h3>ԱՄՐԱԳՐՈՒՄԸ ՀԱՍՏԱՏՎԱԾ Է</h3>
                <div className="confirmation-details">
                  <div className="detail-row">
                    <span className="detail-label">Տեղի համար՝</span>
                    <span className="detail-value">#{reservation.spotNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Գոտի՝</span>
                    <span className="detail-value">{localizeZoneId(reservation.zoneId)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Տևողություն՝</span>
                    <span className="detail-value">
                      {reservation.duration} {reservation.pricingTier === 'hourly' ? 'ժամ' : 'օր'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Վճարված ընդամենը՝</span>
                    <span className="detail-value">{formatAmd(reservation.totalPrice)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ամրագրման ID՝</span>
                    <span className="detail-value reservation-id">{reservation.id}</span>
                  </div>
                </div>

                <div className="confirmation-message">
                  Ձեր կայանատեղն հաջողությամբ ամրագրվել է: Ժամանելուց հետո անցեք ստուգման էջ՝ դարպասը բացելու համար:
                </div>

                <div className="modal-actions">
                  <button className="action-button secondary" onClick={onClose}>
                    ՎԵՐԱԴԱՌՆԱԼ
                  </button>
                  <button className="action-button primary" onClick={handleCheckInNow}>
                    ԿԱՅԱՆԵԼ
                  </button>
                  <button className="action-button primary" onClick={handleViewReservation}>
                    ՏԵՍՆԵԼ ԱՄՐԱԳՐՈՒՄԸ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGateAnimation && reservation && (
        <GateOpeningAnimation
          spotNumber={reservation.spotNumber}
          onClose={handleCloseAnimation}
        />
      )}
    </>
  );
};

export default ReservationFlow;
