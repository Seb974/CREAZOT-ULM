import { type NextPage } from "next";
import { Datagrid, List, TextField, CreateButton, TopToolbar, EditButton, SimpleList, FunctionField, Form, DateInput, useListContext } from "react-admin";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme, Button, Box } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import { getFirstCharToUpperCase, isDefined, isSameDay, toLocalDateString } from "../../../app/lib/utils";
import { useSessionContext } from "../SessionContextProvider";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useEffect, useState } from "react";

export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

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

const ListActions = ({ session, isSmall, resource, showMore, setShowMore }) => { 

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
      <CustomFilterButton showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>
      <CreateButton className={`${!isSmall && 'mb-[2px]'}`}/>
      <CustomCSVButton onClick={ () => handleExport('csv') } isSmall={isSmall}/>
      <CustomPDFButton onClick={ () => handleExport('pdf') } isSmall={isSmall}/>
    </TopToolbar>
  );
};

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
        'debut[after]': filterValues['debut[after]'] ? toLocalDateString(new Date(filterValues['debut[after]'])) : '',
        'fin[before]': filterValues['fin[before]'] ? toLocalDateString(new Date(filterValues['fin[before]'])) : ''
    });

    useEffect(() => {
        setFormValues({
            'debut[after]': filterValues['debut[after]'] ? toLocalDateString(new Date(filterValues['debut[after]'])) : '',
            'fin[before]': filterValues['fin[before]'] ? toLocalDateString(new Date(filterValues['fin[before]'])) : ''
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
                  source="debut[after]"
                  label="Date Min"
                  onChange={handleChange}
                  defaultValue={formValues['debut[after]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <DateInput
                  source="fin[before]"
                  label="Date Max"
                  onChange={handleChange}
                  defaultValue={formValues['fin[before]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
          </Box>
      </Form>
  };

export const DisponibilitesList: NextPage<Props> = ({ data, hubURL, page }) => {
  const { session } = useSessionContext();
  const user = session?.user;
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  // @ts-ignore
  const isAdmin = isDefined(session) && isDefined(user) && user?.roles.includes("admin");

  const getType = ({ pilote }) => isDefined(pilote?.availableByDefault) ? (pilote?.availableByDefault ? 'Indisponible' : 'Disponible') : '';

  const getDates = ({ debut, fin }) => {
    if (!isDefined(debut) || !isDefined(fin)) return '';
    return isSameDay(debut, fin) ? `le ${ new Date(debut).toLocaleDateString()}` : `du ${ new Date(debut).toLocaleDateString()} au ${ new Date(fin).toLocaleDateString()}`;
  };

  const getAvailability = disponibilite => getFirstCharToUpperCase(`${ getType(disponibilite) } ${ getDates(disponibilite) }`);

  const defaultFilters = {};
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  

  const MotifExpansion = () => <TextField source="motif" label="Motif"/>

  return (
    <List 
      resource="disponibilites" 
      actions={<ListActions session={ session } isSmall={ isSmall } resource="disponibilites" showMore={ showMore } setShowMore={ setShowMore }/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => getFirstCharToUpperCase(record?.pilote?.pilote?.firstName) }
              secondaryText={ record => `${record?.pilote?.availableByDefault ? 'Indisponible' : 'Disponible'} du ${new Date(record?.debut)?.toLocaleDateString()} au ${new Date(record?.fin)?.toLocaleDateString()}`}
              linkType="edit"
            /> 
            :
            <Datagrid expand={ <MotifExpansion/> } rowClick="edit" bulkActionButtons={ isAdmin } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <FunctionField
                    source="pilote"
                    label="Pilote"
                    render={record => <>{ getFirstCharToUpperCase(record?.pilote?.pilote?.firstName) }</> }
                />
                <FunctionField
                    source="availability"
                    label="Restriction"
                    render={record => <>{ getAvailability(record) }</> }
                />
                <p className="text-right">
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}