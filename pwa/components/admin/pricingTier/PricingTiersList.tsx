import {
  List,
  Datagrid,
  NumberField,
  ReferenceField,
  TextField,
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

export const PricingTiersList = () => (
  <List resource="pricing-tiers" actions={<ListActions />}>
    <Datagrid sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}>
      <ReferenceField source="pricingCategory" reference="pricing-categories" label="Grille tarifaire" link="edit">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="minAeronefs" label="Min aéronefs" />
      <NumberField source="maxAeronefs" label="Max aéronefs" />
      <NumberField source="pricePerAeronef" label="€/aéronef/mois" options={{ style: 'currency', currency: 'EUR' }} />
      <EditButton />
    </Datagrid>
  </List>
);
