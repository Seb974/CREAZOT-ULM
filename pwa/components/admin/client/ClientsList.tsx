import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  SimpleList,
  ShowButton
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";


export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);

export const ClientsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="clients" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.name }
              linkType="edit"
            /> 
            :
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="name" label="Nom" sortable={ true }/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}