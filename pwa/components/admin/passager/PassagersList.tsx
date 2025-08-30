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
  SimpleList,
  EmailField,
  useListContext
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { isDefined } from "../../../app/lib/utils";
import { useMediaQuery, Theme, Button } from '@mui/material';
import { useSessionContext } from "../../admin/SessionContextProvider";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = ({ resource, isAdmin, isSmall }) => {

    const { filterValues } = useListContext();
    const { session } = useSessionContext();
    const params = new URLSearchParams();

    Object.entries(filterValues).forEach(([key, value]) => {
        // @ts-ignore
        if (value && typeof value === 'object' && value.after) {
            // @ts-ignore
            if (value.after) params.append(`${key}[after]`, value.after);
            // @ts-ignore
            if (value.before) params.append(`${key}[before]`, value.before);
        } else if (value != null) {
            // @ts-ignore
            params.append(key, value);
        }
    });

    const handleExport = async (format) => {

        const url = `/exports/${resource}?${params.toString()}&format=${format}`;
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
          <CreateButton/>
          {/* @ts-ignore */}
          { isAdmin && <CustomCSVButton onClick={ () => handleExport('csv') } isSmall={isSmall}/> }
          {/* @ts-ignore */}
          { isAdmin && <CustomPDFButton onClick={ () => handleExport('pdf') } isSmall={isSmall}/> }
      </TopToolbar>
    )
};

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

export const PassagersList: NextPage<Props> = ({ data, hubURL, page }) => {

  const { session } = useSessionContext();
  const user = session?.user;
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const isAdmin = isDefined(session) && isDefined(user) && user?.roles.includes("admin");

  return (
    <List resource="passagers" actions={<ListActions resource="passagers"  isSmall={isSmall} isAdmin={ isAdmin }/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.nom + ' ' +  record.prenom }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.date)).toLocaleDateString("fr-FR", options) } `}
              linkType="show"
            /> 
            : 
            <Datagrid bulkActionButtons={ isAdmin } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" label="Date" sortable={ true } />
                <TextField source="nom" label="Nom" sortable={ true }/>
                <TextField source="prenom" label="Prénom" sortable={ true }/>
                <TextField source="telephone" label="Prénom" sortable={ true }/>
                <EmailField source="email" label="Adresse email"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}