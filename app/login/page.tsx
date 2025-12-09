// src/pages/SignInPage.tsx
"use client";
import React, { useState } from "react";
import { ChessQueen, Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
// You will need to import these Firebase items:
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "../main.css";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/database";
// Assuming 'auth' is imported from your Firebase config:
import { auth, db } from "../firebaseConfig";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
// Assuming Firestore functions (doc, setDoc, getDoc, serverTimestamp) are available
// import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
// Assuming toast is available:
// import { toast } from "@/components/ui/use-toast";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 1. Email/Password Sign-In Logic (Revised) ---
  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!email || !password) {
      // Assuming toast is available
      // toast({...});
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Show success toast (replace with actual toast implementation)
      toast.success("Login Successful! Redirecting...");

      // Redirect on successful sign-in
      window.location.href = "/";
    } catch (error: any) {
      console.error("Firebase Sign-in Error:", error);

      let errorMessage =
        "An unknown error occurred during sign-in. Please try again.";

      // Updated error handling for the latest Firebase error code
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not properly formatted.";
      } else {
        errorMessage = error.message;
      }

      // Show error toast (replace with actual toast implementation)
      alert(`Can't sign you in: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Google Sign-In Logic (New) ---
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Initiate Google Sign-In with Popup
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Firebase User Object

      // Check and Create User Document in Firestore if new
      const userDocRef = doc(db, "users", `${user.displayName}`);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // User is new. Create a profile document.
        await setDoc(
          userDocRef,
          {
            email: user.email,
            displayName: user.displayName || "Google User",
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            lichessId: "",
            lichessToken: "",
            studies: [],
            pgns: [],
            images: [],
            dates_uploaded: [],
          },
          { merge: true }
        ); // Use merge: true just in case
      }

      // Show success toast (replace with actual toast implementation)
      alert("Google Sign-In Successful! Redirecting...");

      // Success: Redirect to the main application page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Google sign-in/registration error:", error);

      let errorMessage =
        error.code === "auth/popup-closed-by-user"
          ? "The sign-in window was closed."
          : error.message ||
            "An error occurred during sign-in. Please try again.";

      // Show error toast (replace with actual toast implementation)
      alert(`Google Sign-In Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen flex items-center justify-center">
        <div className="w-full mx-auto bg-[#182138] p-8 rounded-[20px] max-w-sm shadow-2xl">
          {/* Header/Logo (omitted for brevity) */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex flex-row items-center mb-4">
              <div className="bg-blue-500/30 rounded-full p-2">
                <ChessQueen color="#8ec5ff" size={30} />
              </div>
              <h1 className="text-white font-bold ml-2 text-3xl">
                Chess<span className="text-[#7BADF9]">Tourney</span>
              </h1>
            </div>
            <h2 className="text-white text-xl font-semibold">
              Sign in to your account
            </h2>
          </div>

          {/* --- Social Sign-In (Google) --- */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex h-12 text-lg items-center justify-center p-3 rounded-xl text-black hover:bg-black hover:text-white bg-white font-bold w-full transition-colors duration-200  disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="192" // increased from 96
              height="192" // increased from 96
              viewBox="0 0 24 24"
              fill="currentColor"
              className="icon mr-4 icon-tabler icons-tabler-filled icon-tabler-brand-google"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" />
            </svg>
            {loading ? "Processing..." : "Sign In with Google"}
          </Button>

          <div className="flex items-center my-6">
            <hr className="grow border-gray-700" />
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <hr className="grow border-gray-700" />
          </div>

          {/* --- Email Sign-In Form --- */}
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-5">
            {/* Email Input Group */}
            <div>
              <label
                htmlFor="email"
                className="text-white block mb-2 text-sm font-medium"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-[50px] pl-10 text-white bg-[#0E192A] placeholder-gray-400 focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none border-none"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>
            {/* Password Input Group */}
            <div>
              <label
                htmlFor="password"
                className="text-white block mb-2 text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-[50px] pl-10 text-white bg-[#0E192A] placeholder-gray-400 focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none border-none"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 h-12 flex items-center justify-center p-4 rounded-xl text-black hover:bg-black hover:text-white bg-white font-bold text-lg w-full transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link (Register) */}
          <div className="mt-8 text-center text-sm">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-[#7BADF9] font-medium hover:underline"
              >
                Register Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
