"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "../main.css";
import { ChessKing, Key, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
export default function SyncLichessPage() {
  const [username, setUsername] = useState("");
  const [authToken, setAuthToken] = useState("");
  return (
    <>
      <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen flex items-center justify-center">
        <div className="w-full mx-auto bg-[#182138] text-white p-8 rounded-[20px] max-w-lg shadow-2xl">
          <div className="mb-4">
            <h1 className="text-white font-bold text-3xl text-center">
              <ChessKing className="inline mb-2" size={30} /> Sync Lichess
              Account
            </h1>

            <p className="text-base text-gray-300 mt-1">
              &nbsp;&nbsp;&nbsp;To sync your Lichess account with ChessTourney,
              please provide your Lichess username and an authenticator token
              generated from your Lichess account settings. Go to the link
              below, scroll down, & click &quot;Create&quot;. Do NOT change any
              of the settings.
            </p>
            <a
              href="https://lichess.org/account/oauth/token/create?scopes[]=study:write&scopes[]=study:read&description=ChessTourney"
              target="_blank"
              className="text-center text-blue-400 underline"
            >
              Set Up Lichess Token
            </a>
          </div>
          <h2 className="text-xl">Lichess Username</h2>
          <div className="relative mb-4 mt-2">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              id="email"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-[50px] pl-10 text-white bg-[#0E192A] placeholder-gray-400 focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none border-none"
              placeholder="Enter your Lichess username"
            />
          </div>
          <h2 className="text-xl">Lichess Authenticator Token</h2>
          <div className="relative mt-2">
            <Key
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              id="email"
              type="email"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              required
              className="h-[50px] pl-10 text-white bg-[#0E192A] placeholder-gray-400 focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none border-none"
              placeholder="Lichess Authenticator Token"
            />
          </div>
          <Button
            onClick={() => {
              updateDoc(doc(db, "users", auth.currentUser?.uid!), {
                lichessId: username,
                lichessToken: authToken,
              });
              toast("Lichess account synced successfully!");
              setTimeout(() => {
                window.location.href = "/";
              }, 2000);
            }}
            className="w-full mt-4 text-lg bg-white hover:bg-black hover:text-white text-black cursor-pointer p-6"
          >
            <span className="font-bold">Sync Account</span>
          </Button>
        </div>
      </div>
    </>
  );
}
