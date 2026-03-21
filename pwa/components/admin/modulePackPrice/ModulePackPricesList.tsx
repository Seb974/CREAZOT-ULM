import {
  List,
  Datagrid,
  ReferenceField,
  TextField,
  NumberField,
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

export const ModulePackPricesList = () => (
  <List resource="module-pack-prices" actions={<ListActions />}>
    <Datagrid sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}>
      <ReferenceField source="modulePack" reference="module-packs" label="Pack de modules" link="edit">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="pricingCategory" reference="pricing-categories" label="Grille tarifaire" link="edit">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="monthlyPrice" label="€/mois" options={{ style: 'currency', currency: 'EUR' }} />
      <EditButton />
    </Datagrid>
  </List>
);
