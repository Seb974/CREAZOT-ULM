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
  Form,
  ArrayField
} from "react-admin";
import Button from '@mui/material/Button';
import { Fragment } from 'react';
import { type Vol } from "../../../types/Vol";
import FilterListIcon from '@mui/icons-material/FilterList';
import { type PagedCollection } from "../../../types/collection";
import { isDefined, toLocalDateString } from "../../../app/lib/utils";
import { useMediaQuery, Theme } from '@mui/material';
import { useClient } from '../../admin/ClientProvider';
import { clientWithLandingManagement, clientWithOptions } from "../../../app/lib/client";
import { useSessionContext } from "../../admin/SessionContextProvider";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export interface Props {
  data: PagedCollection<Vol> | null;
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
      <CustomCSVButton onClick={ () => handleExport('csv') } isSmall={isSmall}/>
      <CustomPDFButton onClick={ () => handleExport('pdf') } isSmall={isSmall}/>
    </TopToolbar>
  );
};

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

const LandingsExpansion = () => {

  return (
    <ArrayField source="landings">
      <Datagrid isRowSelectable={record => false} rowClick={false} bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }} className="text-xs italic">
          <FunctionField
              source="airportCode"
              label="Aéroport"
              render={record => record.airportName}
          />
          <NumberField source="complets" label="Complet(s)" />
          <NumberField source="touches" label="Touché(s)" />
      </Datagrid>
    </ArrayField>
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

const CustomBody = (props) => {

    const { data, isLoading } = useListContext();
    const { session } = useSessionContext();
    const { client } = useClient();
    const user = session?.user;
    const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin");
  
    if (isLoading || !data) return null;
  
    const totalVols = data.reduce((sum, row) => sum + row.quantite, 0);
    const totalCoutPilote = data.reduce((sum, row) => sum + row.cout, 0);
    const totalCA = data.reduce((sum, row) => sum + row.prix, 0);

    const mergedColumns = clientWithLandingManagement(client) ?
        (hasAdminAccess(user) ? 5 : 4) : 
        (hasAdminAccess(user) ? 4 : 3);

    return (
      <Fragment>
        <DatagridBody {...props} />
        <TableFooter>
          <TableRow sx={{ backgroundColor: '#ededed', fontStyle: 'italic', fontWeight: 'bold', color: '#555'  }}>
              <TableCell colSpan={ mergedColumns } sx={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
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

const MobileFooter = (props) => {
    const { data, isLoading } = useListContext();
  
    if (isLoading || !data) return null;
  
    const totalVols = data.reduce((sum, row) => sum + row.quantite, 0);
    const totalCoutPilote = data.reduce((sum, row) => sum + row.cout, 0);

    return (
      <div style={{
          padding: '0.5em 1em',
          background: '#ededed',
          fontSize: '0.8em',
          fontWeight: 'bolder',
          display: 'flex',
          justifyContent: 'space-between'
      }}>
          <span>{`${ totalVols.toFixed(0) } vols`}</span>
          <span>{`Pilote : ${ totalCoutPilote.toFixed(2) } €`}</span>
      </div>
    );
};

const CustomDatagrid = () => {

    const { client } = useClient();
    const { session } = useSessionContext();
    const user = session?.user;
    const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin");
    // @ts-ignore
    const isAdmin = isDefined(session) && isDefined(user) && user?.roles.includes("admin");

    const OptionField = () => {
      return !clientWithOptions(client) ? null :
        <TextField source="option.nom" label="Option" sortable={ true }/>
    };

    return (
      <Datagrid body={<CustomBody/>} expand={clientWithLandingManagement(client) && <LandingsExpansion/>} bulkActionButtons={ isAdmin } sx={{'& .RaDatagrid-tbody': {backgroundColor: '#FFFFFF'}, '& .RaDatagrid-headerCell': {backgroundColor: '#ededed'}}}>
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

  const { session } = useSessionContext();
  const user = session?.user;
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const defaultFilters = {}; 
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin");

  return (
    <List 
      resource="vols" 
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall} resource="vols"/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      filter={ !hasAdminAccess(user) ? { "prestation.pilote.email": user.email } : null}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    > 
        { isSmall ? 
          <>
            <SimpleList
              primaryText={ record => record.prestation.aeronefImmatriculation + ' | ' +  (isDefined(record.prestation) && isDefined(record.prestation.pilotName) && record.prestation.pilotName !== '' ? record.prestation.pilotName : '') }
              // @ts-ignore
              secondaryText={ record => `${ (new Date(record.prestation.date)).toLocaleDateString("fr-FR", options) } `}
              tertiaryText={ record => record.quantite + ' x ' + record.circuit.code }
              linkType="show"
            />
            <MobileFooter/>
          </>
            : 
            <CustomDatagrid/>
        }
    </List>
  );
}