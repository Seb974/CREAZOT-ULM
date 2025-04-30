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
  SimpleList,
  ShowButton
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { useMediaQuery, Theme } from '@mui/material';
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

export const CircuitsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="circuits" actions={<ListActions/>} pagination={false}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.code + ' - ' +  record.nom }
              // @ts-ignore
              secondaryText={ record => (new Date(record.duree)).toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'})  + ' à ' + record.prix.toFixed(2) + '€'}
              tertiaryText={ record => record.nature.code }
              linkType="show"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="code" label="Code" sortable={ true }/>
                <TextField source="nom" label="Nom" sortable={ true }/>
                <TextField source="nature.code" label="Nature" sortable={ true }/>
                <DateField source="duree" label="Durée" sortable={ false } showTime showDate={false} options={{ hour: '2-digit', minute: '2-digit' }}/>
                <NumberField source="prix" options={{ style: 'currency', currency: 'EUR' }} label="Prix"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}