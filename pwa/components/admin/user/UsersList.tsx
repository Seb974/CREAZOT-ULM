import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  ShowButton,
  SimpleList
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme } from '@mui/material';

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

export const UsersList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const ListActions = () => (
    <TopToolbar>
        <ExportButton/>
    </TopToolbar>
  );

  return (
    <List resource="users" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.firstName }
              linkType={ false }
            /> 
            :
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}} rowClick={ false }>
                <TextField source="firstName" label="Prénom" sortable={ true }/>
                <TextField source="lastName" label="Nom" sortable={ true }/>
            </Datagrid>
        }
    </List>
  );
}