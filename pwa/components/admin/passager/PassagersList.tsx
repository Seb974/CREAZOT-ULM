import { type NextPage } from "next";
import { Datagrid, List, TextField, CreateButton, TopToolbar, DateField, EditButton, ShowButton, SimpleList, EmailField, useListContext, Form, DateInput, BooleanField, FunctionField } from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { isDefined, toLocalDateString } from "../../../app/lib/utils";
import { useMediaQuery, Theme, Button, Box } from '@mui/material';
import { useSessionContext } from "../../admin/SessionContextProvider";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { useEffect, useState } from "react";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = ({ showMore, setShowMore, resource, isAdmin, isSmall }) => {

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
          <CustomFilterButton showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>
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

const CustomFilterButton = ({ showMore, setShowMore, isSmall }) => {
  return (
    <Button
      size="small"
      color="primary"
      onClick={() => setShowMore(!showMore)}
      startIcon={<FilterListIcon className={`${isSmall && 'mb-3'}`}/>}
    >
      {!isSmall && 'FILTRER'}
    </Button>
  );
};

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
        'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]']))  : '',
        'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : ''
    });

    useEffect(() => {
        setFormValues({
            'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]']))  : '',
            'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : ''
        });
    }, [filterValues]);
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...formValues, [name]: value };
        setFormValues(newValues);
        setFilters(newValues); 
    };
  
    return !showMore ? <></> :
      <Form >
          <Box display="flex" flexWrap="wrap" columnGap={isSmall ? 6 : 2} rowGap={0.5} mt={1} alignItems="flex-end">
              <DateInput
                  source="date[after]"
                  label="Date Min"
                  onChange={handleChange}
                  defaultValue={formValues['date[after]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <DateInput
                  source="date[before]"
                  label="Date Max"
                  onChange={handleChange}
                  defaultValue={formValues['date[before]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
          </Box>
      </Form>
  };

export const PassagersList: NextPage<Props> = ({ data, hubURL, page }) => {

  
  const { session } = useSessionContext();
  const user = session?.user;
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const isAdmin = isDefined(session) && isDefined(user) && user?.roles.includes("admin");
  const defaultFilters = {};
  
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const getConsentIcon = ({ consentAccepted }) => {
    return isDefined(consentAccepted) ? 
      consentAccepted ? 
        <DoneIcon className="text-green-500"/> : 
        <ClearIcon className="text-red-500"/> :
       <></>
  };

  return (
    <List 
      resource="passagers" 
      actions={<ListActions resource="passagers" showMore={showMore} setShowMore={setShowMore} isSmall={isSmall} isAdmin={ isAdmin }/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.nom + ' ' +  record.prenom }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.date)).toLocaleDateString("fr-FR", options) } `}
              tertiaryText={ record => getConsentIcon(record) }
              linkType="show"
            /> 
            : 
            <Datagrid bulkActionButtons={ isAdmin } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" label="Date" sortable={ true } />
                <TextField source="nom" label="Nom" sortable={ true }/>
                <TextField source="prenom" label="Prénom" sortable={ true }/>
                <TextField source="telephone" label="Prénom" sortable={ true }/>
                <EmailField source="email" label="Adresse email"/>
                <FunctionField 
                    source="consentAccepted"
                    label="Consentement"
                    render={record => getConsentIcon(record) }
                    textAlign="center"
                />
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}