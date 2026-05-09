const NAME_MAP = {
  'Zone A - Terminal 1': 'Կայանատեղի Ա ֊ Տերմինալ 1',
  'Zone B - Terminal 2': 'Կայանատեղի Բ ֊ Տերմինալ 2',
};

export const localizeName = (name) => NAME_MAP[name] ?? name;

// Formats a zoneId like "zone-a" → "Կայանատեղի A"
export const localizeZoneId = (zoneId) => {
  const letter = zoneId.replace(/^zone-/i, '').toUpperCase();
  return `Կայանատեղի ${letter}`;
};
