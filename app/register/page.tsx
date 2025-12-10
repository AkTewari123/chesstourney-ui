// src/pages/RegisterPage.tsx
"use client";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "../main.css";
import { ChessQueen, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { Input } from "@/components/ui/input";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
// import { useAuth } from "@/context/AuthContext"; // Assume this hook is available

export default function RegisterPage() {
  // const { registerWithEmail, signInWithGoogle } = useAuth(); // Destructure Firebase functions
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // 1. Get the Auth instance

    try {
      // 2. Call the Firebase function
      await createUserWithEmailAndPassword(auth, email, password);
      signInWithEmailAndPassword(auth, email, password).then(
        async (userCredential) => {
          const user = userCredential.user;
          const pendingName = email;
          if (!user.displayName) {
            // 3. Create a Firestore document for the new user
            await updateProfile(user, {
              displayName: pendingName, // Use email prefix as display name
            });
          }
          // 3. Create a Firestore document for the new user
          const userDocRef = doc(db, "users", `${user.displayName}`);
          const userDoc = await getDoc(userDocRef);
          console.log(userDoc);
          if (!userDoc.exists()) {
            // User is new. Create a profile document in Firestore.
            toast.success("Registration Successful! Redirecting...");
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName || "New User",
              photoURL: user.photoURL,
              createdAt: serverTimestamp(), // Use serverTimestamp() for best practice
              lichessId: "",
              lichessToken: "",
              studies: [],
              pgns: [],
              images: [],
              dates_uploaded: [],
            });
            window.location.href = "/";
          }
        }
      );

      // Show success toast (replace with actual toast implementation)

      // Redirect on successful registration
      // You can use a router or window.location.href
      // For example, using Next.js router:
      // router.push("/");

      // For now, we will just log the email to the console
      // This is just for demonstration purposes.
      // In a real application, you would redirect the user or show a success message.
      setEmail("");
      setPassword("");
      console.log("Registered with email:", email);
      toast.success("Registration successful! Redirecting to login...");

      // The user is automatically signed in upon successful registration.
      // You can now redirect them to the home page or a success page.
    } catch (error: any) {
      console.error("Registration error:", error.message);
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already in use. Please log in instead.");
      } else if (
        error.code === "auth/invalid-email" ||
        error.code === "auth/weak-password"
      ) {
        toast.error(`You have an invalid email and/or a weak password.`);
      }
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
      const userDocRef = doc(db, "users", `${user.displayName}`);
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
          studies: [],
          pgns: [],
          images: [],
          dates_uploaded: [],
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
        {/* --- Social Sign-In (Google) --- */}
        <Button
          onClick={handleGoogleRegistration}
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
          {loading ? "Processing..." : "Register with Google"}
        </Button>

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
