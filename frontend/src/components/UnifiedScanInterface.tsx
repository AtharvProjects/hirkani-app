"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, ScanBarcode, FileText, ChevronRight, Loader2 } from "lucide-react";
import { api, ScanResult } from "@/lib/api";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { BrowserMultiFormatReader, DecodeHintType } from "@zxing/library";

interface UnifiedScanInterfaceProps {
  onBarcodeDetected: (code: string, frameData?: string) => void;
  onImageCaptured: (file: File) => void;
  onResult: (result: ScanResult) => void;
  paused?: boolean;
}

export function UnifiedScanInterface({
  onBarcodeDetected,
  onImageCaptured,
  onResult,
  paused = false,
}: UnifiedScanInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
          setStreamActive(true);

          const hints = new Map();
          hints.set(DecodeHintType.TRY_HARDER, true);
          const reader = new BrowserMultiFormatReader(hints);
          readerRef.current = reader;

          const scanLoop = async () => {
            if (!active || !videoRef.current) return;
            if (videoRef.current.videoWidth > 0) {
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
                        frameData = canvas.toDataURL("image/jpeg", 0.8);
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
                  
                  // Capture the exact frame where the barcode was found for AI Vision fallback
                  let frameData = "";
                  try {
                    const canvas = document.createElement("canvas");
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(videoRef.current, 0, 0);
                      frameData = canvas.toDataURL("image/jpeg", 0.8);
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

    startCamera();

    return () => {
      active = false;
      if (readerRef.current) {
        readerRef.current.reset();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [onBarcodeDetected, paused]);

  const captureFrame = () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "live_capture.jpg", { type: "image/jpeg" });
          setIsProcessing(false);
          onImageCaptured(file);
        }
      }, "image/jpeg", 0.9);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageCaptured(e.target.files[0]);
    }
  };

  const handleCapacitorCamera = async () => {
    try {
      let perms = await CapCamera.checkPermissions();
      if (perms.camera !== 'granted') {
        perms = await CapCamera.requestPermissions();
      }
      if (perms.camera !== 'granted') {
        alert("Camera access is needed to scan food items.");
        return;
      }
      const photo = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (photo.webPath) {
        setIsProcessing(true);
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setIsProcessing(false);
        onImageCaptured(file);
      }
    } catch (e: any) {
      setIsProcessing(false);
      if (e.message && (e.message.includes('cancelled') || e.message.includes('User cancelled'))) return;
      alert("Camera error: " + (e.message || "Unknown error"));
    }
  };

  return (
    <div className="w-full flex flex-col px-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleCameraCapture}
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={galleryInputRef}
        onChange={handleCameraCapture}
      />

      <div className="flex flex-col items-center text-center mt-2 relative w-full">
        <h3 className="text-[18px] font-black font-display tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>Smart Scanner</h3>
        <p className="text-[13px] font-medium px-4 mb-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {streamActive ? "Auto-detecting... or tap the button to snap a photo." : "Tap Open Scanner to use the native camera."}
        </p>

        <div className="relative w-full aspect-[4/5] max-h-[55vh] flex items-center justify-center rounded-[32px] overflow-hidden bg-black/5" style={{ boxShadow: "inset 0 4px 20px rgba(0,0,0,0.05)" }}>
          
          <video 
            ref={videoRef} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${streamActive ? 'opacity-100' : 'opacity-0'}`} 
            autoPlay muted playsInline 
          />
          
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-8 pb-32">
            <div className="relative w-full h-full max-w-[280px] max-h-[280px]">
              <div className="absolute w-10 h-10 border-t-4 border-l-4 rounded-tl-[24px] top-0 left-0" style={{ borderColor: streamActive ? "var(--pink-hot)" : "rgba(244,88,122,0.3)" }} />
              <div className="absolute w-10 h-10 border-t-4 border-r-4 rounded-tr-[24px] top-0 right-0" style={{ borderColor: streamActive ? "var(--pink-hot)" : "rgba(244,88,122,0.3)" }} />
              <div className="absolute w-10 h-10 border-b-4 border-l-4 rounded-bl-[24px] bottom-0 left-0" style={{ borderColor: streamActive ? "var(--pink-hot)" : "rgba(244,88,122,0.3)" }} />
              <div className="absolute w-10 h-10 border-b-4 border-r-4 rounded-br-[24px] bottom-0 right-0" style={{ borderColor: streamActive ? "var(--pink-hot)" : "rgba(244,88,122,0.3)" }} />
              
              {streamActive && !isProcessing && (
                <motion.div 
                  animate={{ y: [0, 240, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute top-2 left-0 w-full h-[2px] shadow-[0_0_12px_3px_rgba(244,88,122,0.6)]"
                  style={{ background: "var(--pink-hot)" }}
                />
              )}
            </div>
          </div>

          {!streamActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
              <Camera size={32} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "12px" }} />
              <p className="text-[13px] font-bold" style={{ color: "var(--text-muted)" }}>Camera starting...</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
              <Loader2 size={32} className="animate-spin mb-3" style={{ color: "var(--pink-hot)" }} />
              <p className="text-[14px] font-black" style={{ color: "var(--text-primary)" }}>Analyzing...</p>
            </div>
          )}

          {/* Gradient overlay at bottom for button visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />

          {/* Floating Buttons */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 z-20 px-6">
            
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.4)"
              }}
            >
              <ImageIcon size={22} className="text-white" />
            </button>

            {streamActive ? (
              <button
                onClick={captureFrame}
                disabled={isProcessing}
                className="relative w-[76px] h-[76px] rounded-full flex items-center justify-center active:scale-[0.95] transition-transform disabled:opacity-50"
                style={{
                  background: "rgba(244,88,122,0.2)",
                  border: "4px solid var(--pink-hot)"
                }}
              >
                <div className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--pink-hot) 0%, #ff8f8f 100%)" }}>
                  <Camera size={24} className="text-white" />
                </div>
              </button>
            ) : (
              <button
                onClick={handleCapacitorCamera}
                disabled={isProcessing}
                className="relative w-[76px] h-[76px] rounded-full flex flex-col items-center justify-center active:scale-[0.95] transition-transform disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, var(--pink-hot) 0%, #ff8f8f 100%)",
                  boxShadow: "0 8px 24px rgba(244,88,122,0.4)",
                  border: "2px solid rgba(255,255,255,0.3)"
                }}
              >
                {isProcessing ? <Loader2 size={24} className="animate-spin text-white" /> : <ScanBarcode size={28} className="text-white mb-0.5" />}
              </button>
            )}

            <button
              onClick={() => {
                const input = prompt("Enter barcode or food name to search manually:");
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
              className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.4)"
              }}
            >
              <FileText size={22} className="text-white" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
