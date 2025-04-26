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
  NumberField,
  EditButton,
  ShowButton,
  BooleanField,
  SimpleList,
  FilterButton
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme } from '@mui/material';
import { isDefined } from "../../../app/lib/utils";

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
  <TextInput source="aeronef.immatriculation" key="Aeronef" label="Aéronef"/>,
  <BooleanInput source="changementMoteur" key="changementMoteur" label="Changement moteur"/>,
];

export const EntretiensList: NextPage<Props> = ({ data, hubURL, page }) => {

  const collection = useMercure(data, hubURL);
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const InterventionExpansion = () => <TextField source="intervention" label="Détail de l'intervention"/>

  return (
    <List resource="entretiens" actions={<ListActions/>} filters={ filters }>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.aeronef.immatriculation + (isDefined(record.changementMoteur) && record.changementMoteur ? ' - Nouveau moteur' : '') }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.date)).toLocaleDateString("fr-FR", options) } `}
              tertiaryText={ record => record.horametreIntervention +'h' }
              linkType="show"
            /> 
            : 
            <Datagrid expand={ <InterventionExpansion/> } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" label="Date" sortable={ true } />
                <TextField source="aeronef.immatriculation" label="Aéronef" sortable={ true }/>
                <NumberField source="horametreIntervention" options={{ style: 'unit', unit: 'hour' }} label="Horamètre à l'intervention"/>
                <BooleanField source="changementMoteur" label="Changement moteur" textAlign="center"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}