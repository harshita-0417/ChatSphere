import React, { useState, useEffect } from "react";
import { auth, provider, fbSignInWithPopup, fbSignOut } from "./firebase";
import axios from "axios";
import io from "socket.io-client";
import Login from "./Login";
import Chat from "./Chat";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export default function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        const u = {
          uid: fbUser.uid,
          name: fbUser.displayName,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          username: (fbUser.displayName || fbUser.email || fbUser.uid).toLowerCase().replace(/\s+/g, "")
        };
        setUser(u);

        // upsert user to backend
        try {
          await axios.post(`${SERVER_URL}/api/users`, u);
        } catch (e) {
          console.error("upsert user failed", e);
        }

        // open socket
        const s = io(SERVER_URL, { transports: ["websocket"] });
        s.on("connect", () => {
          s.emit("user_connected", u.uid);
        });
        setSocket(s);
      } else {
        setUser(null);
        if (socket) { socket.disconnect(); setSocket(null); }
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async () => {
    try {
      await fbSignInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      if (socket) { socket.disconnect(); setSocket(null); }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <Login onSignIn={handleSignIn} />;

  return <Chat user={user} socket={socket} onSignOut={handleSignOut} />;
}
