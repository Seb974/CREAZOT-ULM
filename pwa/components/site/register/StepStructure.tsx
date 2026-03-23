"use client";

import { TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { RegistrationData } from "./RegisterStepper";

interface StepStructureProps {
  data: RegistrationData["club"];
  onChange: (values: Partial<RegistrationData["club"]>) => void;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontFamily: "Poppins, system-ui",
    "&.Mui-focused fieldset": { borderColor: "#0f929a" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0f929a" },
};

export default function StepStructure({ data, onChange }: StepStructureProps) {
  const clampAeronefs = (n: number) => Math.max(1, Math.min(50, n));

  return (
    <div className="space-y-5">
      <h2 className="text-title-xsm font-semibold text-black">
        Informations sur votre structure
      </h2>

      <TextField
        label="Nom du club / structure"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        required
        fullWidth
        variant="outlined"
        sx={fieldSx}
      />

      <TextField
        label="Ville"
        value={data.city}
        onChange={(e) => onChange({ city: e.target.value })}
        required
        fullWidth
        variant="outlined"
        sx={fieldSx}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Téléphone"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />
        <TextField
          label="Email structure"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-black">
          Nombre d&apos;aéronefs prévu
        </label>
        <div className="flex items-center gap-3">
          <IconButton
            size="small"
            onClick={() => onChange({ nbAeronefs: clampAeronefs(data.nbAeronefs - 1) })}
            disabled={data.nbAeronefs <= 1}
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <TextField
            type="number"
            value={data.nbAeronefs}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) onChange({ nbAeronefs: clampAeronefs(v) });
            }}
            inputProps={{ min: 1, max: 50, style: { textAlign: "center", width: 60 } }}
            variant="outlined"
            size="small"
            sx={{
              ...fieldSx,
              "& .MuiOutlinedInput-root": {
                ...fieldSx["& .MuiOutlinedInput-root"],
                width: 90,
              },
            }}
          />

          <IconButton
            size="small"
            onClick={() => onChange({ nbAeronefs: clampAeronefs(data.nbAeronefs + 1) })}
            disabled={data.nbAeronefs >= 50}
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>

          <span className="text-sm text-body">
            aéronef{data.nbAeronefs > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
