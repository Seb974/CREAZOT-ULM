import {
  Edit,
  SimpleForm,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  required,
} from "react-admin";
import { Typography, Divider, Box } from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import FlightIcon from "@mui/icons-material/Flight";
import EuroIcon from "@mui/icons-material/Euro";

export const PricingTiersEdit = () => (
  <Edit title="Modifier la tranche" mutationMode="pessimistic">
    <SimpleForm sx={{ maxWidth: 600, mx: "auto" }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <CategoryIcon sx={{ color: "#6366f1" }} />
        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
          Grille tarifaire
        </Typography>
      </Box>

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
        <FlightIcon sx={{ color: "#0891b2" }} />
        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
          Tranche d'aéronefs
        </Typography>
      </Box>

      <Box display="flex" gap={2} width="100%">
        <NumberInput
          source="minAeronefs"
          label="Minimum"
          validate={required()}
          fullWidth
          min={0}
        />
        <NumberInput
          source="maxAeronefs"
          label="Maximum"
          fullWidth
          min={0}
          helperText="Laisser vide pour « illimité »"
        />
      </Box>

      <Divider sx={{ my: 2, width: "100%" }} />

      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <EuroIcon sx={{ color: "#059669" }} />
        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
          Tarification
        </Typography>
      </Box>

      <NumberInput
        source="pricePerAeronef"
        label="Prix par aéronef / mois (€)"
        validate={required()}
        fullWidth
        min={0}
        step={0.01}
      />
    </SimpleForm>
  </Edit>
);
