import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  NumberField,
  EditButton,
  ShowButton,
  SimpleList,
} from "react-admin";
import { useMediaQuery, Theme } from '@mui/material';
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


export const CombinaisonsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="combinaisons" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.nom }
              secondaryText={ record => record.minPassager + ' passager' + (record.minPassager > 1 ? 's' : '') + ' requis'}
              tertiaryText={ record => record.prix.toFixed(2) + '€' }
              linkType="edit"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
              <TextField source="nom" label="Option" sortable={ true }/>
              <NumberField source="minPassager" label="Nombre de passager minimal"/>
              <NumberField source="prix" label="Prix" options={{ style: 'currency', currency: 'EUR' }}/>
              <p className="text-right">
                  <ShowButton />
                  <EditButton />
              </p>
            </Datagrid>
        }
    </List>
  );
}