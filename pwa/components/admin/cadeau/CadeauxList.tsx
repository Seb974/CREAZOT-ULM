import { type NextPage } from "next";
import React, { useEffect, useState } from 'react';
import { Datagrid,
  List,
  TextInput,
  TextField,
  BooleanInput,
  CreateButton,
  ExportButton,
  TopToolbar,
  DateField,
  DateInput,
  EditButton,
  ShowButton,
  BooleanField,
  SimpleList,
  Form, 
  Button,
  useListContext
} from "react-admin";
import DownloadGiftButton from "./DownloadGiftButton";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import FilterListIcon from '@mui/icons-material/FilterList';
import { useMediaQuery, Theme, Box } from '@mui/material';
import { isDefined, toLocalDateString } from "../../../app/lib/utils";

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
      beneficiaire: filterValues.beneficiaire || '',
      offreur: filterValues.offreur || '',
      used: filterValues.used || '',
      'fin[before]': filterValues['fin[before]'] ? toLocalDateString(new Date(filterValues['fin[before]'])) : '',
    });

    useEffect(() => {
      showMore ? handleBooleanChange({target: {name: 'used', checked: false}}) : handleBooleanChange({target: {name: 'used', checked: ''}}); 
    }, [showMore]);
  
    useEffect(() => {
        setFormValues({
          beneficiaire: filterValues.beneficiaire || '',
          offreur: filterValues.offreur || '',
          used: isDefined(filterValues.used) ? filterValues.used : '',
          'fin[before]': filterValues['fin[before]'] ? toLocalDateString(new Date(filterValues['fin[before]'])) : '',
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
                    source="beneficiaire"
                    label="Bénéficiaire"
                    onChange={handleChange}
                    defaultValue={formValues['beneficiaire']}
                    sx={{ width: isSmall ? '100%' : 200 }}
                />
                <TextInput
                    source="offreur"
                    label="Personne offrante"
                    onChange={handleChange}
                    defaultValue={formValues['offreur']}
                    sx={{ width: isSmall ? '100%' : 200 }}
                />
                <DateInput
                    source="fin[after]"
                    label="Date Max de validité"
                    onChange={handleChange}
                    defaultValue={formValues['fin[after]']}
                    sx={{ width: isSmall ? '100%' : 200 }}
                />
                <BooleanInput
                    source="used"
                    label="Bons utilisés"
                    onChange={handleBooleanChange}
                    defaultChecked={formValues['used']}
                    sx={{ width: isSmall ? '100%' : 200, marginBottom: '0.5em' }}
                />
            </Box>
        </Form>
  };

export const CadeauxList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const defaultFilters = {}; 
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <List 
      resource="cadeaux" 
      title="Bons cadeaux"
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore}/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      // onFilterChange={setFilters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.beneficiaire }
              secondaryText={ record => record.code + ' - ' + record.offreur }
              tertiaryText={ record => record.circuit.code + (isDefined(record.option) ? (' + option') : '') }
              linkType="show"
            /> 
            : 
            <Datagrid rowClick={ false } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="code" label="N° de bon"/>
                <TextField source="beneficiaire" label="Bénéficiaire" sortable={ true }/>
                <TextField source="offreur" label="Personne offrante" sortable={ true }/>
                <DateField source="fin" label="Date d'expiration" sortable={ true } />
                <BooleanField source="used" label="utilisé" textAlign="center"/>
                <DownloadGiftButton/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}