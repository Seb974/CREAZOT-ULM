"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import SyncLoader from "react-spinners/SyncLoader";

export default function SignInPage() {
  useEffect(() => {
    signIn("keycloak", { callbackUrl: "/admin" });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <SyncLoader size={8} color="#46B6BF" />
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        Redirection vers l&apos;authentification…
      </p>
    </div>
  );
}
