import { TableRow, TableCell, TableFooter, Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { type NextPage } from "next";
import {
  TextInput,
  Datagrid,
  DatagridBody,
  List,
  TextField,
  EditButton,
  CreateButton,
  ExportButton,
  TopToolbar,
  DateField,
  NumberField,
  DateInput,
  ShowButton,
  ArrayField,
  SimpleList,
  FunctionField,
  useListContext,
  Form
} from "react-admin";
import Button from '@mui/material/Button';
import { Fragment } from 'react';
import { isDefined, toLocalDateString } from "../../../app/lib/utils";
import { useMediaQuery, Theme } from '@mui/material';
import { useClient } from '../ClientProvider';
import FilterListIcon from '@mui/icons-material/FilterList';
import { clientWithOptions } from "../../../app/lib/client";
import { type Prestation } from "../../../types/Prestation";
import { type PagedCollection } from "../../../types/collection";
import { useSessionContext } from "../../admin/SessionContextProvider";

export interface Props {
  data: PagedCollection<Prestation> | null;
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

const formatHeure = (duree) => {
  const heures = Math.floor(duree);
  const minutes = Math.round((duree - heures) * 60);
  return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const getFormattedDuration = ({ aeronef, duree }) => {
  const hours = Math.trunc(duree);
  const minutes = aeronef.decimal ? Math.round((duree - Math.trunc(duree)) * 60) : Math.round((duree - Math.trunc(duree)) * 100);
  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
};

const getFormattedHorametre = (prestation, horametre) => {
  const hours = Math.trunc(prestation[horametre]);
  const minutes = Math.round((prestation[horametre] - Math.trunc(prestation[horametre])) * (prestation.aeronef.decimal ? 10 : 100));
  return `${hours}${prestation.aeronef.decimal ? ',' : ':'}${!prestation.aeronef.decimal && minutes < 10 ? '0' : ''}${minutes}`;
};

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
        'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
        'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
        'pilote.firstName': filterValues['pilote.firstName'] || '',
        'aeronef.immatriculation': filterValues['aeronef.immatriculation'] || '',
    });

    useEffect(() => {
        setFormValues({
            'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
            'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
            'pilote.firstName': filterValues['pilote.firstName'] || '',
            'aeronef.immatriculation': filterValues['aeronef.immatriculation'] || '',
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
                  source="pilote.firstName"
                  label="Pilote"
                  onChange={handleChange}
                  defaultValue={formValues['pilote.firstName']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
              <TextInput
                  source="aeronef.immatriculation"
                  label="Aéronef"
                  onChange={handleChange}
                  defaultValue={formValues['aeronef.immatriculation']}
                  sx={{ width: isSmall ? '100%' : 200 }}
              />
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

const VolsExpansion = ({ client }) => {

  const OptionField = () => !clientWithOptions(client) ? <></> : <TextField source="option.nom" label="Option" />

  return (
    <ArrayField source="vols">
      <Datagrid isRowSelectable={record => false} rowClick={false} bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }} className="text-xs italic">
        <NumberField source="quantite" label="Nb vol(s)" />
        <FunctionField
          source="circuit"
          render={record => isDefined(record.circuit) && <p>{record.circuit.code} - <span className="text-xs italic">{record.circuit.nom}</span></p>}
        />
        <FunctionField
          source="nature"
          render={record => isDefined(record.circuit) && isDefined(record.circuit.nature) && <p>{record.circuit.nature.code} - <span className="text-xs italic">{record.circuit.nature.label}</span></p>}
        />
        <OptionField />
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

const CustomBody = ({ isAdmin, ...props }) => {
  const { data, isLoading } = useListContext();

  if (isLoading || !data) return null;

  const totalDuration = React.useMemo(() => {
    return data.reduce((sum, record) => {
      const duree = parseFloat(record.duree) || 0;
      return sum + duree;
    }, 0);
  }, [data]);

  return (
    <Fragment>
      <DatagridBody {...props} />
      <TableFooter>
        <TableRow sx={{ backgroundColor: '#ededed', fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
          <TableCell colSpan={6} sx={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
            Total
          </TableCell>
          <TableCell sx={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>
            {formatHeure(totalDuration)}
          </TableCell>
          <TableCell />
          <TableCell />
          {isAdmin && <TableCell /> }
        </TableRow>
      </TableFooter>
    </Fragment>
  );
};

const MobileFooter = (props) => {
    const { data, isLoading } = useListContext();
  
    if (isLoading || !data) return null;
  
    const totalDuration = React.useMemo(() => {
        return data.reduce((sum, record) => {
          const duree = parseFloat(record.duree) || 0;
          return sum + duree;
        }, 0);
    }, [data]);

    return (
      <div style={{
          padding: '0.5em 1em',
          background: '#ededed',
          fontSize: '0.9em',
          fontWeight: 'bolder',
          display: 'flex',
          justifyContent: 'space-between'
      }}>
          <span>{`Total`}</span>
          <span>{`${ formatHeure(totalDuration) }`}</span>
      </div>
    );
};

const CustomDatagrid = ({isAdmin, client}) => {

  return (  
    <Datagrid body={(props) => <CustomBody {...props} isAdmin={isAdmin}/>} expand={<VolsExpansion client={client}/>} sx={{ '& .RaDatagrid-expandedPanel': { backgroundColor: '#ededed' }, '& .RaDatagrid-tbody': { backgroundColor: '#FFFFFF' }, '& .RaDatagrid-headerCell': { backgroundColor: '#ededed' } }}>
      <DateField source="date" sortable={true} />
      <TextField source="aeronef.immatriculation" label="Aéronef" sortable={true} />
      <FunctionField
        label="Pilote(s)"
        source="pilote.firstName"
        sortable={true}
        render={(record) => <span>
          {isDefined(record?.pilotName) && record?.pilotName !== '' ? record?.pilotName : ''}
          {isDefined(record?.encadrantName) && record?.encadrantName !== '' ?
            <span className="text-gray-500 italic text-xs"><br />{record?.encadrantName}</span> : ''}
        </span>}
      />
      <FunctionField
        source="horametreDepart"
        label="Horamètre au Départ"
        render={record => getFormattedHorametre(record, "horametreDepart")}
        textAlign="right"
      />
      <FunctionField
        source="duree"
        label="Durée"
        render={record => getFormattedDuration(record)}
        textAlign="right"
      />
      <FunctionField
        source="horametreFin"
        label="Horamètre à l'arrivée"
        render={record => getFormattedHorametre(record, "horametreFin")}
        textAlign="right"
      />
      <TextField source="remarques" label="Remarques" />
      {isAdmin &&
        <p className="text-right">
          <ShowButton />
          <EditButton />
        </p>
      }
    </Datagrid>
  );
};

const ListContent = ({ isSmall, isAdmin, client }) => {

  return isSmall ?
      <>
        <SimpleList
          primaryText={
            record => <>
              {record?.aeronefImmatriculation + ' | ' + (isDefined(record?.pilotName) && record?.pilotName !== '' ? record?.pilotName : '')}
              {isDefined(record?.encadrantName) && record?.encadrantName !== '' ? <span className="text-gray-500 italic text-sm"> - {record?.encadrantName}</span> : ''}
            </>
          }
          // @ts-ignore
          secondaryText={record => `${(new Date(record?.date)).toLocaleDateString("fr-FR", { year: "numeric", month: "numeric", day: "numeric" })}`}
          tertiaryText={record => getFormattedDuration(record)}
          linkType="show"
        />
        <MobileFooter/>
      </>
    :
    <CustomDatagrid isAdmin={isAdmin} client={client}/>;
};

export const PrestationsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const { client } = useClient();
  const { session } = useSessionContext();
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const user = session?.user;
  // @ts-ignore
  const isAdmin = isDefined(session) && isDefined(user) && user?.roles.includes("admin");
  const defaultFilters = {};

  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <List
      key="prestations-list"
      resource="prestations"
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
      <ListContent isSmall={isSmall} isAdmin={isAdmin} client={client}/>
    </List>
  );
};