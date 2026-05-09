import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ParkingDataProvider } from './contexts/ParkingDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ParkingViewPage from './pages/ParkingViewPage';
import CheckInPage from './pages/CheckInPage';
import { supabase } from './supabase-client';
import './App.css';

function App() {
  // Automatically free parking spots stuck in "reserving" status after 3 minutes.
  // Handles cases where user disconnects before completing reservation.
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data, error } = await supabase.rpc('free_expired_reserving_spots');
      if (error) {
        console.error('Error freeing expired spots:', error);
      } else if (data?.[0]?.freed_count > 0) {
        console.log(`Freed ${data[0].freed_count} expired reserving spots`);
      }
    }, 30000); // Run every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ParkingDataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ParkingViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/check-in"
              element={
                <ProtectedRoute>
                  <CheckInPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ParkingDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
