import { SelectInput } from "react-admin";
import { colors } from "../../../app/lib/client";
import { Box } from "@mui/material";
import { useWatch } from 'react-hook-form';

export const ColorPreview = () => {
  const selectedColor = useWatch({ name: 'color', defaultValue: colors[0].id });

  return (
      <Box display="flex" alignItems="center" width="100%" gap={2}>
        <Box flexGrow={1}>
          <SelectInput source="color" label="Couleur du header" choices={ colors } fullWidth/>
        </Box>
        <Box
          width={48}
          height={48}
          borderRadius={1}
          border="1px solid #ccc"
          style={{ backgroundColor: selectedColor, marginBottom: '1.2rem' }}
        />
      </Box>
  );
};