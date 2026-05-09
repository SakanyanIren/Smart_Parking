import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase-client';
import { localizeName } from '../utils/localize';

const ParkingDataContext = createContext(null);

// Transform flat Supabase rows into the nested zones structure the UI expects
const transformToZones = (spots) => {
  const zonesMap = {};

  spots.forEach((spot) => {
    if (!zonesMap[spot.zone_id]) {
      zonesMap[spot.zone_id] = {
        id: spot.zone_id,
        name: localizeName(spot.zone_name),
        sections: {},
      };
    }

    const zone = zonesMap[spot.zone_id];

    if (!zone.sections[spot.section_id]) {
      zone.sections[spot.section_id] = {
        id: spot.section_id,
        name: localizeName(spot.section_name),
        places: [],
      };
    }

    zone.sections[spot.section_id].places.push({
      id: spot.spot_id,               // 'a1-5' - matches existing UI logic
      number: spot.spot_number,        // 5
      status: spot.status,
      hourly_rate: spot.hourly_rate,
      supabase_id: spot.id,           // UUID - needed for DB updates
      zone_id: spot.zone_id,          // needed for reservation creation
      section_id: spot.section_id,    // needed for reservation creation
      current_user_id: spot.current_user_id,
      current_reservation_id: spot.current_reservation_id,
      reserving_expires_at: spot.reserving_expires_at,
      vehicle: spot.status === 'occupied'
        ? { arrivedAt: spot.last_updated }
        : null,
    });
  });

  return Object.values(zonesMap).map((zone) => ({
    ...zone,
    sections: Object.values(zone.sections).map((section) => {
      const sortedPlaces = section.places.sort((a, b) => a.number - b.number);
      const total = sortedPlaces.length;
      const placesPerRow = Math.min(10, total);
      const rows = total > 0 ? Math.ceil(total / placesPerRow) : 1;
      return {
        ...section,
        places: sortedPlaces,
        rows,
        placesPerRow,
      };
    }),
  }));
};

// Normalize Supabase reservation row to camelCase for UI components
const normalizeReservation = (r) => ({
  id: r.id,
  spotNumber: r.spot_number,
  zoneId: r.zone_id,
  sectionId: r.section_id,
  placeId: r.spot_id,              // text ID like 'a1-5', already stored in DB
  pricingTier: r.pricing_tier,
  duration: r.duration,
  totalPrice: parseFloat(r.total_amount),  // DB column is total_amount
  startTime: r.reserved_at,
  checkedIn: r.status === 'checked_in',
  checkedInAt: r.checked_in_at,
});

