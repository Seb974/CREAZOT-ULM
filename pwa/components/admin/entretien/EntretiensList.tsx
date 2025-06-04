import { type NextPage } from "next";
import React, { useEffect, useState } from 'react';
import {
  Datagrid,
  List,
  TextInput,
  TextField,
  BooleanInput,
  CreateButton,
  ExportButton,
  TopToolbar,
  DateField,
  NumberField,
  EditButton,
  ShowButton,
  BooleanField,
  SimpleList,
  FilterButton,
  Form, 
  Button,
  useListContext
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import FilterListIcon from '@mui/icons-material/FilterList';
import { useMediaQuery, Theme, Box } from '@mui/material';
import { isDefined } from "../../../app/lib/utils";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const CustomListActions = ({ showMore, setShowMore }) => (
  <TopToolbar>
    <CustomFilterButton showMore={showMore} setShowMore={setShowMore}/>
    <CreateButton/>
    <ExportButton />
  </TopToolbar>
);

const CustomFilterButton = ({ showMore, setShowMore }) => {
  return (
    <Button
      size="small"
      color="primary"
      onClick={() => setShowMore(!showMore)}
      startIcon={<FilterListIcon />}
    >
      <FilterListIcon />
    </Button>
  );
};

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
      'aeronef.immatriculation': filterValues['aeronef.immatriculation'] || '',
      changementMoteur: isDefined(filterValues.changementMoteur) ? filterValues.changementMoteur : ''
    });

    useEffect(() => {
      showMore ? handleBooleanChange({target: {name: 'changementMoteur', checked: false}}) : handleBooleanChange({target: {name: 'changementMoteur', checked: ''}}); 
    }, [showMore]);
  
    useEffect(() => {
        setFormValues({
          'aeronef.immatriculation': filterValues['aeronef.immatriculation'] || '',
          changementMoteur: isDefined(filterValues.changementMoteur) ? filterValues.changementMoteur : ''
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
      const newValues = { ...formValues, [name]: checked };
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
                    defaultChecked={formValues['changementMoteur']}
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
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore}/>}
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