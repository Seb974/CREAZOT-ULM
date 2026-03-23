"use client";

import { useState } from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { RegistrationData } from "./RegisterStepper";

interface StepAccountProps {
  data: RegistrationData["user"];
  registrationData: RegistrationData;
  onChange: (values: Partial<RegistrationData["user"]>) => void;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontFamily: "Poppins, system-ui",
    "&.Mui-focused fieldset": { borderColor: "#0f929a" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0f929a" },
};

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "8 caractères minimum", test: (pw) => pw.length >= 8 },
  { label: "1 majuscule", test: (pw) => /[A-Z]/.test(pw) },
  { label: "1 chiffre", test: (pw) => /[0-9]/.test(pw) },
];

export default function StepAccount({
  data,
  registrationData,
  onChange,
}: StepAccountProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedPackNames = registrationData.modules.packIds
    .map(String)
    .join(", ");

  return (
    <div className="space-y-5">
      <h2 className="text-title-xsm font-semibold text-black">
        Créez votre compte administrateur
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Prénom"
          value={data.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          required
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />
        <TextField
          label="Nom"
          value={data.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          required
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />
      </div>

      <TextField
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        required
        fullWidth
        variant="outlined"
        sx={fieldSx}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) => onChange({ password: e.target.value })}
          required
          fullWidth
          variant="outlined"
          sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirmer"
          type={showConfirm ? "text" : "password"}
          value={data.confirmPassword}
          onChange={(e) => onChange({ confirmPassword: e.target.value })}
          required
          fullWidth
          variant="outlined"
          error={
            data.confirmPassword.length > 0 &&
            data.password !== data.confirmPassword
          }
          helperText={
            data.confirmPassword.length > 0 &&
            data.password !== data.confirmPassword
              ? "Les mots de passe ne correspondent pas"
              : ""
          }
          sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirm(!showConfirm)}
                  edge="end"
                  size="small"
                >
                  {showConfirm ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      {data.password.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(data.password);
            return (
              <div key={rule.label} className="flex items-center gap-1 text-sm">
                {ok ? (
                  <CheckIcon sx={{ fontSize: 16, color: "#219653" }} />
                ) : (
                  <CloseIcon sx={{ fontSize: 16, color: "#D34053" }} />
                )}
                <span className={ok ? "text-success" : "text-danger"}>
                  {rule.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={data.acceptTerms}
            onChange={(e) => onChange({ acceptTerms: e.target.checked })}
            sx={{
              color: "#0f929a",
              "&.Mui-checked": { color: "#0f929a" },
            }}
          />
        }
        label={
          <span className="text-sm text-body">
            J&apos;accepte les{" "}
            <a
              href="/cgu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-700 underline"
            >
              conditions générales d&apos;utilisation
            </a>
          </span>
        }
      />

      <div className="mt-4 rounded-lg bg-cyan-200/30 p-4">
        <h3 className="mb-2 text-sm font-semibold text-black">
          Récapitulatif
        </h3>
        <div className="space-y-1.5 text-sm text-body">
          <div className="flex justify-between">
            <span>Structure</span>
            <span className="font-medium text-black">
              {registrationData.club.name || "—"},{" "}
              {registrationData.club.city || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Aéronefs</span>
            <span className="font-medium text-black">
              {registrationData.club.nbAeronefs}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Modules</span>
            <span className="font-medium text-black">
              {selectedPackNames || "—"}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Chip
            label="Gratuit pendant 30 jours"
            sx={{
              bgcolor: "#d1fae5",
              color: "#065f46",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </div>
      </div>
    </div>
  );
}
