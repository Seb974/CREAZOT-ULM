"use client";

import { useState } from "react";
import { Button, CircularProgress, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { signIn } from "next-auth/react";

interface RegistrationSuccessProps {
  email: string;
}

export default function RegistrationSuccess({ email }: RegistrationSuccessProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const response = await fetch("/api/registration/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Impossible de renvoyer l'email");
      }

      setResent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-8 text-center font-sans">
      <CheckCircleIcon sx={{ fontSize: 72, color: "#219653", mb: 2 }} />

      <h1 className="text-title-md font-bold text-black">
        Votre compte a été créé !
      </h1>

      <p className="mt-3 max-w-md text-body">
        Un email de vérification a été envoyé à{" "}
        <span className="font-semibold text-black">{email}</span>. Cliquez sur le
        lien pour activer votre compte.
      </p>

      {error && (
        <Alert severity="error" className="mt-4 w-full max-w-md" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {resent && (
        <Alert severity="success" className="mt-4 w-full max-w-md">
          Email de vérification renvoyé avec succès.
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={() => signIn("keycloak")}
        sx={{
          mt: 4,
          bgcolor: "#0f929a",
          textTransform: "none",
          fontWeight: 600,
          px: 4,
          py: 1.2,
          borderRadius: "8px",
          fontSize: "1rem",
          "&:hover": { bgcolor: "#0d7f86" },
        }}
      >
        Accéder à mon espace →
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending || resent}
        className="mt-4 text-sm text-cyan-700 underline-offset-2 hover:underline disabled:opacity-50"
      >
        {resending ? (
          <span className="flex items-center gap-2">
            <CircularProgress size={14} sx={{ color: "#0f929a" }} />
            Envoi en cours…
          </span>
        ) : resent ? (
          "Email renvoyé ✓"
        ) : (
          "Pas reçu ? Renvoyer l'email"
        )}
      </button>
    </div>
  );
}
