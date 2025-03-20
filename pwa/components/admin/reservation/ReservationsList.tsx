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
  TextInput,
  DateInput,
  FilterButton,
  FunctionField,
  BooleanField,
  useCreate,
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
      <FilterButton/> 
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);

const filters = [
  <TextInput source="avion.immatriculation" key="Aeronef" label="Aéronef"/>,
  <TextInput source="pilote.firstName" key="Pilote" label="Pilote" />,
  <TextInput source="circuit.code" key="Circuit" label="Circuit" />,
  <DateInput source="debut[after]"  key="DateMin" label="Date Min"/>,
  <DateInput source="debut[before]"  key="DateMax" label="Date Max"/>,
];

export const ReservationsList: NextPage<Props> = ({ data, hubURL, page }) => {

  return (
    <List resource="reservations" actions={<ListActions/>} filters={ filters }>
        <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
            <DateField source="debut" label="Date" sortable={ true } />
            <DateField source="debut" label="Heure" showTime showDate={false}/>
            <TextField source="nom" label="Passager" sortable={ true }/>
            <TextField source="telephone" label="Téléphone" />
            <FunctionField
                source="circuit.code"
                label="Circuit"
                render={record => <>{record.quantite}<span className="text-xs italic">{'x'}</span> { record.circuit.code }</> }
                textAlign="right"
            />
            <TextField source="option.nom" label="Option"/>
            {/* <TextField source="pilote.firstName" label="Pilote" sortable={ true }/>
            <TextField source="avion.immatriculation" label="Aéronef" sortable={ true }/> */}
            <BooleanField source="report" label="Report"/>

            
            <p className="text-right">
                <ShowButton />
                <EditButton />
            </p>
        </Datagrid>
    </List>
  );
}