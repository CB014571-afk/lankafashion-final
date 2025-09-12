// src/pages/ProofPopup.jsx
import React, { useState, useRef, useEffect } from 'react';

const ProofPopup = ({ onClose, onSubmit }) => {
  const [photo, setPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const takePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 300, 200);
    const imageData = canvasRef.current.toDataURL('image/png');
    setPhoto(imageData);
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="popup">
      <h2>Proof of Delivery</h2>
      {!photo ? (
        <>
          <video ref={videoRef} autoPlay width="300" height="200" />
          <button onClick={takePhoto}>Take Photo</button>
        </>
      ) : (
        <>
          <img src={photo} alt="Proof" width="300" />
          <div>
            <button onClick={() => onSubmit(photo)}>Submit</button>
            <button onClick={retakePhoto}>Retake</button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} width="300" height="200" style={{ display: 'none' }} />
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ProofPopup;