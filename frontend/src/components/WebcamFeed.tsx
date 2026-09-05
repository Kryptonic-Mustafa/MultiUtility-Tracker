'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, RefreshCw, Activity } from 'lucide-react';

interface WebcamFeedProps {
  onStatusUpdate?: (data: any) => void;
  onUnrecognized?: (snapshot: string, bbox: any) => void;
}

export default function WebcamFeed({ onStatusUpdate, onUnrecognized }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsCalcRef = useRef(timeNow());

  function timeNow() {
    return Date.now();
  }

  // Initialize camera
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMsg("Camera access denied or device not found. Please enable permissions.");
      setIsStreaming(false);
    }
  };

  // Connect WebSocket
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8000/ws/attendance`;
    console.log("Connecting WebSocket to:", wsUrl);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected.");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onStatusUpdate) onStatusUpdate(data);

        // Draw bounding box if present
        drawBoundingBox(data.bbox, data.status);

        // Trigger unrecognized modal prompt
        if (data.status === 'UNRECOGNIZED' && onUnrecognized && data.snapshot) {
          onUnrecognized(data.snapshot, data.bbox);
        }
      } catch (err) {
        console.error("WS message parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WS error:", err);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log("WS closed.");
      setWsConnected(false);
    };

    startCamera();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Frame Capture & Transmission Loop
  useEffect(() => {
    let intervalId: any;

    if (isStreaming && wsConnected) {
      intervalId = setInterval(() => {
        captureAndSendFrame();
      }, 100); // 10 FPS send rate is optimal for real-time recognition without network overload
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStreaming, wsConnected]);

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !socketRef.current) return;
    if (socketRef.current.readyState !== WebSocket.OPEN) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = 480;
    canvas.height = 360;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frameBase64 = canvas.toDataURL('image/jpeg', 0.7);

    socketRef.current.send(JSON.stringify({ frame: frameBase64 }));

    // FPS Counter
    frameCountRef.current += 1;
    const now = timeNow();
    if (now - lastFpsCalcRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsCalcRef.current = now;
    }
  };

  const drawBoundingBox = (bbox: any, status: string) => {
    if (!overlayCanvasRef.current || !videoRef.current) return;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!bbox) return;

    // Scale bbox coordinates from 480x360 canvas back to video resolution
    const scaleX = canvas.width / 480;
    const scaleY = canvas.height / 360;

    const top = bbox.top * scaleY;
    const right = bbox.right * scaleX;
    const bottom = bbox.bottom * scaleY;
    const left = bbox.left * scaleX;

    const width = right - left;
    const height = bottom - top;

    ctx.lineWidth = 3;
    ctx.strokeStyle = status === 'MATCHED' ? '#10b981' : (status === 'UNRECOGNIZED' ? '#ef4444' : '#6366f1');
    ctx.fillStyle = status === 'MATCHED' ? 'rgba(16, 185, 129, 0.15)' : (status === 'UNRECOGNIZED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)');

    ctx.strokeRect(left, top, width, height);
    ctx.fillRect(left, top, width, height);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl aspect-video flex items-center justify-center group">
      
      {/* Offscreen hidden capture canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* HTML5 Live Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />

      {/* Bounding Box Canvas Overlay */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
      />

      {/* Top Status Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
          <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          {wsConnected ? 'WebSocket Active' : 'Connecting Engine...'}
        </div>

        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>{fps} FPS</span>
        </div>
      </div>

      {/* Error state display */}
      {errorMsg && (
        <div className="absolute inset-0 bg-dark-bg/95 flex flex-col items-center justify-center p-6 text-center z-20">
          <CameraOff className="w-12 h-12 text-red-400 mb-3 animate-bounce" />
          <h4 className="text-lg font-bold text-white mb-1">Camera Offline</h4>
          <p className="text-xs text-gray-400 mb-4 max-w-md">{errorMsg}</p>
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Camera Access
          </button>
        </div>
      )}
    </div>
  );
}
