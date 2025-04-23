import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  NumberField,
  EditButton,
  ShowButton,
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);


export const CombinaisonsList: NextPage<Props> = ({ data, hubURL, page }) => {


  return (
    <List resource="combinaisons" actions={<ListActions/>}>
        <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
          <TextField source="nom" label="Passager" sortable={ true }/>
          <NumberField source="minPassager" label="Nombre de passager minimal"/>
          <NumberField source="prix" label="Prix" options={{ style: 'currency', currency: 'EUR' }}/>
          <p className="text-right">
              <ShowButton />
              <EditButton />
          </p>
        </Datagrid>
    </List>
  );
}