"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, ScanBarcode, Search, Loader2 } from "lucide-react";
import { api, ScanResult } from "@/lib/api";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";

interface UnifiedScanInterfaceProps {
  onBarcodeDetected: (code: string, frameData?: string) => void;
  onImageCaptured: (fileOrDataUrl: File | string, mode?: "food" | "barcode") => void;
  onResult: (result: ScanResult) => void;
  paused?: boolean;
}

export function UnifiedScanInterface({
  onBarcodeDetected,
  onImageCaptured,
  onResult,
  paused = false,
}: UnifiedScanInterfaceProps) {
  const [scanMode, setScanMode] = useState<"food" | "barcode">("food");
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);

  useEffect(() => {
    let active = true;
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (!active) {
          currentStream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
          setStreamActive(true);

          const { BrowserMultiFormatReader, DecodeHintType } = await import("@zxing/library");
          const hints = new Map();
          hints.set(DecodeHintType.TRY_HARDER, true);
          const reader = new BrowserMultiFormatReader(hints);
          readerRef.current = reader;

          const scanLoop = async () => {
            if (!active || !videoRef.current) return;
            // Only perform continuous barcode detection when in barcode mode
            if (scanMode === "barcode" && videoRef.current.videoWidth > 0) {
              try {
                // @ts-ignore
                if ('BarcodeDetector' in window) {
                  // @ts-ignore
                  const barcodeDetector = new window.BarcodeDetector();
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes.length > 0 && active) {
                    active = false;
                    try { navigator.vibrate && navigator.vibrate(50); } catch (e) {}
                    
                    let frameData = "";
                    try {
                      const canvas = document.createElement("canvas");
                      canvas.width = videoRef.current.videoWidth;
                      canvas.height = videoRef.current.videoHeight;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0);
                        frameData = canvas.toDataURL("image/jpeg", 0.85);
                      }
                    } catch (e) {
                      console.warn("Failed to capture barcode frame", e);
                    }

                    onBarcodeDetected(barcodes[0].rawValue, frameData);
                    return;
                  }
                } else {
                  const res = await reader.decodeFromVideoElement(videoRef.current);
                  if (res && active) {
                    active = false;
                    try { navigator.vibrate && navigator.vibrate(50); } catch (e) {}
                    
                    let frameData = "";
                    try {
                      const canvas = document.createElement("canvas");
                      canvas.width = videoRef.current.videoWidth;
                      canvas.height = videoRef.current.videoHeight;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0);
                        frameData = canvas.toDataURL("image/jpeg", 0.85);
                      }
                    } catch (e) {
                      console.warn("Failed to capture barcode frame", e);
                    }
                    
                    onBarcodeDetected(res.getText(), frameData);
                    return;
                  }
                }
              } catch (err) {
                // Ignore NotFoundException, keep scanning
              }
            }
            if (active) {
              setTimeout(scanLoop, 500);
            }
          };
          scanLoop();
        }
      } catch (err) {
        console.warn("Live camera access failed, falling back to native UI", err);
        setStreamActive(false);
      }
    }

    if (paused) {
      setStreamActive(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      startCamera();
    }, 450);

    return () => {
      clearTimeout(timeoutId);
      active = false;
      if (readerRef.current) {
        readerRef.current.reset();
      }
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [onBarcodeDetected, paused, scanMode]);

  // Capture current live video frame
  const captureFrame = () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      const maxDim = 1024;
      let width = videoRef.current.videoWidth || 1280;
      let height = videoRef.current.videoHeight || 720;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setIsProcessing(false);
        onImageCaptured(dataUrl, scanMode);
      }
    } catch (e) {
      console.error("Frame capture error:", e);
      setIsProcessing(false);
    }
  };

  // Handle native Capacitor camera (for devices without live WebRTC stream)
  const handleCapacitorCamera = async () => {
    try {
      let perms = await CapCamera.checkPermissions();
      if (perms.camera !== 'granted') {
        perms = await CapCamera.requestPermissions();
      }
      if (perms.camera !== 'granted') {
        alert("Camera permission is needed to photograph food.");
        return;
      }
      setIsProcessing(true);
      const photo = await CapCamera.getPhoto({
        quality: 85,
        width: 1024,
        height: 1024,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      setIsProcessing(false);
      if (photo.dataUrl) {
        onImageCaptured(photo.dataUrl, scanMode);
      }
    } catch (e: any) {
      setIsProcessing(false);
      if (e.message && (e.message.includes('cancelled') || e.message.includes('User cancelled'))) return;
      alert("Camera error: " + (e.message || "Unknown error"));
    }
  };

  // Open native photo gallery to select a food/product photo
  const handleGalleryPicker = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
        setIsProcessing(true);
        const photo = await CapCamera.getPhoto({
          quality: 85,
          width: 1024,
          height: 1024,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos
        });
        setIsProcessing(false);
        if (photo.dataUrl) {
          onImageCaptured(photo.dataUrl, "food");
          return;
        }
      }
      galleryInputRef.current?.click();
    } catch (e: any) {
      setIsProcessing(false);
      if (e.message && (e.message.includes('cancelled') || e.message.includes('User cancelled'))) return;
      console.warn("Gallery error:", e);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onImageCaptured(reader.result as string, "food");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col px-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInputChange}
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={galleryInputRef}
        onChange={handleFileInputChange}
      />

      <div className="flex flex-col items-center text-center mt-1 relative w-full">
        {/* Mode Selector Segmented Control */}
        <div 
          className="flex items-center gap-1 p-1 rounded-full mb-3 shadow-sm"
          style={{ 
            background: "var(--glass-bg-elevated)", 
            border: "1px solid rgba(0,0,0,0.06)",
            backdropFilter: "blur(12px)"
          }}
        >
          <button
            type="button"
            onClick={() => setScanMode("food")}
            className={`px-4 py-2 rounded-full text-[13px] font-black transition-all flex items-center gap-1.5 ${
              scanMode === "food"
                ? "bg-[var(--accent-main)] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Camera size={15} /> Food & Product Photo
          </button>
          <button
            type="button"
            onClick={() => setScanMode("barcode")}
            className={`px-4 py-2 rounded-full text-[13px] font-black transition-all flex items-center gap-1.5 ${
              scanMode === "barcode"
                ? "bg-[var(--accent-main)] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ScanBarcode size={15} /> Barcode
          </button>
        </div>

        <p className="text-[12px] font-semibold px-4 mb-3 leading-snug" style={{ color: "var(--text-secondary)" }}>
          {scanMode === "food"
            ? "Point camera at any food, cooked meal, fruit, or packaging and tap Shutter"
            : "Point camera at product barcode for instant identification"}
        </p>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-[4/5] max-h-[55vh] flex items-center justify-center rounded-[32px] overflow-hidden bg-black/5" style={{ boxShadow: "inset 0 4px 20px rgba(0,0,0,0.05)" }}>
          
          <video 
            ref={videoRef} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${streamActive ? 'opacity-100' : 'opacity-0'}`} 
            autoPlay muted playsInline 
          />
          
          {/* Framing Guides */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-8 pb-32">
            <div className={`relative w-full h-full ${scanMode === "barcode" ? "max-w-[280px] max-h-[200px]" : "max-w-[300px] max-h-[300px]"}`}>
              <div className="absolute w-10 h-10 border-t-4 border-l-4 rounded-tl-[24px] top-0 left-0" style={{ borderColor: "var(--accent-main)" }} />
              <div className="absolute w-10 h-10 border-t-4 border-r-4 rounded-tr-[24px] top-0 right-0" style={{ borderColor: "var(--accent-main)" }} />
              <div className="absolute w-10 h-10 border-b-4 border-l-4 rounded-bl-[24px] bottom-0 left-0" style={{ borderColor: "var(--accent-main)" }} />
              <div className="absolute w-10 h-10 border-b-4 border-r-4 rounded-br-[24px] bottom-0 right-0" style={{ borderColor: "var(--accent-main)" }} />
              
              {/* Animated laser line in barcode mode */}
              {scanMode === "barcode" && streamActive && !isProcessing && (
                <motion.div 
                  animate={{ y: [0, 180, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="absolute top-2 left-0 w-full h-[2px] shadow-[0_0_12px_3px_rgba(0,122,255,0.6)]"
                  style={{ background: "var(--accent-main)" }}
                />
              )}
            </div>
          </div>

          {!streamActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
              <Camera size={36} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "12px" }} />
              <p className="text-[13px] font-bold" style={{ color: "var(--text-muted)" }}>Tap Shutter to open camera</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
              <Loader2 size={36} className="animate-spin mb-3 text-[var(--accent-main)]" />
              <p className="text-[14px] font-black text-gray-800">
                {scanMode === "food" ? "Analyzing Food Photo with AI..." : "Decoding Barcode..."}
              </p>
            </div>
          )}

          {/* Bottom gradient overlay for shutter controls */}
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/75 to-transparent pointer-events-none z-10" />

          {/* Controls Bar */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 z-20 px-6">
            
            {/* Gallery Upload Button */}
            <button
              type="button"
              onClick={handleGalleryPicker}
              title="Upload Food Photo from Gallery"
              className="w-13 h-13 rounded-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              style={{
                width: "52px",
                height: "52px",
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(255,255,255,0.4)"
              }}
            >
              <ImageIcon size={22} className="text-white" />
            </button>

            {/* Main Shutter Button */}
            {streamActive ? (
              <button
                type="button"
                onClick={captureFrame}
                disabled={isProcessing}
                className="relative w-[76px] h-[76px] rounded-full flex items-center justify-center active:scale-[0.95] transition-transform disabled:opacity-50"
                style={{
                  background: "rgba(255, 255, 255, 0.3)",
                  border: "4px solid var(--accent-main)"
                }}
              >
                <div 
                  className="w-[58px] h-[58px] rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--accent-main) 0%, #FF8E9C 100%)" }}
                >
                  <Camera size={26} className="text-white" />
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCapacitorCamera}
                disabled={isProcessing}
                className="relative w-[76px] h-[76px] rounded-full flex flex-col items-center justify-center active:scale-[0.95] transition-transform disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, var(--accent-main) 0%, #FF8E9C 100%)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  border: "3px solid white"
                }}
              >
                {isProcessing ? (
                  <Loader2 size={26} className="animate-spin text-white" />
                ) : (
                  <Camera size={28} className="text-white mb-0.5" />
                )}
              </button>
            )}

            {/* Manual Text Search Button */}
            <button
              type="button"
              onClick={() => {
                const input = prompt("Enter food name or barcode:");
                if (input && input.trim()) {
                  setIsProcessing(true);
                  const isBarcode = /^\d+$/.test(input.trim()) && (input.trim().length >= 8 && input.trim().length <= 18);
                  if (isBarcode) {
                    api.analyzeBarcode(input.trim())
                      .then(res => onResult(res))
                      .catch(e => alert("Barcode lookup failed: " + e.message))
                      .finally(() => setIsProcessing(false));
                  } else {
                    api.analyzeText("search", input.trim())
                      .then(res => onResult(res))
                      .catch(e => alert("Analysis failed: " + e.message))
                      .finally(() => setIsProcessing(false));
                  }
                }
              }}
              title="Search Food by Name"
              className="w-13 h-13 rounded-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              style={{
                width: "52px",
                height: "52px",
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(255,255,255,0.4)"
              }}
            >
              <Search size={22} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
