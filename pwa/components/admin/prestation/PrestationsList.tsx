
import { type NextPage } from "next";
import { FieldGuesser } from "@api-platform/admin";
import {
  TextInput,
  Datagrid,
  useRecordContext,
  List,
  TextField,
  EditButton,
  CreateButton,
  ExportButton,
  FilterButton,
  TopToolbar,
  DateField,
  NumberField,
  DateInput,
  ShowButton,
  ArrayField,
  FunctionField,
} from "react-admin";

import { type Prestation } from "../../../types/Prestation";
import { type PagedCollection } from "../../../types/collection";

export interface Props {
  data: PagedCollection<Prestation> | null;
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
  <TextInput source="pilote.firstName" key="Pilote" label="Pilote" />,
  <DateInput source="date[after]"  key="DateMin" label="Date Min"/>,
  <DateInput source="date[before]"  key="DateMax" label="Date Max"/>,
];

export const PrestationsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const VolsExpansion = () => {
    const record = useRecordContext();
    return (
      <>
        <ArrayField source="vols">
            <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}} className="text-xs italic">
                <NumberField source="quantite" label="Nb vol(s)"/>
                <FunctionField
                  source="circuit"
                  render={record => <p>{record.circuit.code} - <span className="text-xs italic">{record.circuit.nom}</span></p>}
                />
                <FunctionField
                  source="nature"
                  render={record => <p>{record.circuit.nature.code} - <span className="text-xs italic">{record.circuit.nature.label}</span></p>}
                />
                <TextField source="option.nom" label="Option"/>
            </Datagrid>
        </ArrayField>
        
      </>
    );
  };

  return (
    <List resource="prestations" actions={<ListActions/>} filters={ filters }>
        <Datagrid expand={ <VolsExpansion/> } sx={{ '& .RaDatagrid-expandedPanel': {backgroundColor: '#ededed'}, '& .RaDatagrid-tbody': {backgroundColor: '#FFFFFF'}, '& .RaDatagrid-headerCell': {backgroundColor: '#ededed'}}}>
            <TextField source="aeronef.immatriculation" label="Aéronef" sortable={ true }/>
            <DateField source="date" sortable={ true }/>
            <TextField source="pilote.firstName" label="Pilote" sortable={ true }/>
            <NumberField source="horametreDepart"/>
            <NumberField source="duree" label="Durée"/>
            <NumberField source="horametreFin"/>
            <TextField source="remarques" label="Remarques"/>
            <>
                <ShowButton />
                <EditButton />
            </>
        </Datagrid>
    </List>
  );
}