export const ParkingDataProvider = ({ children }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);

  const fetchParkingSpots = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .order('zone_id')
        .order('section_id')
        .order('spot_number');

      if (error) throw error;

      const transformed = transformToZones(data);
      setZones(transformed);
    } catch (err) {
      console.error('Error fetching parking spots:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['paid', 'checked_in'])
        .order('reserved_at', { ascending: false });

      if (error) throw error;

      setReservations(data.map(normalizeReservation));
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };

  useEffect(() => {
    fetchParkingSpots();

    // Subscribe to real-time changes on parking_spots table
    const channel = supabase
      .channel('parking_spots_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_spots',
        },
        (payload) => {
          console.log('Real-time parking spot update:', payload);

          if (payload.eventType === 'UPDATE') {
            setZones((prevZones) =>
              prevZones.map((zone) => ({
                ...zone,
                sections: zone.sections.map((section) => ({
                  ...section,
                  places: section.places.map((place) => {
                    if (place.supabase_id === payload.new.id) {
                      return {
                        ...place,
                        status: payload.new.status,
                        current_user_id: payload.new.current_user_id,
                        current_reservation_id: payload.new.current_reservation_id,
                        reserving_expires_at: payload.new.reserving_expires_at,
                        vehicle: payload.new.status === 'occupied'
                          ? { arrivedAt: payload.new.last_updated }
                          : null,
                      };
                    }
                    return place;
                  }),
                })),
              }))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Lock a spot in 'reserving' state (optimistic - only succeeds if still 'available')
  const lockSpot = async (supabaseId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const reservingExpiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('parking_spots')
      .update({
        status: 'reserving',
        current_user_id: user.id,
        reserving_expires_at: reservingExpiresAt,
      })
      .eq('id', supabaseId)
      .eq('status', 'available') // only lock if still available
      .select()
      .single();

    if (error || !data) {
      return { error: error || new Error('Spot is no longer available') };
    }
    return { error: null };
  };

  // Release a spot back to 'available' — only unlocks if it belongs to the current user
  const unlockSpot = async (supabaseId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('parking_spots')
      .update({
        status: 'available',
        current_user_id: null,
        reserving_expires_at: null,
      })
      .eq('id', supabaseId)
      .eq('current_user_id', user.id)  // safety: only unlock our own lock
      .eq('status', 'reserving');      // safety: only unlock if still in reserving state
  };

  // Create a full reservation: spot is already locked — insert reservation → update spot to reserved → insert payment
  const createReservation = async ({ place, pricingTier, duration, totalPrice, cardLast4, expirationDate }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      // Calculate reservation expiry
      const expiresAt = new Date();
      if (pricingTier === 'hourly') {
        expiresAt.setHours(expiresAt.getHours() + duration);
      } else {
        expiresAt.setDate(expiresAt.getDate() + duration);
      }

      // Step 2: Insert reservation record
      const { data: reservation, error: resError } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          user_email: user.email,
          parking_spot_id: place.supabase_id,  // UUID FK → parking_spots.id
          spot_id: place.id,                    // text ID like 'a1-5'
          zone_id: place.zone_id,
          section_id: place.section_id,
          spot_number: place.number,
          pricing_tier: pricingTier,
          duration,
          total_amount: totalPrice,
          status: 'paid',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (resError) throw resError;

      // Step 3: Update spot to 'reserved' and link the reservation
      const { error: spotError } = await supabase
        .from('parking_spots')
        .update({
          status: 'reserved',
          current_reservation_id: reservation.id,
        })
        .eq('id', place.supabase_id);

      if (spotError) throw spotError;

      // Step 4: Insert payment record
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          reservation_id: reservation.id,
          user_id: user.id,
          card_last4: cardLast4,
          expiration_date: expirationDate,
          amount: totalPrice,
          status: 'completed',
          transaction_id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        });

      if (payError) throw payError;

      const normalized = normalizeReservation(reservation);
      setReservations((prev) => [normalized, ...prev]);

      return { data: normalized, error: null };
    } catch (err) {
      console.error('Error creating reservation:', err);
      // Release the lock so the spot doesn't stay stuck in 'reserving'
      await unlockSpot(place.supabase_id);
      return { data: null, error: err };
    }
  };

  const getReservationsByUser = () => reservations;

  // placeId is the text ID like 'a1-5' — used for reliable local state matching
  const checkInReservation = async (reservationId, placeId) => {
    try {
      const { data: reservation, error: resError } = await supabase
        .from('reservations')
        .update({
          status: 'checked_in',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', reservationId)
        .select()
        .single();

      if (resError) throw resError;

      await supabase
        .from('parking_spots')
        .update({ status: 'occupied' })
        .eq('current_reservation_id', reservationId);

      // Update zones state directly by place text ID (e.g. 'a1-5')
      // Matching by placeId is reliable — current_reservation_id may not
      // be set locally yet if the realtime event hasn't arrived
      const now = new Date().toISOString();
      setZones((prevZones) =>
        prevZones.map((zone) => ({
          ...zone,
          sections: zone.sections.map((section) => ({
            ...section,
            places: section.places.map((place) =>
              place.id === placeId
                ? { ...place, status: 'occupied', vehicle: { arrivedAt: now } }
                : place
            ),
          })),
        }))
      );

      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId
            ? { ...r, checkedIn: true, checkedInAt: reservation.checked_in_at }
            : r
        )
      );
    } catch (err) {
      console.error('Error checking in:', err);
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      const { error: resError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', reservationId);

      if (resError) throw resError;

      await supabase
        .from('parking_spots')
        .update({
          status: 'available',
          current_user_id: null,
          current_reservation_id: null,
          reserving_expires_at: null,
        })
        .eq('current_reservation_id', reservationId);

      // Update zones state directly so the spot turns green immediately
      setZones((prevZones) =>
        prevZones.map((zone) => ({
          ...zone,
          sections: zone.sections.map((section) => ({
            ...section,
            places: section.places.map((place) =>
              place.current_reservation_id === reservationId
                ? {
                    ...place,
                    status: 'available',
                    current_user_id: null,
                    current_reservation_id: null,
                    reserving_expires_at: null,
                    vehicle: null,
                  }
                : place
            ),
          })),
        }))
      );

      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    } catch (err) {
      console.error('Error cancelling reservation:', err);
    }
  };

  const updatePlaceStatus = () => console.warn('updatePlaceStatus: direct status changes use Supabase now');

  const value = {
    zones,
    loading,
    error,
    reservations,
    setReservations,
    refetchSpots: fetchParkingSpots,
    fetchReservations,
    lockSpot,
    unlockSpot,
    createReservation,
    getReservationsByUser,
    checkInReservation,
    cancelReservation,
    updatePlaceStatus,
  };

  return (
    <ParkingDataContext.Provider value={value}>
      {children}
    </ParkingDataContext.Provider>
  );
};

export const useParkingData = () => {
  const context = useContext(ParkingDataContext);
  if (!context) {
    throw new Error('useParkingData must be used within a ParkingDataProvider');
  }
  return context;
};
