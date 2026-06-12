"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, ScanBarcode, FileText, UploadCloud, ChevronRight, Loader2 } from "lucide-react";
import { api, ScanResult } from "@/lib/api";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";

interface UnifiedScanInterfaceProps {
  onBarcodeDetected: (code: string) => void;
  onImageCaptured: (file: File) => void;
  onResult: (result: ScanResult) => void;
}

export function UnifiedScanInterface({
  onBarcodeDetected,
  onImageCaptured,
  onResult,
}: UnifiedScanInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "barcode" | "text">("camera");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageCaptured(e.target.files[0]);
    }
  };

  const handleCapacitorCamera = async () => {
    try {
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
      console.log("Camera error:", e);
    }
  };

  const handleManualBarcode = async () => {
    if (!barcodeInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await api.analyzeBarcode(barcodeInput.trim());
      onResult(res);
      setBarcodeInput("");
    } catch (e: any) {
      alert("Barcode lookup failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualText = async () => {
    if (!textInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await api.analyzeText("ocr", textInput.trim());
      onResult(res);
      setTextInput("");
    } catch (e: any) {
      alert("Analysis failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col px-4">
      {/* Hidden file inputs for camera and gallery */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
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

      {/* Segmented Control / Tabs */}
      <div className="flex w-full bg-white/40 p-1 rounded-2xl shadow-sm border border-white/60 mb-6 backdrop-blur-xl relative">
        {["camera", "barcode", "text"].map((tab) => {
          const isActive = activeTab === tab;
          let icon = null;
          if (tab === "camera") icon = <Camera size={16} />;
          if (tab === "barcode") icon = <ScanBarcode size={16} />;
          if (tab === "text") icon = <FileText size={16} />;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`relative flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors z-10 ${
                isActive ? "text-[var(--pink-hot)]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-white/80"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {icon}
                <span className="capitalize">{tab}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Area */}
      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait">
          {/* CAMERA TAB */}
          {activeTab === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col items-center text-center mb-2">
                <div className="h-16 w-16 bg-gradient-to-tr from-[var(--pink-hot)] to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-pink-200 mb-4">
                  <Camera size={28} className="text-white" />
                </div>
                <h3 className="text-[17px] font-bold text-gray-800">Smart Camera Scan</h3>
                <p className="text-[14px] text-gray-500 font-medium px-4 mt-1">
                  Point your camera at a barcode, nutrition label, or the food itself.
                </p>
              </div>

              <button
                onClick={handleCapacitorCamera}
                disabled={isProcessing}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[var(--pink-hot)] to-[#ff8f8f] text-white rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-[16px] shadow-[0_8px_20px_rgba(244,88,122,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={22} className="animate-spin" /> : <ScanBarcode size={22} />}
                <span>{isProcessing ? "Processing..." : "Open Camera"}</span>
                {!isProcessing && <div className="absolute top-0 left-0 w-full h-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-gray-200"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">OR</span>
                <div className="h-[1px] flex-1 bg-gray-200"></div>
              </div>

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full bg-white text-gray-700 border border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-[16px] shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <ImageIcon size={22} className="text-[var(--pink-hot)]" />
                <span>Choose Photo from Gallery</span>
              </button>
            </motion.div>
          )}

          {/* BARCODE TAB */}
          {activeTab === "barcode" && (
            <motion.div
              key="barcode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 bg-white/60 p-6 rounded-3xl border border-white/80 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[var(--pink-hot)]/10 rounded-xl">
                  <ScanBarcode size={20} className="text-[var(--pink-hot)]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-800">Enter Barcode</h3>
              </div>
              
              <p className="text-[13px] text-gray-500 font-medium">
                Type the numbers exactly as they appear below the barcode on the package.
              </p>

              <div className="relative mt-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="e.g. 012345678905"
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 text-[16px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--pink-hot)]/30 focus:border-[var(--pink-hot)] shadow-sm transition-all"
                />
              </div>

              <button
                onClick={handleManualBarcode}
                disabled={!barcodeInput.trim() || isProcessing}
                className="w-full mt-2 bg-gray-900 text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-gray-800 disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-all"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <span>Analyze Barcode</span>}
                {!isProcessing && <ChevronRight size={18} />}
              </button>
            </motion.div>
          )}

          {/* TEXT OCR TAB */}
          {activeTab === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 bg-white/60 p-6 rounded-3xl border border-white/80 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[var(--pink-hot)]/10 rounded-xl">
                  <FileText size={20} className="text-[var(--pink-hot)]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-800">Ingredients Text</h3>
              </div>
              
              <p className="text-[13px] text-gray-500 font-medium">
                Paste copied ingredients text or manually type the contents to check for pregnancy safety.
              </p>

              <div className="relative mt-2">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste ingredients here..."
                  rows={4}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--pink-hot)]/30 focus:border-[var(--pink-hot)] shadow-sm transition-all resize-none"
                />
              </div>

              <button
                onClick={handleManualText}
                disabled={!textInput.trim() || isProcessing}
                className="w-full mt-2 bg-gradient-to-r from-[var(--pink-hot)] to-[#ff8f8f] text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-[15px] shadow-md hover:shadow-lg disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-all"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <span>Analyze Ingredients</span>}
                {!isProcessing && <ChevronRight size={18} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
