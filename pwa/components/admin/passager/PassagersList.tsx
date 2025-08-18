import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  DateField,
  EditButton,
  ShowButton,
  SimpleList,
  EmailField
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { isDefined } from "../../../app/lib/utils";
import { useMediaQuery, Theme } from '@mui/material';
import { useSessionContext } from "../../admin/SessionContextProvider";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

export const PassagersList: NextPage<Props> = ({ data, hubURL, page }) => {

  const { session } = useSessionContext();
  const user = session?.user;
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const isAdmin = isDefined(session) && isDefined(user) && user?.roles.includes("admin");

  const ListActions = () => (
    <TopToolbar>
        <CreateButton/>
        {/* @ts-ignore */}
        {isAdmin && <ExportButton/>}
    </TopToolbar>
  );

  return (
    <List resource="passagers" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.nom + ' ' +  record.prenom }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.date)).toLocaleDateString("fr-FR", options) } `}
              linkType="show"
            /> 
            : 
            <Datagrid bulkActionButtons={ isAdmin } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" label="Date" sortable={ true } />
                <TextField source="nom" label="Nom" sortable={ true }/>
                <TextField source="prenom" label="Prénom" sortable={ true }/>
                <TextField source="telephone" label="Prénom" sortable={ true }/>
                <EmailField source="email" label="Adresse email"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}