import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  TopToolbar,
  NumberField,
  EditButton,
  SimpleList,
  ShowButton,
  BooleanField
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Origine } from "../../../types/Origine";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme, Button } from '@mui/material';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSessionContext } from "../SessionContextProvider";

export interface Props {
  data: PagedCollection<Origine> | null;
  hubURL: string | null;
  page: number;
}

const CustomCSVButton = ({ isSmall, onClick }) => {
  return (
    <Button
      size="small"
      color="primary"
      onClick={() => onClick()}
      startIcon={<BackupTableIcon className={`${isSmall && 'mb-3'}`}/>}
    >
      {!isSmall && 'EXPORT CSV'}
    </Button>
  );
};

const CustomPDFButton = ({ isSmall, onClick }) => {
  return (
    <Button
      size="small"
      color="primary"
      onClick={() => onClick()}
      startIcon={<PictureAsPdfIcon className={`${isSmall && 'mb-3'}`}/>}
    >
      {!isSmall && 'EXPORT PDF'}
    </Button>
  );
};

const ListActions = ({ isSmall, resource }) => { 
  const { session } = useSessionContext();

  const handleExport = async (format) => {

      const url = `/exports/${resource}?format=${format}`;
      const response = await fetch(url, {headers: {'Authorization': `Bearer ${session?.accessToken}`}});

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${resource}.${format}`;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <TopToolbar>
      <CreateButton className={`${!isSmall && 'mb-[2px]'}`}/>
      <CustomCSVButton onClick={ () => handleExport('csv') } isSmall={isSmall}/>
      <CustomPDFButton onClick={ () => handleExport('pdf') } isSmall={isSmall}/>
    </TopToolbar>
  );
};

export const OriginesList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="origines" actions={<ListActions isSmall={isSmall} resource="origines"/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.name }
              tertiaryText={ record => record.discount.toFixed(2) + '%' }
              linkType="edit"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="name" label="Nom" sortable={ true }/>
                <NumberField source="discount" options={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, }} label="Remise" transform={v => v / 100}/>
                <BooleanField source="hasCommission" label="Rétro-commission" textAlign="center"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}