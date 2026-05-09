import { useState, useEffect } from 'react';
import './CameraOverlay.css';

const CameraOverlay = ({ cameraId = "CAM-01", location = "PARKING LOT - ZONE A" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="camera-overlay">
      {/* Top left info */}
      <div className="camera-info top-left">
        <div className="camera-id">{cameraId}</div>
        <div className="camera-location">{location}</div>
      </div>

      {/* Top right timestamp */}
      <div className="camera-info top-right">
        <div className="camera-timestamp">{formatDateTime(currentTime)}</div>
      </div>

      {/* Recording indicator */}
      <div className="camera-info recording">
        <div className="rec-dot"></div>
        <span>REC</span>
      </div>

      {/* Camera frame corners */}
      <div className="camera-corner top-left-corner"></div>
      <div className="camera-corner top-right-corner"></div>
      <div className="camera-corner bottom-left-corner"></div>
      <div className="camera-corner bottom-right-corner"></div>

      {/* Scanline effect */}
      <div className="scanline"></div>

      {/* Vignette effect */}
      <div className="vignette"></div>
    </div>
  );
};

export default CameraOverlay;
