import { useState } from 'react';
import { PRICING_TIERS } from '../data/pricingData';
import { formatAmd } from '../utils/currency';
import './PricingTierSelector.css';

const PricingTierSelector = ({ onSelectionChange }) => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [duration, setDuration] = useState(1);
  const [inputValue, setInputValue] = useState('1');

  const commitDuration = (raw) => {
    const max = selectedTier === 'hourly' ? 24 : 30;
    const parsed = Math.min(Math.max(parseInt(raw) || 1, 1), max);
    setDuration(parsed);
    setInputValue(String(parsed));

    if (selectedTier && onSelectionChange) {
      const tier = PRICING_TIERS[selectedTier === 'hourly' ? 'HOURLY' : 'DAILY'];
      onSelectionChange({
        tierId: selectedTier,
        duration: parsed,
        totalPrice: (tier.rate * parsed).toFixed(2),
      });
    }
  };

  const handleTierChange = (tierId) => {
    setSelectedTier(tierId);
    if (onSelectionChange) {
      const tier = PRICING_TIERS[tierId === 'hourly' ? 'HOURLY' : 'DAILY'];
      const totalPrice = tier.rate * duration;
      onSelectionChange({
        tierId,
        duration,
        totalPrice: totalPrice.toFixed(2),
      });
    }
  };

  const handleDurationChange = (newDuration) => {
    setInputValue(newDuration);
    const parsed = parseInt(newDuration);
    if (!isNaN(parsed) && parsed >= 1) {
      const max = selectedTier === 'hourly' ? 24 : 30;
      const value = Math.min(parsed, max);
      setDuration(value);

      if (selectedTier && onSelectionChange) {
        const tier = PRICING_TIERS[selectedTier === 'hourly' ? 'HOURLY' : 'DAILY'];
        onSelectionChange({
          tierId: selectedTier,
          duration: value,
          totalPrice: (tier.rate * value).toFixed(2),
        });
      }
    }
  };

  const getTotalPrice = () => {
    if (!selectedTier) return 0;
    const tier = PRICING_TIERS[selectedTier === 'hourly' ? 'HOURLY' : 'DAILY'];
    return (tier.rate * duration).toFixed(2);
  };

  return (
    <div className="pricing-tier-selector">
      <h3 className="selector-title">ԸՆՏՐԵՔ ԳՆԱՅԻՆ ՊԼԱՆ</h3>

      <div className="tier-cards">
        {Object.entries(PRICING_TIERS).map(([key, tier]) => (
          <div
            key={tier.id}
            className={`tier-card ${selectedTier === tier.id ? 'selected' : ''}`}
            onClick={() => handleTierChange(tier.id)}
          >
            <div className="tier-header">
              <input
                type="radio"
                name="pricing-tier"
                value={tier.id}
                checked={selectedTier === tier.id}
                onChange={() => handleTierChange(tier.id)}
                className="tier-radio"
              />
              <h4 className="tier-name">{tier.name}</h4>
            </div>
            <div className="tier-rate">
              {formatAmd(tier.rate)}/{tier.unit}
            </div>
            <p className="tier-description">{tier.description}</p>
          </div>
        ))}
      </div>

      {selectedTier && (
        <div className="duration-section">
          <label htmlFor="duration" className="duration-label">
            {selectedTier === 'hourly' ? 'Տեւողություն (Ժամերով)' : 'Տեւողություն (Օրերով)'}:
          </label>
          <input
            type="number"
            id="duration"
            min="1"
            max={selectedTier === 'hourly' ? 24 : 30}
            value={inputValue}
            onChange={(e) => handleDurationChange(e.target.value)}
            onBlur={(e) => commitDuration(e.target.value)}
            className="duration-input"
          />
        </div>
      )}

      {selectedTier && (
        <div className="total-price">
          <span className="total-label">ԸՆԴԱՄԵՆԸ՝</span>
          <span className="total-amount">{formatAmd(getTotalPrice())}</span>
        </div>
      )}
    </div>
  );
};

export default PricingTierSelector;
