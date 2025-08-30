import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  TopToolbar,
  DateField,
  NumberField,
  EditButton,
  SimpleList,
  ShowButton
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { useMediaQuery, Theme, Button } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSessionContext } from "../SessionContextProvider";

export interface Props {
  data: PagedCollection<Circuit> | null;
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

export const CircuitsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="circuits" actions={<ListActions isSmall={isSmall} resource="circuits"/>} pagination={false}>
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