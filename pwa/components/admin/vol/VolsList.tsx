import { type NextPage } from "next";
import React, { useEffect, useState } from 'react';
import { TableRow, TableCell, TableFooter, Box } from '@mui/material';
import {
  TextInput,
  FunctionField,
  Datagrid,
  DatagridBody,
  List,
  TextField,
  ExportButton,
  TopToolbar,
  DateField,
  NumberField,
  DateInput,
  SimpleList,
  useListContext,
  Form
} from "react-admin";
import Button from '@mui/material/Button';
import { Fragment } from 'react';
import { type Vol } from "../../../types/Vol";
import FilterListIcon from '@mui/icons-material/FilterList';
import { type PagedCollection } from "../../../types/collection";
import { useSession } from "next-auth/react";
import { isDefined, toLocalDateString } from "../../../app/lib/utils";
import { useMediaQuery, Theme } from '@mui/material';
import { useClient } from '../../admin/ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";

export interface Props {
  data: PagedCollection<Vol> | null;
  hubURL: string | null;
  page: number;
}

const CustomListActions = ({ showMore, setShowMore, isSmall }) => (
  <TopToolbar>
    <CustomFilterButton showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>
    <ExportButton />
  </TopToolbar>
);

const CustomFilterBar = ({ showMore, isSmall }) => {

  const { filterValues, setFilters } = useListContext();
  const [formValues, setFormValues] = useState({
      'prestation.date[after]': filterValues['prestation.date[after]'] ? toLocalDateString(new Date(filterValues['prestation.date[after]'])) : '',
      'prestation.date[before]': filterValues['prestation.date[before]'] ? toLocalDateString(new Date(filterValues['prestation.date[before]'])) : '',
      'prestation.pilote.firstName': filterValues['prestation.pilote.firstName'] || '',
      'prestation.aeronef.immatriculation': filterValues['prestation.aeronef.immatriculation'] || '',
      'circuit.code': filterValues['circuit.code'] || ''
  });

  useEffect(() => {
      setFormValues({
          'prestation.date[after]': filterValues['prestation.date[after]'] ? toLocalDateString(new Date(filterValues['prestation.date[after]'])) : '',
          'prestation.date[before]': filterValues['prestation.date[before]'] ? toLocalDateString(new Date(filterValues['prestation.date[before]'])) : '',
          'prestation.pilote.firstName': filterValues['prestation.pilote.firstName'] || '',
          'prestation.aeronef.immatriculation': filterValues['prestation.aeronef.immatriculation'] || '',
          'circuit.code': filterValues['circuit.code'] || ''
      });
  }, [filterValues]);

  const handleChange = (e) => {
      const { name, value } = e.target;
      const newValues = { ...formValues, [name]: value };
      setFormValues(newValues);
      setFilters(newValues); 
  };

  return !showMore ? <></> :
    <Form>
        <Box display="flex" flexWrap="wrap" columnGap={isSmall ? 6 : 2} rowGap={0.5} mt={1} alignItems="flex-end">
            <TextInput
                source="prestation.pilote.firstName"
                label="Pilote"
                onChange={handleChange}
                defaultValue={formValues['prestation.pilote.firstName']}
                sx={{ width: isSmall ? '100%' : 200 }}
            />
            <TextInput
                source="prestation.aeronef.immatriculation"
                label="Aéronef"
                onChange={handleChange}
                defaultValue={formValues['prestation.aeronef.immatriculation']}
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
                source="prestation.date[after]"
                label="Date Min"
                onChange={handleChange}
                defaultValue={formValues['prestation.date[after]']}
                sx={{ width: isSmall ? '100%' : 200 }}
            />
            <DateInput
                source="prestation.date[before]"
                label="Date Max"
                onChange={handleChange}
                defaultValue={formValues['prestation.date[before]']}
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

const CustomBody = (props) => {

    const { data, isLoading } = useListContext();
    const session = useSession();
    const user = session.data.user;
    const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin");
  
    if (isLoading || !data) return null;
  
    const totalVols = data.reduce((sum, row) => sum + row.quantite, 0);
    const totalCoutPilote = data.reduce((sum, row) => sum + row.cout, 0);
    const totalCA = data.reduce((sum, row) => sum + row.prix, 0);

    return (
      <Fragment>
        <DatagridBody {...props} />
        <TableFooter>
          <TableRow sx={{ backgroundColor: '#ededed', fontStyle: 'italic', fontWeight: 'bold', color: '#555'  }}>
              <TableCell colSpan={4} sx={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
                Totaux
              </TableCell>
              <TableCell style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>
                <strong>{totalVols}</strong>
              </TableCell>
              <TableCell colSpan={3}/>
              <TableCell style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>
                <strong>{totalCoutPilote.toFixed(2)} €</strong>
              </TableCell>
              { hasAdminAccess(user) && 
                <TableCell style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>
                  <strong>{totalCA.toFixed(2)} €</strong>
                </TableCell>
              }
            </TableRow>
          </TableFooter>
      </Fragment>
    );
};

const CustomDatagrid = () => {

    const { client } = useClient();
    const session = useSession();
    const user = session.data.user;
    const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin");

    const OptionField = () => {
      return !clientWithOptions(client) ? null :
        <TextField source="option.nom" label="Option" sortable={ true }/>
    };

    return (
      <Datagrid body={<CustomBody />} sx={{'& .RaDatagrid-tbody': {backgroundColor: '#FFFFFF'}, '& .RaDatagrid-headerCell': {backgroundColor: '#ededed'}}}>
            <DateField source="prestation.date" label="Date" sortable={ true }/>
            <TextField source="prestation.aeronef.immatriculation" label="Aéronef" sortable={ true }/>
            <FunctionField
                label="Pilote"
                source="prestation.pilotName"
                sortable={ true }
                render={(record) => (
                    <>
                      { isDefined(record.prestation) && isDefined(record.prestation.pilotName) && record.prestation.pilotName !== '' ? record.prestation.pilotName : '' } 
                      { (<span className="text-gray-500 italic text-xs">{isDefined(record.prestation) && isDefined(record.prestation.encadrantName) && record.prestation.encadrantName !== '' ? <span><br/>{record.prestation.encadrantName}</span> : ''}</span>) }
                    </>
                )}
            />
            <NumberField source="quantite" label="Nombre de vol(s)"/>
            <TextField source="circuit.code" label="Circuit" sortable={ true }/>
            <TextField source="circuit.nature.code" label="Nature" sortable={ true }/> 
            <OptionField/>
            <NumberField source="cout" label={hasAdminAccess(user) ? "Coût pilote" : "Revenu pilote"} options={{ style: 'currency', currency: 'EUR' }}/>
            { hasAdminAccess(user) && 
                <NumberField source="prix" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
            }
      </Datagrid>
    )
};

export const VolsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const session = useSession();
  const user = session.data.user;
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const defaultFilters = {}; 
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin");

  return (
    <List 
      resource="vols" 
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      filter={ !hasAdminAccess(user) ? { "prestation.pilote.email": user.email } : null}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    > 
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.prestation.aeronefImmatriculation + ' | ' +  (isDefined(record.prestation) && isDefined(record.prestation.pilotName) && record.prestation.pilotName !== '' ? record.prestation.pilotName : '') }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.prestation.date)).toLocaleDateString("fr-FR", options) } `}
              tertiaryText={ record => record.quantite + ' x ' + record.circuit.code }
              linkType="show"
            /> 
            : 
            <CustomDatagrid />
        }
    </List>
  );
}