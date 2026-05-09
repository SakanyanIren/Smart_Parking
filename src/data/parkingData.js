// Parking place statuses
export const PARKING_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  RESERVING: 'reserving',
};

// Generate parking places for a section
const generateParkingPlaces = (sectionId, startNumber, count) => {
  const places = [];
  for (let i = 0; i < count; i++) {
    places.push({
      id: `${sectionId}-${startNumber + i}`,
      number: startNumber + i,
      status: PARKING_STATUS.AVAILABLE,
      vehicle: null,
    });
  }
  return places;
};

// Mock data for airport parking zones
export const parkingZones = [
  {
    id: 'zone-a',
    name: 'Կայանատեղի A - Տերմինալ 1',
    sections: [
      {
        id: 'a1',
        name: 'A1',
        rows: 4,
        placesPerRow: 10,
        places: generateParkingPlaces('a1', 1, 40),
      },
      {
        id: 'a2',
        name: 'A2',
        rows: 4,
        placesPerRow: 10,
        places: generateParkingPlaces('a2', 41, 40),
      },
    ],
  },
  {
    id: 'zone-b',
    name: 'Կայանատեղի B - Տերմինալ 2',
    sections: [
      {
        id: 'b1',
        name: 'B1',
        rows: 3,
        placesPerRow: 12,
        places: generateParkingPlaces('b1', 1, 36),
      },
      {
        id: 'b2',
        name: 'B2',
        rows: 3,
        placesPerRow: 12,
        places: generateParkingPlaces('b2', 37, 36),
      },
    ],
  },
];

// Simulate some occupied and reserved spots
const simulateOccupancy = () => {
  const zones = JSON.parse(JSON.stringify(parkingZones));

  zones.forEach(zone => {
    zone.sections.forEach(section => {
      section.places.forEach((place, index) => {
        const random = Math.random();
        if (random < 0.3) {
          place.status = PARKING_STATUS.OCCUPIED;
          place.vehicle = {
            plate: `ABC-${Math.floor(Math.random() * 9000) + 1000}`,
            arrivedAt: new Date(Date.now() - Math.random() * 3600000 * 5).toISOString(),
          };
        } else if (random < 0.4) {
          place.status = PARKING_STATUS.RESERVED;
          place.reservedBy = `User ${Math.floor(Math.random() * 100)}`;
        }
      });
    });
  });

  return zones;
};

export const getInitialParkingData = () => simulateOccupancy();
