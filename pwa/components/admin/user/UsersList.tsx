import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  ShowButton,
  EmailField
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

export const UsersList: NextPage<Props> = ({ data, hubURL, page }) => {

  const ListActions = () => (
    <TopToolbar>
        <CreateButton/>
        <ExportButton/>
    </TopToolbar>
  );

  return (
    <List resource="users" actions={<ListActions/>}>
        <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
            <TextField source="firstName" label="Prénom" sortable={ true }/>
            <TextField source="lastName" label="Nom" sortable={ true }/>
            <p className="text-right">
                <ShowButton />
            </p>
        </Datagrid>
    </List>
  );
}