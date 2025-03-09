import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  FilterButton,
  TopToolbar,
  DateField,
  NumberField,
  EditButton,
  ShowButton
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
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

export const CircuitsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);

  return (
    <List resource="circuits" actions={<ListActions/>}>
        <Datagrid>
            <TextField source="code" label="Code" sortable={ true }/>
            <TextField source="nom" label="Nom" sortable={ true }/>
            <TextField source="nature.code" label="Nature" sortable={ true }/>
            <DateField source="duree" label="Durée" sortable={ false } showTime showDate={false}/>
            <NumberField source="prix" options={{ style: 'currency', currency: 'EUR' }} label="Prix"/>
            <ShowButton/>
            <EditButton />
        </Datagrid>
    </List>
  );
}