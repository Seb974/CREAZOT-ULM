import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  EditButton,
  FunctionField,
  CreateButton,
  ExportButton,
  TopToolbar,
} from "react-admin";
import { Chip, Box } from "@mui/material";

const MODULE_LABELS: Record<string, string> = {
  hasReservation: "Réservations",
  hasOptions: "Options tarifaires",
  hasEmailConfirmation: "Confirmation email",
  hasGifts: "Bons cadeaux",
  hasWebshop: "Boutique en ligne",
  hasPartners: "Partenaires",
  hasPassengerRegistration: "Inscription passagers",
  hasOriginContact: "Origines & Contacts",
  hasPaymentManagement: "Gestion paiements",
  hasExpensesManagement: "Gestion dépenses",
  hasMicrotrakTag: "Tracking GPS",
  hasLandingManagement: "Gestion atterrissages",
  hasIndividualFlightLogs: "Carnets de vol",
  hasGroupUpdate: "Mise à jour groupée",
};

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export const ModulePacksList = () => (
  <List resource="module-packs" actions={<ListActions />}>
    <Datagrid sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}>
      <TextField source="name" label="Nom" />
      <TextField source="slug" label="Slug" />
      <BooleanField source="isDefault" label="Par défaut" />
      <NumberField source="sortOrder" label="Ordre" />
      <FunctionField
        label="Modules"
        render={(record) => {
          if (!record?.modules) return null;
          return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {record.modules.map((mod: string) => (
                <Chip key={mod} label={MODULE_LABELS[mod] || mod} size="small" />
              ))}
            </Box>
          );
        }}
      />
      <EditButton />
    </Datagrid>
  </List>
);
