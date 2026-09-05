'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, RefreshCw, Activity, Power } from 'lucide-react';

interface WebcamFeedProps {
  isActive?: boolean;
  onStatusUpdate?: (data: any) => void;
  onUnrecognized?: (snapshot: string, bbox: any) => void;
}

export default function WebcamFeed({ isActive = true, onStatusUpdate, onUnrecognized }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [manualPower, setManualPower] = useState(true); // User manual ON/OFF toggle
  const [isStreaming, setIsStreaming] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsCalcRef = useRef(Date.now());

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);

    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
    }
  };

  // Start camera
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Camera access denied or device not found. Please enable permissions.');
      setIsStreaming(false);
    }
  };

  const isEffectiveActive = isActive && manualPower;

  // Manage Camera & WebSocket Lifecycle based on effective active state
  useEffect(() => {
    if (!isEffectiveActive) {
      stopCamera();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setWsConnected(false);
      }
      return;
    }

    const wsUrl = `ws://${window.location.hostname}:8000/ws/attendance`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setWsConnected(true);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onStatusUpdate) onStatusUpdate(data);

        drawBoundingBox(data.bbox, data.status);

        if (data.status === 'UNRECOGNIZED' && onUnrecognized && data.snapshot) {
          onUnrecognized(data.snapshot, data.bbox);
        }
      } catch (err) {}
    };

    ws.onerror = () => setWsConnected(false);
    ws.onclose = () => setWsConnected(false);

    startCamera();

    return () => {
      stopCamera();
      if (ws) ws.close();
    };
  }, [isEffectiveActive]);

  // Frame capture loop
  useEffect(() => {
    let intervalId: any;

    if (isEffectiveActive && isStreaming && wsConnected) {
      intervalId = setInterval(() => {
        captureAndSendFrame();
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isEffectiveActive, isStreaming, wsConnected]);

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

    frameCountRef.current += 1;
    const now = Date.now();
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

    if (!bbox || !isEffectiveActive) return;

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
      
      <canvas ref={canvasRef} className="hidden" />

      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />

      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
      />

      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
          <span className={`w-2.5 h-2.5 rounded-full ${isEffectiveActive && wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {isEffectiveActive ? (wsConnected ? 'WebSocket Active' : 'Connecting Engine...') : 'Camera Off'}
        </div>

        <div className="flex items-center gap-2">
          {/* Manual Toggle Button */}
          <button
            type="button"
            onClick={() => setManualPower(!manualPower)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg ${
              manualPower
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{manualPower ? 'Turn Camera Off' : 'Turn Camera On'}</span>
          </button>

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEffectiveActive ? `${fps} FPS` : 'Off'}</span>
          </div>
        </div>
      </div>

      {!isEffectiveActive && (
        <div className="absolute inset-0 bg-dark-bg/90 flex flex-col items-center justify-center p-6 text-center z-20">
          <CameraOff className="w-12 h-12 text-indigo-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Camera Stopped</h4>
          <p className="text-xs text-gray-400 mb-4 max-w-sm">
            Camera hardware is turned off to save system resources and privacy.
          </p>
          <button
            onClick={() => setManualPower(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Power className="w-4 h-4" />
            <span>Turn Camera On</span>
          </button>
        </div>
      )}

      {isEffectiveActive && errorMsg && (
        <div className="absolute inset-0 bg-dark-bg/95 flex flex-col items-center justify-center p-6 text-center z-20">
          <CameraOff className="w-12 h-12 text-red-400 mb-3 animate-bounce" />
          <h4 className="text-lg font-bold text-white mb-1">Camera Offline</h4>
          <p className="text-xs text-gray-400 mb-4 max-w-md">{errorMsg}</p>
          <button onClick={startCamera} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all">
            <RefreshCw className="w-4 h-4" />
            Retry Camera Access
          </button>
        </div>
      )}
    </div>
  );
}
