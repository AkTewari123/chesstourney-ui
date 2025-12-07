"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  ChessKing,
  ChessQueen,
  Copy,
  Plus,
  User,
  X,
} from "lucide-react"; // Import 'X' icon for closing
import "./main.css";
import { Input } from "@/components/ui/input";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function Home() {
  // New state to control the visibility of the modal/popup
  const [modalOpen, setModalOpen] = useState(false);

  // Existing states
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to stop the camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStreaming(false);
    }
  };

  // --- NEW: Function to close the modal ---
  const closeModal = () => {
    stopCamera(); // Essential: Stop the camera first
    setCapturedImage(null); // Clear any preview image
    setModalOpen(false); // Close the modal
  };

  // --- MODIFIED STARTCAMERA ---
  // This function now opens the modal and sets streaming state
  const openModalAndStartCamera = (
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (event) event.preventDefault();
    setCapturedImage(null);
    setModalOpen(true); // Open the popup
    setStreaming(true); // Set streaming to true to trigger camera setup
  };
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pgnData || "No Data Loaded");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200); // revert after animation
  };
  // --- USEEFFECT HOOK (Camera Setup) ---
  useEffect(() => {
    if (streaming && videoRef.current) {
      let isCancelled = false;

      const setupCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
          alert("Camera API not supported");
          setStreaming(false);
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          if (isCancelled) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
            };
          }
        } catch (err: any) {
          if (!isCancelled) {
            console.error("Error accessing camera:", err);
            alert("Cannot access camera: " + err.message);
            // On error, stop streaming and close the modal
            setStreaming(false);
            setModalOpen(false);
          }
        }
      };

      setupCamera();

      return () => {
        isCancelled = true;
        stopCamera();
      };
    }
  }, [streaming]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      setCapturedImage(canvasRef.current.toDataURL("image/png"));

      // Stop the streaming, but KEEP THE MODAL OPEN to show the preview
      setStreaming(false);
    }
  };
  const [pgnData, setPgnData] = useState("");
  const uploadImage = async () => {
    if (!capturedImage) return;
    setUploading(true);
    try {
      const base64 = capturedImage.split(",")[1];
      console.log(base64);
      const res = await fetch("https://pgnserver-ocr.vercel.app/upload_image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64 }),
      });
      const data = await res.json();
      console.log("Upload response:", data);
      setPgnData(data.pgn || "No PGN data received");
      // Close modal on successful upload
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setStreaming(true); // Restart camera inside the open modal
  };

  // --- MODAL COMPONENT (Rendered conditionally) ---
  const CameraModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="relative bg-[#182138] p-6 rounded-xl w-full max-w-lg shadow-2xl">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-2 rounded-full bg-red-500/20 text-white hover:bg-red-500/30 transition-colors"
          aria-label="Close camera"
        >
          <X size={24} />
        </button>

        <h2 className="text-white text-2xl font-bold mb-4">
          {streaming
            ? "Scanning Scoresheet"
            : capturedImage
            ? "Review Photo"
            : "Camera Initializing"}
        </h2>

        {/* Video feed (only visible when streaming) */}
        {streaming && (
          <div className="flex flex-col items-center gap-4 w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="rounded-lg border-2 border-[#7BADF9] w-full"
              style={{
                display: "block",
                width: "100%",
                height: "350px",
                objectFit: "cover",
              }}
            />
            <button
              onClick={capturePhoto}
              className="bg-[#7BADF9] text-[#0E192A] px-6 py-3 rounded-lg font-bold text-lg w-full"
            >
              Capture Photo
            </button>
          </div>
        )}

        {/* Preview and Upload Buttons (only visible after capture) */}
        {capturedImage && !streaming && (
          <div className="flex flex-col items-center gap-4 w-full">
            <img
              src={capturedImage}
              alt="Captured scoresheet"
              className="rounded-lg border-2 border-[#7BADF9] w-full"
            />
            <div className="flex gap-4 mt-2 w-full">
              <button
                onClick={retakePhoto}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold w-1/2 hover:bg-gray-600"
              >
                Retake
              </button>
              <button
                onClick={uploadImage}
                disabled={uploading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold w-1/2 hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload & Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <>
      <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen">
        <div className="mx-auto min-h-[calc(100vh-32px)] bg-[#182138] p-8 rounded-[20px] max-w-[800px]">
          {/* Header */}
          <div className="flex flex-row items-center">
            <div className="bg-blue-500/30 rounded-full p-2">
              <ChessQueen color="#8ec5ff" size={30} />
            </div>
            <h1 className="text-white font-bold ml-2 text-2xl">
              Chess<span className="text-[#7BADF9]">Tourney</span>
            </h1>
            <div
              onClick={async () => {
                await signOut(auth);
                window.location.href = "/login";
              }}
              className="bg-blue-500/30 cursor-pointer ml-auto rounded-full p-2"
            >
              <User color="#8ec5ff" size={30} />
            </div>
          </div>

          {/* Search, Tournaments, Player List Sections... (unchanged) */}
          <div className="bg-blue-500/20 mt-6 p-4 rounded-xl">
            <h1 className="font-bold mb-4 text-2xl text-white">
              Search Tournaments
            </h1>
            <Input
              type="text"
              className="h-[50px] text-white bg-[#0E192A] placeholder-white focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none"
              placeholder="Enter Tournament Code Here..."
            />
          </div>
          <div className="bg-blue-500/20 mt-6 p-4 rounded-xl">
            <h1 className="font-bold mb-2 text-2xl text-white">Tournaments</h1>
          </div>
          <div className="bg-blue-500/20 mt-6 p-4 rounded-xl">
            <div className="flex flex-row">
              <h1 className="font-bold text-2xl text-white">Player List</h1>
              <div className="bg-[#7BADF9] rounded-full h-[37px] ml-auto p-1.5">
                <Plus
                  onClick={() => (window.location.href = "/add-player")}
                  color="#0E192A"
                  size={24}
                  strokeWidth={3}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = "/sync-lichess")}
            className="mt-6 p-4 rounded-xl text-white bg-blue-500/20 font-bold text-2xl w-full"
          >
            Sync Lichess Account
          </button>
          <p className="text-gray-300 mt-1">
            After you're done scanning, you can sync your Lichess account to
            upload games to your studies directly! This will only work if you
            are signed in.
          </p>
          {/* Scan Scoresheet button (Only visible when modal is closed) */}
          {!modalOpen && (
            <button
              onClick={openModalAndStartCamera}
              className="mt-6 p-4 rounded-xl text-black bg-white font-bold text-2xl w-full"
            >
              Scan Scoresheet
            </button>
          )}

          {pgnData && (
            <div className="bg-blue-500/20 mt-6 p-4 rounded-xl">
              <h2 className="font-bold mb-2 text-2xl text-white">
                Extracted PGN Data
              </h2>
              <pre className="whitespace-pre-wrap p-4 bg-[#182138] rounded-lg text-white">
                {pgnData}
              </pre>
              <div className="flex justify-end mt-4">
                <button onClick={handleCopy} className="icon-btn">
                  <span className={copied ? "fade-out" : "fade-in"}>
                    {copied ? <Check color="white" /> : <Copy color="white" />}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>

      {/* Conditional rendering of the modal */}
      {modalOpen && <CameraModal />}
    </>
  );
}
