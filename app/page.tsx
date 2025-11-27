"use client";
import { useState, useRef } from "react";
import { ChessQueen, Plus, User } from "lucide-react";
import "./main.css";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Cannot access camera");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setCapturedImage(dataUrl);
    }
  };

  const uploadImage = async () => {
    if (!capturedImage) return;
    setUploading(true);
    try {
      const base64 = capturedImage.split(",")[1]; // remove data:image/png;base64,
      const res = await fetch("http://127.0.0.1:5000/upload_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_base64: base64 }),
      });
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen">
      <div className="mx-auto min-h-[calc(100vh-32px)] bg-[#182138] p-8 rounded-[20px] max-w-[800px]">
        <div className="flex flex-row items-center">
          <div className="bg-blue-500/30 rounded-full p-2">
            <ChessQueen color="#8ec5ff" size={30} />
          </div>
          <h1 className="text-white font-bold ml-2 text-2xl">
            Chess<span className="text-[#7BADF9]">Tourney</span>
          </h1>
          <div className="bg-blue-500/30 ml-auto rounded-full p-2">
            <User color="#8ec5ff" size={30} />
          </div>
        </div>

        {/* Search Tournaments */}
        <div className="bg-blue-500/20 mt-6 p-4 rounded-xl">
          <h1 className="font-bold mb-4 text-2xl text-white">
            Search Tournaments
          </h1>
          <Input
            type="text"
            className="h-[50px] text-white bg-[#0E192A] placeholder-white
             focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none"
            placeholder="Enter Tournament Code Here..."
          />
        </div>

        {/* Tournaments Section */}
        <div className="bg-blue-500/20 mt-6 p-4 rounded-xl">
          <h1 className="font-bold mb-2 text-2xl text-white">Tournaments</h1>
        </div>

        {/* Player List Section */}
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

        {/* Scan Scoresheet Section */}
        <div
          onClick={startCamera}
          className="mt-6 p-4 rounded-xl bg-linear-gradient-to-br from-[#203F74] to-[#8EC4FE] cursor-pointer"
        >
          <h1 className="font-bold text-2xl text-center text-white">
            Scan Scoresheet
          </h1>
        </div>

        {/* Camera Preview */}
        {streaming && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <video
              ref={videoRef}
              className="rounded-lg border-2 border-[#7BADF9]"
              autoPlay
              playsInline
              style={{ maxWidth: "100%" }}
            />
            <div className="flex gap-4">
              <button
                onClick={capturePhoto}
                className="bg-[#7BADF9] text-[#0E192A] px-4 py-2 rounded-lg font-bold"
              >
                Capture
              </button>
              {capturedImage && (
                <button
                  onClick={uploadImage}
                  disabled={uploading}
                  className="bg-[#557BFF] text-white px-4 py-2 rounded-lg font-bold"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
