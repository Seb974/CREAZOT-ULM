import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  DateField,
  NumberField,
  EditButton,
  ShowButton,
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

export const EntretiensList: NextPage<Props> = ({ data, hubURL, page }) => {

  const collection = useMercure(data, hubURL);

  const InterventionExpansion = () => <TextField source="intervention" label="Détail de l'intervention"/>

  return (
    <List resource="entretiens" actions={<ListActions/>}>
        <Datagrid expand={ <InterventionExpansion/> } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
            <DateField source="date" label="Date" sortable={ true } />
            <TextField source="aeronef.immatriculation" label="Aéronef" sortable={ true }/>
            <NumberField source="horametreIntervention" options={{ style: 'unit', unit: 'hour' }} label="Horamètre à l'intervention"/>
            <NumberField source="horametreNextIntervention" options={{ style: 'unit', unit: 'hour' }} label="Prochaine intervention"/>
            <p className="text-right">
                <ShowButton />
                <EditButton />
            </p>
        </Datagrid>
    </List>
  );
}