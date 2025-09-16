import { type NextPage } from "next";
import React, { useEffect, useState } from 'react';
import {
  Datagrid,
  List,
  Button as ReactAdminButton,
  TextInput,
  TextField,
  BooleanInput,
  CreateButton,
  TopToolbar,
  DateField,
  NumberField,
  EditButton,
  ShowButton,
  BooleanField,
  SimpleList,
  Form, 
  useListContext
} from "react-admin";
import Button from '@mui/material/Button';
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import FilterListIcon from '@mui/icons-material/FilterList';
import { useMediaQuery, Theme, Box } from '@mui/material';
import { isDefined, isNotBlank } from "../../../app/lib/utils";
import { useSessionContext } from "../SessionContextProvider";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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

const CustomListActions = ({ showMore, setShowMore, isSmall, resource }) => {
  
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
      <CustomCSVButton onClick={ () => handleExport('csv') } isSmall={isSmall}/>
      <CustomPDFButton onClick={ () => handleExport('pdf') } isSmall={isSmall}/>
    </TopToolbar>
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
      'aeronef.immatriculation': filterValues['aeronef.immatriculation'] || '',
      changementMoteur: isNotBlank(filterValues?.changementMoteur) && filterValues?.changementMoteur ? true : ''
      
    });

    useEffect(() => {
      handleBooleanChange({target: {name: 'changementMoteur', checked: ''}})
    }, [showMore]);
  
    useEffect(() => {
        setFormValues({
          'aeronef.immatriculation': filterValues['aeronef.immatriculation'] || '',
          changementMoteur: isNotBlank(filterValues?.changementMoteur) && filterValues?.changementMoteur ? true : ''
          
        });
    }, [filterValues]);
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...formValues, [name]: value };
        setFormValues(newValues);
        setFilters(newValues); 
    };

    const handleBooleanChange = (e) => {
      const { name, checked } = e.target;
      const newValue = isNotBlank(checked) && checked ? true : '';
      const newValues = { ...formValues, [name]: newValue };
      setFormValues(newValues);
      setFilters(newValues); 
  };
  
    return !showMore ? <></> :
        <Form>
            <Box display="flex" flexWrap="wrap" columnGap={isSmall ? 6 : 2} rowGap={0.5} mt={1} alignItems="flex-end">
                <TextInput
                    source="aeronef.immatriculation"
                    label="Aéronef"
                    onChange={handleChange}
                    defaultValue={formValues['aeronef.immatriculation']}
                    sx={{ width: isSmall ? '100%' : 200 }}
                />
                <BooleanInput
                    source="changementMoteur"
                    label="Changement moteur"
                    onChange={handleBooleanChange}
                    //@ts-ignore
                    defaultChecked={ formValues['changementMoteur'] ?? false }
                    sx={{ width: isSmall ? '100%' : 300, marginBottom: '0.5em' }}
                />
            </Box>
        </Form>
};

const InterventionExpansion = () => <TextField source="intervention" label="Détail de l'intervention"/>

export const EntretiensList: NextPage<Props> = ({ data, hubURL, page }) => {

  const collection = useMercure(data, hubURL);
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const defaultFilters = {};
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <List 
      resource="entretiens" 
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall} resource="entretiens" />}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.aeronef.immatriculation + (isDefined(record.changementMoteur) && record.changementMoteur ? ' - Nouveau moteur' : '') }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.date)).toLocaleDateString("fr-FR", options) } `}
              tertiaryText={ record => record.horametreIntervention +'h' }
              linkType="show"
            /> 
            : 
            <Datagrid expand={ <InterventionExpansion/> } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" label="Date" sortable={ true } />
                <TextField source="aeronef.immatriculation" label="Aéronef" sortable={ true }/>
                <NumberField source="horametreIntervention" options={{ style: 'unit', unit: 'hour' }} label="Horamètre à l'intervention"/>
                <BooleanField source="changementMoteur" label="Changement moteur" textAlign="center"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}