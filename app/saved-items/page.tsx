"use client";
import { onAuthStateChanged } from "firebase/auth";
import { format, parseISO } from "date-fns";
import "../main.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { ToastContainer } from "react-toastify";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const handleCopy = (pgnData: string) => {
    navigator.clipboard.writeText(pgnData || "No Data Loaded");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200); // revert after animation
  };
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
      {userInfo.images && userInfo.images.length > 0 ? (
        <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen">
          <div className="mx-auto min-h-[calc(100vh-32px)] bg-[#182138] p-8 rounded-[20px] max-w-[800px]">
            <h1 className="text-3xl font-bold mb-6 text-white">Saved Images</h1>

            <Button
              onClick={() => router.push("/")}
              className="w-full mb-2 text-lg bg-blue-600"
            >
              Go Back Home
            </Button>
            <div className="">
              {userInfo.images.map((url: string, index: number) => (
                <div
                  key={(index + 1) * Math.sqrt(index)}
                  className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div
                    key={index}
                    className="border p-2 text-white border-white rounded-lg overflow-hidden"
                  >
                    Image uploaded at{" "}
                    {format(
                      parseISO(userInfo.dates_uploaded[index]),
                      "M/d/yy 'at' h:mm:ss a"
                    )}
                    <img
                      src={url}
                      alt={`Saved Image ${index + 1}`}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div
                    key={(index + 1) * Math.PI}
                    className="border mb-4 border-white text-white p-2 rounded-lg bg-blue-500/20 overflow-hidden"
                  >
                    PGN parsed at{" "}
                    {format(
                      parseISO(userInfo.dates_uploaded[index]),
                      "M/d/yy 'at' h:mm:ss a"
                    )}
                    <pre className="whitespace-pre-wrap mt-1 p-4 bg-[#182138] rounded-lg text-white">
                      {userInfo.pgns[index]}
                    </pre>
                    <span
                      onClick={() => handleCopy(userInfo.pgns[index])}
                      className={copied ? "fade-out" : "fade-in"}
                    >
                      {copied ? (
                        <Check color="white" className="ml-auto mt-2" />
                      ) : (
                        <Copy color="white" className="ml-auto mt-2" />
                      )}
                    </span>
                  </div>
                </div>
              ))}
              {/* {userInfo.pgns.map((pgn: string, index: number) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded-lg overflow-hidden"
                >
                  <pre className="whitespace-pre-wrap p-4 bg-[#182138] rounded-lg text-white">
                    {pgn}
                  </pre>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen">
          <div className="mx-auto min-h-[calc(100vh-32px)] bg-[#182138] p-8 rounded-[20px] max-w-[800px] flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6 text-white">
              No Saved Images
            </h1>
            <Button
              onClick={() => router.push("/")}
              className="w-full mb-2 text-lg bg-blue-500/20"
            >
              Go Back Home
            </Button>
            <p className="text-white text-center">
              You have not saved any images yet. Start uploading your chess
              scoresheets to see them here!
            </p>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen">
      <div className="mx-auto min-h-[calc(100vh-32px)] bg-[#182138] p-8 rounded-[20px] max-w-[800px]"></div>
    </div>
  );
}
function setValue(arg0: any) {
  throw new Error("Function not implemented.");
}
