// src/pages/RegisterPage.tsx
"use client";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import {
  ChessQueen,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  Chrome, // Used for Google Icon
} from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { Input } from "@/components/ui/input";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { useAuth } from "@/context/AuthContext"; // Assume this hook is available

export default function RegisterPage() {
  // const { registerWithEmail, signInWithGoogle } = useAuth(); // Destructure Firebase functions
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      // await registerWithEmail(email, password);
      console.log("Registered with email:", email);
      alert("Registration successful! You can now sign in.");
      // Redirect to sign-in or home page
    } catch (error: any) {
      console.error("Registration error:", error.message);
      alert(`Registration Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegistration = async () => {
    // This state should be managed by the parent component (e.g., RegisterPage)
    // const [loading, setLoading] = useState(false);
    // const auth = getAuth(app);
    // const db = getFirestore(app);

    try {
      setLoading(true);

      // 1. Initiate Google Sign-In with Popup
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Firebase User Object

      // 2. Check and Create User Document in Firestore
      // Use the user's UID as the document ID for easy lookup
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // User is new. Create a profile document in Firestore.
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || "Google User",
          photoURL: user.photoURL,
          createdAt: serverTimestamp(), // Use serverTimestamp() for best practice
          // Lichess fields will be added later in the profile modal
          lichessId: "",
          lichessToken: "",
        });
      }

      // 3. Success: Redirect to the main application page
      window.location.href = "/";
    } catch (error: any) {
      // Handle various errors (popup closed, permissions denied, network issues)
      console.error("Google sign-in/registration error:", error);

      // Use your toast/notification system here
      toast("Sorry, we couldn't register you  with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen flex items-center justify-center">
      <div className="w-full mx-auto bg-[#182138] p-8 rounded-[20px] max-w-sm shadow-2xl">
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-row items-center mb-4">
            <div className="bg-blue-500/30 rounded-full p-2">
              <ChessQueen color="#8ec5ff" size={30} />
            </div>
            <h1 className="text-white font-bold ml-2 text-3xl">
              Chess<span className="text-[#7BADF9]">Tourney</span>
            </h1>
          </div>
          <h2 className="text-white text-xl font-semibold flex items-center">
            <UserPlus className="mr-2" size={20} /> Create an Account
          </h2>
        </div>

        {/* --- Social Sign-Up (Google) --- */}
        <button
          onClick={handleGoogleRegistration}
          disabled={loading}
          className="flex items-center justify-center p-3 rounded-xl text-white bg-red-600/90 font-bold text-base w-full transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
        >
          <Chrome className="mr-2" size={20} />
          {loading ? "Processing..." : "Sign Up with Google"}
        </button>

        <div className="flex items-center my-6">
          <hr className="grow border-gray-700" />
          <span className="mx-4 text-gray-500 text-sm">OR</span>
          <hr className="grow border-gray-700" />
        </div>

        {/* --- Email Registration Form --- */}
        <form onSubmit={handleEmailRegister} className="flex flex-col gap-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="text-white block mb-2 text-sm font-medium"
            >
              Email
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

          {/* Password Input */}
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
                minLength={6}
                className="h-[50px] pl-10 text-white bg-[#0E192A] placeholder-gray-400 focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none border-none"
                placeholder="Minimum 6 characters"
                disabled={loading}
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex items-center justify-center p-4 rounded-xl text-[#0E192A] bg-[#7BADF9] font-bold text-lg w-full transition-colors duration-200 hover:bg-[#5a9cff] disabled:opacity-50"
          >
            {loading ? (
              "Registering..."
            ) : (
              <>
                Register
                <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link (Sign In) */}
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#7BADF9] font-medium hover:underline"
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
