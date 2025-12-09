"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  CheckIcon,
  ChessKing,
  ChessQueen,
  ChevronsUpDownIcon,
  Copy,
  LogOut,
  Plus,
  User,
  X,
} from "lucide-react"; // Import 'X' icon for closing
import "./main.css";
import { Input } from "@/components/ui/input";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { formatString } from "@/functions/formatString";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [orientation, setOrientation] = useState("");

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        getDoc(doc(db, "users", `${user.displayName}`)).then(
          async (docSnap) => {
            if (docSnap.exists()) {
              setUserInfo(docSnap.data());
              try {
                axios
                  .get(
                    `https://lichess.org/api/study/by/${
                      docSnap.data()["lichessId"]
                    }`,
                    {
                      headers: {
                        Authorization: `Bearer ${
                          docSnap.data()["lichessToken"]
                        }`,
                      },
                    }
                  )
                  .then(async (data) => {
                    const writeData = formatString(
                      JSON.parse(JSON.stringify(data.data))
                    );
                    console.log(writeData);
                    console.log(typeof writeData);
                    await updateDoc(doc(db, "users", `${user.displayName}`), {
                      studies: writeData,
                    });
                    setValue(userInfo?.lastUploadedStudy || "");
                  })
                  .catch((error) => {
                    toast.info(
                      "Error fetching studies from Lichess, sync your account to automatically upload your PGN to a study."
                    );
                  });
                console.log("Fetched user data:", docSnap.data());
              } catch (error) {
                toast(
                  "Error fetching studies from Lichess, sync your account to automatically upload your PGN to a study."
                );
              }
            } else {
              setUserInfo(null);
              window.alert("No user data found!");
              window.location.href = "/login";
            }
          }
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // New state to control the visibility of the modal/popup
  const [modalOpen, setModalOpen] = useState(false);

  // Existing states
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {}, []);
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
  const [pgnData, setPgnData] = useState(
    "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Na4 c5 16. dxe5 Nxe4 17. Bxe7 Qxe7 18. exd6 Qf6 19. Bd5 Nxd6 20. Bxb7 Nxb7 21. Qxd7 Nd6 22. Nxc5 Rfd8 23. Qg4 Qxb2 24. Reb1 Qc3 25. Ne4 Nxe4 26. Qxe4 Rab8 27. Ng5 g6 28. Qe7 Rf8 29. Ne4 Qd4 30. Rd1 Qb2 31. Rab1 Qxa2 32. Rxb4 Rxb4 33. Qxb4 Qe6 34. Rd6 Qe5 35. Nf6+ Kg7 36. Nd7 Qa1+ 37. Kh2 Re8 38. Qf4 f5 39. Nc5 Re7 40. Ne6+ Kf7 41. Ng5+ Kg7 42. Qh4 h6 43. Ne6+ Kf7 44. Nd8+ Ke8 45. Nc6 g5 46. Qxh6 Re1 47. Rd8+ Kf7 48. Rf8#"
  );
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
  return user && userInfo ? (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="font-satoshi"
      />
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
              className="bg-blue-500/30 relative text-[#8ec5ff] flex items-center gap-2 text-2xl   cursor-pointer ml-auto rounded-full p-2"
            >
              <p>Logout </p>
              <LogOut color="#8ec5ff" className="inline" size={24} />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative text-[#8ec5ff] gap-2 text-2xl mx-auto rounded-full mt-1">
              <User color="#8ec5ff" className="inline mb-1 mr-1" size={24} />
              <span>Welcome, {user.displayName}!</span>
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
              <div>
                {userInfo.lichessId && userInfo.lichessToken ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-4">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-60 h-[50px] justify-between"
                          >
                            {value
                              ? `${
                                  Object.entries(userInfo.studies).find(
                                    ([id]) => id === value
                                  )?.[1]
                                }`
                              : "Select a study"}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-60 p-0">
                          <Command>
                            <CommandInput placeholder="Search..." />
                            <CommandList>
                              <CommandEmpty>No studies found.</CommandEmpty>
                              <CommandGroup>
                                {Object.entries(userInfo.studies).map(
                                  ([id, name]) => (
                                    <CommandItem
                                      key={id}
                                      value={id}
                                      keywords={[String(name)]}
                                      onSelect={(currentValue) => {
                                        const newValue =
                                          currentValue === value
                                            ? ""
                                            : currentValue;
                                        setValue(newValue);
                                        setOpen(false);
                                        // onSelect?.(newValue); // lift the value up
                                      }}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          value === id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {String(name)}
                                    </CommandItem>
                                  )
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="text"
                        className="h-[50px] text-white bg-[#0E192A] placeholder-white focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none"
                        placeholder="Enter Chapter Name (Optional)"
                        id="chapter-name-input"
                      ></Input>
                      <Select
                        value={orientation}
                        onValueChange={(val) => setOrientation(val)}
                      >
                        <SelectTrigger className="w-[180px] h-[50px] text-white">
                          <SelectValue
                            placeholder="Select Orientation"
                            className="text-white"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Submit button only shows when something is selected */}
                    {value && (
                      <Button
                        onClick={async () => {
                          const params = new URLSearchParams();
                          params.append("pgn", pgnData);
                          if (document.getElementById("chapter-name-input")) {
                            const chapterNameInput = document.getElementById(
                              "chapter-name-input"
                            ) as HTMLInputElement;
                            if (chapterNameInput.value.trim() !== "") {
                              params.append(
                                "name",
                                chapterNameInput.value.trim()
                              );
                            }
                          }
                          if (orientation) {
                            if (orientation.trim() !== "") {
                              params.append("orientation", orientation.trim());
                              console.log(orientation + " orientation set");
                            }
                          }
                          console.log(userInfo.lichessToken);
                          await axios
                            .post(
                              `https://lichess.org/api/study/${value}/import-pgn`,
                              params, // body
                              {
                                headers: {
                                  "Content-Type":
                                    "application/x-www-form-urlencoded",
                                  Authorization: `Bearer ${userInfo.lichessToken}`,
                                },
                              }
                            )
                            .then((response) => {
                              (document.getElementById(
                                "lichess-redirect"
                              ) as HTMLAnchorElement)!.href = `https://lichess.org/study/${value}/${response.data.chapters[0].id}`;
                              (
                                document.getElementById(
                                  "lichess-redirect"
                                ) as HTMLAnchorElement
                              ).innerText = "View Uploaded Study on Lichess";
                              (
                                document.getElementById(
                                  "lichess-redirect"
                                ) as HTMLAnchorElement
                              ).classList.remove("hidden");
                              toast.success(
                                "PGN uploaded successfully! Click the button onscreen to go to that lichess chapter!"
                              );
                              updateDoc(
                                doc(db, "users", `${user.displayName}`),
                                {
                                  lastUploadedStudy: value,
                                }
                              );
                            })
                            .catch((error) => {
                              console.error(error);
                              toast.error("Failed to upload PGN.");
                            });
                        }}
                        type="submit"
                        className="w-full mb-4 text-lg px-4 mt-1 py-2 bg-blue-600 text-white"
                      >
                        Create Study Chapter
                      </Button>
                    )}
                    <a
                      id="lichess-redirect"
                      target="_blank"
                      className="bg-blue-500 mt-2 p-2 rounded-lg text-white hidden"
                    ></a>
                  </>
                ) : (
                  <p className="text-red-400 mt-2 text-sm">
                    Please sync your Lichess account to upload games to your
                    studies.
                  </p>
                )}
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
  ) : (
    <>
      <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen">
        <div className="mx-auto min-h-[calc(100vh-32px)] bg-[#182138] p-8 rounded-[20px] max-w-[800px]"></div>
      </div>
    </>
  );
}
