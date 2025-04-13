import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextInput,
  TextField,
  BooleanInput,
  CreateButton,
  ExportButton,
  TopToolbar,
  DateField,
  DateInput,
  EditButton,
  ShowButton,
  BooleanField,
  FilterButton
} from "react-admin";
import DownloadGiftButton from "./DownloadGiftButton";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <FilterButton/> 
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);

const filters = [
  <TextInput source="beneficiaire" key="beneficiaire" label="Bénéficiaire"/>,
  <TextInput source="offreur" key="offreur" label="Personne offrante"/>,
  <BooleanInput source="used" key="used" label="Bons utilisés"/>,
  <DateInput source="fin[before]"  key="DateMax" label="Date Max d'expiration"/>,
];

export const CadeauxList: NextPage<Props> = ({ data, hubURL, page }) => {

  return (
    <List resource="cadeaux" actions={<ListActions/>} filters={ filters } title="Bons cadeaux">
        <Datagrid rowClick={ false} >
            <TextField source="code" label="N° de bon"/>
            <TextField source="beneficiaire" label="Bénéficiaire" sortable={ true }/>
            <TextField source="offreur" label="Personne offrante" sortable={ true }/>
            <DateField source="fin" label="Date d'expiration" sortable={ true } />
            <BooleanField source="used" label="utilisé" textAlign="center"/>
            <DownloadGiftButton/>
            <p className="text-right">
                <ShowButton />
                <EditButton />
            </p>
        </Datagrid>
    </List>
  );
}