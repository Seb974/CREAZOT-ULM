import { type NextPage } from "next";
import {
  TextInput,
  Datagrid,
  useRecordContext,
  List,
  TextField,
  ExportButton,
  FilterButton,
  TopToolbar,
  DateField,
  NumberField,
  DateInput,
} from "react-admin";

import { useMercure } from "../../../utils/mercure";
import { type Vol } from "../../../types/Vol";
import { type PagedCollection } from "../../../types/collection";
import { useSession } from "next-auth/react";
import { isDefined } from "../../../app/lib/utils";
export interface Props {
  data: PagedCollection<Vol> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <FilterButton/> 
      {/* <CreateButton/> */}
      <ExportButton/>
  </TopToolbar>
);

const filters = [
  <TextInput source="prestation.aeronef.immatriculation" key="Aeronef" label="Aéronef"/>,
  <TextInput source="prestation.pilote.firstName" key="Pilote" label="Pilote" />,
  <TextInput source="circuit.code" key="Circuit" label="Circuit" />,
  <DateInput source="prestation.date[after]"  key="DateMin" label="Date Min"/>,
  <DateInput source="prestation.date[before]"  key="DateMax" label="Date Max"/>,
];

export const VolsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const session = useSession();
  const user = session.data.user;

  const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin")

  return (
    <List resource="vols" actions={<ListActions/>} filters={ filters } filter={ !hasAdminAccess(user) ? { "prestation.pilote.email": user.email } : null}> 
        <Datagrid  sx={{'& .RaDatagrid-tbody': {backgroundColor: '#FFFFFF'}, '& .RaDatagrid-headerCell': {backgroundColor: '#ededed'}}}>
            <DateField source="prestation.date" label="Date" sortable={ true }/>
            <TextField source="prestation.aeronef.immatriculation" label="Aéronef" sortable={ true }/>
            <TextField source="prestation.pilote.firstName" label="Pilote" sortable={ true }/>
            <NumberField source="quantite" label="Nombre de vol(s)"/>
            <TextField source="circuit.code" label="Circuit" sortable={ true }/>
            <TextField source="circuit.nature.code" label="Nature" sortable={ true }/> 
            <TextField source="option.nom" label="Option" sortable={ true }/>
            <NumberField source="cout" label={hasAdminAccess(user) ? "Coût pilote" : "Revenu pilote"} options={{ style: 'currency', currency: 'EUR' }}/>
            { hasAdminAccess(user) && 
                <NumberField source="prix" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
            }
        </Datagrid>
    </List>
  );
}