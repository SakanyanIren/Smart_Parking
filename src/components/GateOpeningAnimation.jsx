import { useEffect, useState } from 'react';
import './GateOpeningAnimation.css';

const GateOpeningAnimation = ({ spotNumber, onClose }) => {
  const [isOpening, setIsOpening] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Gate opening animation
    const openTimer = setTimeout(() => {
      setIsOpening(false);
      setShowSuccess(true);
    }, 2000);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  return (
    <div className="gate-animation-overlay" onClick={onClose}>
      <div className="gate-animation-content" onClick={(e) => e.stopPropagation()}>
        <div className="gate-container">
          {/* Gate bars */}
          <div className={`gate-bar left ${!isOpening ? 'open' : ''}`}></div>
          <div className={`gate-bar right ${!isOpening ? 'open' : ''}`}></div>

          {/* Center content */}
          <div className="gate-status">
            {isOpening ? (
              <>
                <div className="loading-spinner"></div>
                <h2 className="status-text">ԴԱՐՊԱՍԸ ԲԱՑՎՈՒՄ Է...</h2>
                <div className="beep-effect">․․․</div>
              </>
            ) : (
              <>
                <div className={`success-checkmark ${showSuccess ? 'show' : ''}`}>✓</div>
                <h2 className="status-text success">ԴԱՐՊԱՍԸ ԲԱՑ Է</h2>
                <p className="proceed-text">ԱՆՑԵՔ ՏԵՂ #{spotNumber}</p>
              </>
            )}
          </div>
        </div>

        <button className="close-button" onClick={onClose}>
          ՓԱԿԵԼ
        </button>
      </div>
    </div>
  );
};

export default GateOpeningAnimation;
