import {
  Edit,
  SimpleForm,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  required,
} from "react-admin";
import { Typography, Divider, Box, Card, CardContent } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import EuroIcon from "@mui/icons-material/Euro";

export const ModulePackPricesEdit = () => (
  <Edit title="Modifier le tarif" mutationMode="pessimistic">
    <SimpleForm sx={{ maxWidth: 600, mx: "auto" }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <InventoryIcon sx={{ color: "#6366f1" }} />
        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
          Pack & Grille
        </Typography>
      </Box>

      <ReferenceInput source="modulePack" reference="module-packs">
        <AutocompleteInput
          optionText="name"
          label="Pack de modules"
          validate={required()}
          fullWidth
        />
      </ReferenceInput>

      <ReferenceInput source="pricingCategory" reference="pricing-categories">
        <AutocompleteInput
          optionText="name"
          label="Grille tarifaire"
          validate={required()}
          fullWidth
        />
      </ReferenceInput>

      <Divider sx={{ my: 2, width: "100%" }} />

      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <EuroIcon sx={{ color: "#059669" }} />
        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
          Tarification
        </Typography>
      </Box>

      <NumberInput
        source="monthlyPrice"
        label="Prix mensuel (€)"
        validate={required()}
        fullWidth
        min={0}
        step={0.01}
      />
    </SimpleForm>
  </Edit>
);
