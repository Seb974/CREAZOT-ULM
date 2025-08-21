import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  DateField,
  BooleanField,
  FunctionField,
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
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { useClient } from '../../admin/ClientProvider';
import { isDefined } from "../../../app/lib/utils";


export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => {
  const { client } = useClient();

  return (
    <TopToolbar>
        { !isDefined(client) && <CreateButton/> }
        <ExportButton/>
    </TopToolbar>
)};

export const ClientsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const getState = ({ active }) => {
    return (
        <span style={{ color: active ? "lime" : "red"}}>
            { active ? <ToggleOnIcon/> : <ToggleOffIcon/> }
        </span> 
    );
  };

  const getDescription = ({ address, zipcode, city, phone, email }) => {
    return (
      <>
          <p>
            <span className="mr-1"><LocationOnIcon/></span>
            { address }<br/>
            <span className="ml-7">{ zipcode } - { city }</span>
          </p>
          <p className="text-gray-400 italic text-xs">
            <span className="mr-2 text-xs"><PhoneIcon/></span>
            { phone }<br/>
            <span className="mr-2 text-xs"><EmailIcon/></span>
            { email }
          </p>
      </>
    );
  };

  const ClientDescription = () => (
        <FunctionField 
            source="address"
            label=""
            render={record => getDescription(record) }
        />
    );

  return (
    <List resource="clients" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.name }
              secondaryText={ record => getDescription(record) }
              tertiaryText={ record => getState(record) }
              linkType="edit"
            /> 
            :
            <Datagrid expand={ <ClientDescription/> } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="name" label="Nom" sortable={ true }/>
                <DateField source="createdAt" label="Création"/>
                <DateField source="updatedAt" label="Mise à jour"/>
                <BooleanField source="active" label="Compte activé" textAlign="center"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}