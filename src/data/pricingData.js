export const PRICING_TIERS = {
  HOURLY: {
    id: 'hourly',
    name: 'Ժամային արժեք',
    rate: 5.00,
    unit: 'ժամ',
    description: 'Վճարփլ ժամով',
  },
  DAILY: {
    id: 'daily',
    name: 'Օրվա արժեք',
    rate: 35.00,
    unit: 'Օր',
    description: 'Վճարել ամբողջ օրվա համար',
  },
};

export const calculatePrice = (tierId, duration) => {
  const tier = Object.values(PRICING_TIERS).find(t => t.id === tierId);
  if (!tier) {
    throw new Error(`Invalid pricing tier: ${tierId}`);
  }
  return tier.rate * duration;
};
