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
  SimpleList,
  ShowButton
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Origine } from "../../../types/Origine";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme } from '@mui/material';

export interface Props {
  data: PagedCollection<Origine> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);

export const OriginesList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="origines" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.name }
              tertiaryText={ record => record.discount.toFixed(2) + '%' }
              linkType="edit"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="name" label="Nom" sortable={ true }/>
                <NumberField source="discount" options={{ style: 'percent' }} label="Remise" transform={v => v / 100}/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}