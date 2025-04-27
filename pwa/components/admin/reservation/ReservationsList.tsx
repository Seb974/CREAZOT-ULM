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
  TextInput,
  DateInput,
  FilterButton,
  FunctionField,
  BooleanField,
  SimpleList,
  useRecordContext,
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { isDefined } from "../../../app/lib/utils";
import { TextFieldProps } from "@mui/material";
import { useMediaQuery, Theme } from '@mui/material';

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
  <TextInput source="nom" key="Passager" label="Passager"/>,
  <DateInput source="debut[before]"  key="DateMax" label="Date Max"/>,
  <DateInput source="debut[after]"  key="DateMin" label="Date Min"/>,
  <TextInput source="circuit.code" key="Circuit" label="Circuit" />,
];

const ColoredTextField = (props: TextFieldProps) => {
  const record = useRecordContext();
  return (
      <TextField
          source="nom"
          // @ts-ignore
          label="Passager"
          sortable={ true }
          sx={{ color: isDefined(record.color) ? record.color : 'black' }}
          {...props}
      />
  );
};

const ColoredRowSx = (record, index) => ({
  color: isDefined(record.color) ? record.color : 'black',
});

export const ReservationsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }

  const status = [
    {id: "VALIDATED", name: "Validé"},
    {id: "WAITING", name: "En attente de confirmation"},
    {id: "WHEATER_REPORT", name:"Report météo"},
    {id: "PASSENGER_REPORT", name: "Report client"},
    {id: "INTERN_REPORT", name: "Report interne"},
    {id: "WHEATER_CANCEL", name:"Annulation météo"},
    {id: "PASSENGER_CANCEL", name: "Annulation client"},
    {id: "INTERN_CANCEL", name: "Annulation interne"}
  ];

  const getStatusLabel = ({statut, report}) => {
    const selectedStatus = status.find(s => s.id === statut);
    return isDefined(selectedStatus) ? selectedStatus.name : report ? status[2].name : status[0].name;
};

  return (
    <List resource="reservations" actions={<ListActions/>} filters={ filters }>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.nom }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.debut)).toLocaleString("fr-FR", options) } `}
              tertiaryText={ record => record.circuit.code + (isDefined(record.option) ? (' + ' + record.option.nom) : ' ') }
              rowSx={ ColoredRowSx }
              linkType="show"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                  <DateField source="debut" label="Date" sortable={ true } />
                  <DateField source="debut" label="Heure" showTime showDate={false} options={{ hour: '2-digit', minute: '2-digit' }}/>
                  <ColoredTextField />
                  <TextField source="telephone" label="Téléphone" />
                  <TextField source="circuit.code" label="Circuit" />
                  <TextField source="option.nom" label="Option"/>
                  <FunctionField
                      source="statut"
                      label="Statut"
                      render={record => <>{ getStatusLabel(record) }</> }
                  />
                  <BooleanField source="report" label="Report"/>

                  
                  <p className="text-right">
                      <ShowButton />
                      <EditButton />
                  </p>
              </Datagrid>

              }
        
    </List>
  );
}