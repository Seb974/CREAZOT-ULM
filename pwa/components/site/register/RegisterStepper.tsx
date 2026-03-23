"use client";

import { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { signIn } from "next-auth/react";
import StepStructure from "./StepStructure";
import StepModules from "./StepModules";
import StepAccount from "./StepAccount";
import RegistrationSuccess from "./RegistrationSuccess";

export interface RegistrationData {
  club: {
    name: string;
    city: string;
    phone: string;
    email: string;
    nbAeronefs: number;
  };
  modules: {
    packIds: number[];
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  };
}

const STEPS = ["Structure", "Modules", "Compte"];

const initialData: RegistrationData = {
  club: { name: "", city: "", phone: "", email: "", nbAeronefs: 1 },
  modules: { packIds: [] },
  user: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  },
};

export default function RegisterStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<RegistrationData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateClub = (club: Partial<RegistrationData["club"]>) =>
    setData((prev) => ({ ...prev, club: { ...prev.club, ...club } }));

  const updateModules = (modules: Partial<RegistrationData["modules"]>) =>
    setData((prev) => ({ ...prev, modules: { ...prev.modules, ...modules } }));

  const updateUser = (user: Partial<RegistrationData["user"]>) =>
    setData((prev) => ({ ...prev, user: { ...prev.user, ...user } }));

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return data.club.name.trim() !== "" && data.club.city.trim() !== "";
      case 1:
        return data.modules.packIds.length > 0;
      case 2: {
        const { firstName, lastName, email, password, confirmPassword, acceptTerms } = data.user;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
          firstName.trim() !== "" &&
          lastName.trim() !== "" &&
          emailRegex.test(email) &&
          password.length >= 8 &&
          /[A-Z]/.test(password) &&
          /[0-9]/.test(password) &&
          password === confirmPassword &&
          acceptTerms
        );
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
      setError(null);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club: {
            name: data.club.name,
            city: data.club.city,
            phone: data.club.phone,
            email: data.club.email,
          },
          modules: {
            packIds: data.modules.packIds,
            nbAeronefs: data.club.nbAeronefs,
          },
          user: {
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            password: data.user.password,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erreur lors de l'inscription");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <RegistrationSuccess email={data.user.email} />;
  }

  return (
    <div className="font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-title-md font-bold text-black">
          Créez votre espace de gestion
        </h1>
        <p className="mt-2 text-body">
          Essai gratuit 30 jours · Sans carte bancaire
        </p>
      </div>

      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          mb: 4,
          "& .MuiStepLabel-root .Mui-completed": { color: "#0f929a" },
          "& .MuiStepLabel-root .Mui-active": { color: "#0f929a" },
          "& .MuiStepIcon-root.Mui-completed": { color: "#0f929a" },
          "& .MuiStepIcon-root.Mui-active": { color: "#0f929a" },
        }}
      >
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="rounded-lg bg-white p-6 shadow-card">
        {activeStep === 0 && (
          <StepStructure data={data.club} onChange={updateClub} />
        )}
        {activeStep === 1 && (
          <StepModules
            selectedPackIds={data.modules.packIds}
            nbAeronefs={data.club.nbAeronefs}
            onChange={updateModules}
          />
        )}
        {activeStep === 2 && (
          <StepAccount
            data={data.user}
            registrationData={data}
            onChange={updateUser}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ color: "#64748B", textTransform: "none" }}
        >
          Précédent
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!validateStep(activeStep) || loading}
          sx={{
            bgcolor: "#0f929a",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.2,
            borderRadius: "8px",
            "&:hover": { bgcolor: "#0d7f86" },
            "&.Mui-disabled": { bgcolor: "#bceff3", color: "#fff" },
          }}
        >
          {loading ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : activeStep === STEPS.length - 1 ? (
            "Démarrer l'essai"
          ) : (
            "Suivant"
          )}
        </Button>
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => signIn("keycloak")}
          className="text-sm text-cyan-700 underline-offset-2 hover:underline"
        >
          Déjà inscrit ? Accéder à mon espace →
        </button>
      </div>
    </div>
  );
}
