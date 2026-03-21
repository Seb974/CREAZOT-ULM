import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  DateTimeInput,
  ReferenceManyField,
  Datagrid,
  NumberField,
  EditButton,
  required,
  useRecordContext,
  Button,
} from "react-admin";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { Typography, Divider } from "@mui/material";

const AddTierButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Button
      component={Link}
      to={`/pricing-tiers/create?pricingCategory=${encodeURIComponent(record["@id"] || record.id)}`}
      label="Ajouter un palier"
      startIcon={<AddIcon />}
    />
  );
};

export const PricingCategoriesEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Nom" validate={required()} />
      <TextInput source="slug" label="Slug" validate={required()} />
      <TextInput source="description" label="Description" multiline />
      <NumberInput source="discountPercent" label="Remise (%)" />
      <NumberInput source="maintenanceDiscount" label="Remise maintenance (%)" />
      <BooleanInput source="isDefault" label="Grille par défaut" />
      <BooleanInput source="isActive" label="Actif" />
      <DateTimeInput source="validFrom" label="Valide du" />
      <DateTimeInput source="validUntil" label="Valide jusqu'au" />

      <Divider sx={{ mt: 3, mb: 2, width: "100%" }} />
      <Typography variant="h6" gutterBottom>
        Paliers tarifaires
      </Typography>

      <ReferenceManyField reference="pricing-tiers" target="pricingCategory" label="">
        <Datagrid sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}>
          <NumberField source="minAeronefs" label="Min aéronefs" />
          <NumberField source="maxAeronefs" label="Max aéronefs" />
          <NumberField source="pricePerAeronef" label="€/aéronef/mois" options={{ style: 'currency', currency: 'EUR' }} />
          <EditButton />
        </Datagrid>
      </ReferenceManyField>

      <AddTierButton />
    </SimpleForm>
  </Edit>
);
