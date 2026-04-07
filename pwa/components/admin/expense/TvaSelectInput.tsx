import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTaxRates } from "./useTaxRates";
import { TextField, MenuItem, CircularProgress } from "@mui/material";

interface TvaSelectInputProps {
  isCreate?: boolean;
}

const TvaSelectInput = ({ isCreate = false }: TvaSelectInputProps) => {
  const { choices, defaultRate, isLoading } = useTaxRates();
  const { setValue, register } = useFormContext();
  const currentValue = useWatch({ name: "tva" });
  const defaultApplied = useRef(false);

  register("tva");

  useEffect(() => {
    if (defaultApplied.current) return;
    if (!isCreate) return;
    if (choices.length === 0 || defaultRate === undefined) return;

    if (currentValue === undefined || currentValue === null || currentValue === "") {
      setValue("tva", defaultRate, { shouldDirty: false, shouldValidate: false });
    }
    defaultApplied.current = true;
  }, [choices, defaultRate, isCreate, currentValue, setValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setValue("tva", Number.isFinite(val) ? val : "", { shouldDirty: true, shouldValidate: true });
  };

  const displayValue = currentValue !== undefined && currentValue !== null && currentValue !== ""
    ? currentValue
    : "";

  return (
    <TextField
      select
      label="TVA appliquée"
      value={displayValue}
      onChange={handleChange}
      fullWidth
      required
      variant="filled"
      size="small"
      disabled={isLoading && choices.length === 0}
      helperText={isLoading ? "Chargement des taux..." : choices.length === 0 ? "Aucun taux configuré pour ce pays" : undefined}
      sx={{ mb: 1 }}
      InputProps={{
        endAdornment: isLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : undefined,
      }}
    >
      {choices.map((c) => (
        <MenuItem key={c.id} value={c.id}>
          {c.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TvaSelectInput;
