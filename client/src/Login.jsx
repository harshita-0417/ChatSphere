import React from "react";

export default function Login({ onSignIn }) {
  return (
    <div className="centered">
      <h1>Simple Chat</h1>
      <button className="btn" onClick={onSignIn}>Sign in with Google</button>
      <p className="muted">Sign-in used to get a unique uid and name.</p>
    </div>
  );
}
