import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  DateField,
  EditButton,
  CreateButton,
  ExportButton,
  TopToolbar,
} from "react-admin";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export const PricingCategoriesList = () => (
  <List resource="pricing-categories" actions={<ListActions />}>
    <Datagrid sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}>
      <TextField source="name" label="Nom" />
      <TextField source="slug" label="Slug" />
      <BooleanField source="isActive" label="Actif" />
      <BooleanField source="isDefault" label="Par défaut" />
      <NumberField source="discountPercent" label="Remise (%)" />
      <NumberField source="maintenanceDiscount" label="Remise maintenance (%)" />
      <DateField source="validFrom" label="Valide du" />
      <DateField source="validUntil" label="Valide jusqu'au" />
      <EditButton />
    </Datagrid>
  </List>
);
