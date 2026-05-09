import { useState } from 'react';
import {
  formatCardNumber,
  formatExpiry,
  validateCardNumber,
  validateExpiry,
  validateCVV,
} from '../utils/reservationHelpers';
import './PaymentForm.css';

const PaymentForm = ({ onValidationChange }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Քարտի համարը պարտադիր է';
    } else if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Խնդրում ենք մուտքագրել վավեր 16-նիշ քարտի համար';
    }

    if (!expiry.trim()) {
      newErrors.expiry = 'Վավերականության ժամկետը պարտադիր է';
    } else if (!validateExpiry(expiry)) {
      newErrors.expiry = 'Անվավեր ժամկետ (ԱԱ/ՏՏ)';
    }

    if (!cvv.trim()) {
      newErrors.cvv = 'CVV-ն պարտադիր է';
    } else if (!validateCVV(cvv)) {
      newErrors.cvv = 'CVV-ն պետք է լինի 3-4 թիվ';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Քարտապանի անունը պարտադիր է';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (onValidationChange) {
      onValidationChange(isValid, {
        cardNumber,
        expiry,
        cvv,
        cardholderName,
      });
    }

    return isValid;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
      if (errors.cardNumber) {
        setErrors({ ...errors, cardNumber: null });
      }
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.length <= 5) {
      setExpiry(formatted);
      if (errors.expiry) {
        setErrors({ ...errors, expiry: null });
      }
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
      if (errors.cvv) {
        setErrors({ ...errors, cvv: null });
      }
    }
  };

  const handleCardholderNameChange = (e) => {
    setCardholderName(e.target.value);
    if (errors.cardholderName) {
      setErrors({ ...errors, cardholderName: null });
    }
  };

  // Trigger validation whenever any field changes
  useState(() => {
    validateForm();
  });

  return (
    <div className="payment-form">
      <h3 className="form-title">ՎՃԱՐՄԱՆ ՏԵՂԵԿՈՒԹՅՈՒՆՆԵՐ</h3>
      <p className="form-subtitle">Սա նմանակված վճարում է - Իրական գումար չի գանձվի</p>

      <div className="form-group">
        <label htmlFor="cardNumber">ՔԱՐՏԻ ՀԱՄԱՐ</label>
        <input
          type="text"
          id="cardNumber"
          value={cardNumber}
          onChange={handleCardNumberChange}
          onBlur={validateForm}
          className={errors.cardNumber ? 'error' : ''}
          placeholder="1234 5678 9012 3456"
        />
        {errors.cardNumber && (
          <span className="error-message">{errors.cardNumber}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expiry">ՎԱՎԵՐԱԿԱՆՈՒԹՅԱՆ ԺԱՄԿԵՏ</label>
          <input
            type="text"
            id="expiry"
            value={expiry}
            onChange={handleExpiryChange}
            onBlur={validateForm}
            className={errors.expiry ? 'error' : ''}
            placeholder="MM/YY"
          />
          {errors.expiry && (
            <span className="error-message">{errors.expiry}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cvv">CVV</label>
          <input
            type="password"
            id="cvv"
            value={cvv}
            onChange={handleCvvChange}
            onBlur={validateForm}
            className={errors.cvv ? 'error' : ''}
            placeholder="123"
          />
          {errors.cvv && (
            <span className="error-message">{errors.cvv}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cardholderName">ՔԱՐՏԱՊԱՆԻ ԱՆՈՒՆ</label>
        <input
          type="text"
          id="cardholderName"
          value={cardholderName}
          onChange={handleCardholderNameChange}
          onBlur={validateForm}
          className={errors.cardholderName ? 'error' : ''}
          placeholder="JOHN DOE"
        />
        {errors.cardholderName && (
          <span className="error-message">{errors.cardholderName}</span>
        )}
      </div>

      <div className="security-notice">
        <span className="notice-icon">🔒</span>
        <span className="notice-text">Նմանակված անվտանգ վճարում - Տվյալները չեն փոխանցվում</span>
      </div>
    </div>
  );
};

export default PaymentForm;
