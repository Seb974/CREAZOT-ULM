import { type NextPage } from "next";
import React, { useEffect, useState } from 'react';
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
  TextInput,
  DateInput,
  FunctionField,
  BooleanField,
  SimpleList,
  useRecordContext,
  useListContext,
  Form
} from "react-admin";
import Button from '@mui/material/Button';
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import FilterListIcon from '@mui/icons-material/FilterList';
import { isDefined, toLocalDateString } from "../../../app/lib/utils";
import { TextFieldProps, Box, useMediaQuery, Theme } from "@mui/material";
import { status } from "../../../app/lib/reservation";
import { useClient } from '../../admin/ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const CustomListActions = ({ showMore, setShowMore, isSmall }) => (
  <TopToolbar>
    <CustomFilterButton showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
        'debut[after]': filterValues['debut[after]'] ? toLocalDateString(new Date(filterValues['debut[after]'])) : '',
        'debut[before]': filterValues['debut[before]'] ? toLocalDateString(new Date(filterValues['debut[before]'])) : '',
        'nom': filterValues['nom'] || '',
        'circuit.code': filterValues['circuit.code'] || '',
    });

    useEffect(() => {
        setFormValues({
            'debut[after]': filterValues['debut[after]'] ? toLocalDateString(new Date(filterValues['debut[after]'])) : '',
            'debut[before]': filterValues['debut[before]'] ? toLocalDateString(new Date(filterValues['debut[before]'])) : '',
            'nom': filterValues['nom'] || '',
            'circuit.code': filterValues['circuit.code'] || '',
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
              <TextInput
                  source="nom"
                  label="Passager"
                  onChange={handleChange}
                  defaultValue={formValues['nom']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <TextInput
                  source="circuit.code"
                  label="Circuit"
                  onChange={handleChange}
                  defaultValue={formValues['circuit.code']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <DateInput
                  source="debut[after]"
                  label="Date Min"
                  onChange={handleChange}
                  defaultValue={formValues['debut[after]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <DateInput
                  source="debut[before]"
                  label="Date Max"
                  onChange={handleChange}
                  defaultValue={formValues['debut[before]']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
          </Box>
      </Form>
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

const ColoredTextField = (props: TextFieldProps) => {
  const record = useRecordContext();
  return (
      <TextField
          source="nom"
          // @ts-ignore
          label="Passager"
          sortable={ true }
          sx={{ color: isDefined(record.color) ? record.color : 'black' }}
          {...props}
      />
  );
};

const ColoredRowSx = (record, index) => ({
  color: isDefined(record.color) ? record.color : 'black',
});

const OptionField = ({ client }) => {
  return !clientWithOptions(client) ? null :
    <TextField source="option.nom" label="Option"/>
};

export const ReservationsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const { client } = useClient();
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
  const defaultFilters = {};
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const getStatusLabel = ({statut, report}) => {
    const selectedStatus = status.find(s => s.id === statut);
    return isDefined(selectedStatus) ? selectedStatus.name : report ? status[2].name : status[0].name;
  };

  return (
    <List 
      resource="reservations" 
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      // onFilterChange={setFilters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.nom }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.debut)).toLocaleString("fr-FR", options) } `}
              tertiaryText={ record => record.circuit.code + (isDefined(record.option) ? (' + ' + record.option.nom) : ' ') }
              rowSx={ ColoredRowSx }
              linkType="show"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="debut" label="Date" sortable={ true } />
                <DateField source="debut" label="Heure" showTime showDate={false} options={{ hour: '2-digit', minute: '2-digit' }}/>
                <ColoredTextField />
                <TextField source="telephone" label="Téléphone" />
                <TextField source="circuit.code" label="Circuit" />
                <OptionField client={client}/>
                <FunctionField
                    source="statut"
                    label="Statut"
                    render={record => <>{ getStatusLabel(record) }</> }
                />
                <BooleanField source="report" label="Report"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
          }
    </List>
  );
}