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
  ShowButton
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Origine } from "../../../types/Origine";
import { type PagedCollection } from "../../../types/collection";

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

  return (
    <List resource="origines" actions={<ListActions/>}>
        <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
            <TextField source="name" label="Nom" sortable={ true }/>
            <NumberField source="discount" options={{ style: 'percent' }} label="Remise" transform={v => v / 100}/>
            <p className="text-right">
                <ShowButton />
                <EditButton />
            </p>
        </Datagrid>
    </List>
  );
}