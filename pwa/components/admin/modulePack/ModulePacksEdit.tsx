import {
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  CheckboxGroupInput,
  ReferenceManyField,
  Datagrid,
  ReferenceField,
  TextField,
  NumberField,
  EditButton,
  required,
  useRecordContext,
  Button,
} from "react-admin";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { Typography, Divider } from "@mui/material";

const MODULE_CHOICES = [
  { id: "hasReservation", name: "Réservations" },
  { id: "hasOptions", name: "Options tarifaires" },
  { id: "hasEmailConfirmation", name: "Confirmation email" },
  { id: "hasGifts", name: "Bons cadeaux" },
  { id: "hasWebshop", name: "Boutique en ligne (Wix)" },
  { id: "hasPartners", name: "Partenaires" },
  { id: "hasPassengerRegistration", name: "Inscription passagers" },
  { id: "hasOriginContact", name: "Origines & Contacts" },
  { id: "hasPaymentManagement", name: "Gestion paiements" },
  { id: "hasExpensesManagement", name: "Gestion dépenses" },
  { id: "hasMicrotrakTag", name: "Tracking GPS (Microtrak)" },
  { id: "hasLandingManagement", name: "Gestion atterrissages" },
  { id: "hasIndividualFlightLogs", name: "Carnets de vol individuels" },
  { id: "hasGroupUpdate", name: "Mise à jour groupée" },
  { id: "hasNotam", name: "NOTAMs / SNOWTAMs" },
];

const AddPriceButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Button
      component={Link}
      to={`/module-pack-prices/create?modulePack=${encodeURIComponent(record["@id"] || record.id)}`}
      label="Ajouter un prix"
      startIcon={<AddIcon />}
    />
  );
};

export const ModulePacksEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Nom" validate={required()} />
      <TextInput source="slug" label="Slug" validate={required()} />
      <TextInput source="description" label="Description" multiline />
      <BooleanInput source="isDefault" label="Pack par défaut" />
      <NumberInput source="sortOrder" label="Ordre d'affichage" />
      <CheckboxGroupInput source="modules" label="Modules inclus" choices={MODULE_CHOICES} />

      <Divider sx={{ mt: 3, mb: 2, width: "100%" }} />
      <Typography variant="h6" gutterBottom>
        Prix par grille tarifaire
      </Typography>

      <ReferenceManyField reference="module-pack-prices" target="modulePack" label="">
        <Datagrid sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}>
          <ReferenceField source="pricingCategory" reference="pricing-categories" label="Grille" link="edit">
            <TextField source="name" />
          </ReferenceField>
          <NumberField source="monthlyPrice" label="€/mois" options={{ style: 'currency', currency: 'EUR' }} />
          <EditButton />
        </Datagrid>
      </ReferenceManyField>

      <AddPriceButton />
    </SimpleForm>
  </Edit>
);
