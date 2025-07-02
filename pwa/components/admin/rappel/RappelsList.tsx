import { type NextPage } from "next";
import React, { useEffect, useState } from 'react';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
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
import { useClient } from '../ClientProvider';
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
        'titre': filterValues['titre'] || '',
        'debut[after]': filterValues['debut[after]'] ? toLocalDateString(new Date(filterValues['debut[after]'])) : '',
        'debut[before]': filterValues['debut[before]'] ? toLocalDateString(new Date(filterValues['debut[before]'])) : ''
    });

    useEffect(() => {
        setFormValues({
            'titre': filterValues['titre'] || '',
            'debut[after]': filterValues['debut[after]'] ? toLocalDateString(new Date(filterValues['debut[after]'])) : '',
            'debut[before]': filterValues['debut[before]'] ? toLocalDateString(new Date(filterValues['debut[before]'])) : ''
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
                  source="titre"
                  label="Titre du rappel"
                  onChange={handleChange}
                  defaultValue={formValues['titre']}
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

export const RappelsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const defaultFilters = {};
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const getRecurrenceLabel = ({recurrent, jour}) => {
    const weekDays = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
    return !recurrent ? '-' : weekDays[jour];
  };

  return (
    <List 
      resource="rappels" 
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => <span className={ record.finished ? 'line-through' : ''}>{record.important && <NotificationImportantIcon className="text-red-500 mr-2"/>}{ record.titre }</span> }
              secondaryText={ record => <span className={ record.finished ? 'line-through' : ''}>{record.description}</span>}
              tertiaryText={ record => record.important && <NotificationImportantIcon className="text-red-500 mr-2"/> }
              linkType="show"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" label="Date" />
                <FunctionField
                    source="titre"
                    label="Titre"
                    render={record => <>{record.important && <NotificationImportantIcon className="text-red-500 mr-2"/>}{ record.titre }</> }
                />
                <TextField source="description" label="Description" />
                <FunctionField
                    source="recurrent"
                    label="Tâche récurrente"
                    render={record => <>{ getRecurrenceLabel(record) }</> }
                />
                <BooleanField source="finished" label="Clôturé"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
          }
    </List>
  );
}