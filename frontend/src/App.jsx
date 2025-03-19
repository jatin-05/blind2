import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";


const ObjectDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [detections, setDetections] = useState([]);

  // useEffect(() => {
  //   let ws;
  
  //   const connectWebSocket = () => {
  //     ws = new WebSocket("ws://localhost:8000/ws");
  
  //     ws.onopen = () => {
  //       console.log("WebSocket Connected");
  //     };
  
  //     ws.onmessage = (event) => {
  //       console.log("WebSocket Message:", event.data);
  //     };
  
  //     ws.onerror = (error) => {
  //       console.error("WebSocket Error:", error);
  //     };
  
  //     ws.onclose = () => {
  //       console.log("WebSocket Disconnected. Reconnecting...");
  //       setTimeout(connectWebSocket, 2000); // Retry after 2 seconds
  //     };
  
  //     setSocket(ws);
  //   };
  
  //   connectWebSocket();
  
  //   return () => {
  //     ws.close();
  //   };
  // }, []);
  useEffect(() => {
    // Connect to WebSocket
    const apiUrl = import.meta.env.VITE_API_URL
    const ws = new WebSocket(`wss://${apiUrl}/ws`);
    // const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDetections(data.detections);
    };
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const captureFrame = () => {
    if (webcamRef.current && socket) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const base64Image = imageSrc.split(",")[1]; // Remove the "data:image/png;base64," part
        socket.send(base64Image);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(captureFrame, 200); // Send a frame every 200ms
    return () => clearInterval(interval);
  }, [socket]);

  useEffect(() => {
    if (canvasRef.current && webcamRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = webcamRef.current.video.videoWidth;
      canvas.height = webcamRef.current.video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach(({ label, confidence, bbox }) => {
        const [x1, y1, x2, y2] = bbox;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.fillStyle = "red";
        ctx.fillText(`${label} (${(confidence * 100).toFixed(1)}%)`, x1, y1 - 5);
      });
    }
  }, [detections]);

  return (
    <div style={{ position: "relative" }}>
      <Webcam ref={webcamRef} screenshotFormat="image/png" style={{ width: "100%" }} />
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
    </div>
  );
};

export default ObjectDetection;
