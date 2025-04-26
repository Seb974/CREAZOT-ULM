import { TableRow, TableCell } from '@mui/material';
import * as React from 'react';
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
  FilterButton,
  TopToolbar,
  DateField,
  NumberField,
  DateInput,
  ShowButton,
  ArrayField,
  SimpleList,
  FunctionField,
  useListContext
} from "react-admin";
import { Fragment } from 'react';
import { type Prestation } from "../../../types/Prestation";
import { type PagedCollection } from "../../../types/collection";
import { useSession } from "next-auth/react";
import { isDefined } from "../../../app/lib/utils";
import { useMediaQuery, Theme } from '@mui/material';

export interface Props {
    data: PagedCollection<Prestation> | null;
    hubURL: string | null;
    page: number;
  }
  
  const ListActions = () => (
    <TopToolbar>
        <FilterButton/> 
        <CreateButton/>
        <ExportButton/>
    </TopToolbar>
  );
  
  const filters = [
    <TextInput source="aeronef.immatriculation" key="Aeronef" label="Aéronef"/>,
    <TextInput source="pilote.firstName" key="Pilote" label="Pilote" />,
    <DateInput source="date[after]"  key="DateMin" label="Date Min"/>,
    <DateInput source="date[before]"  key="DateMax" label="Date Max"/>,
  ];

  const formatHeure = (duree) => {
    const heures = Math.floor(duree);
    const minutes = Math.round((duree - heures) * 60);
    return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const getFormattedDuration = ({ aeronef, duree }) => {
    const hours = Math.trunc(duree);
    const minutes = aeronef.decimal ? Math.round((duree - Math.trunc(duree)) * 60) : Math.round((duree - Math.trunc(duree)) * 100);
    return `${ hours }:${ minutes < 10 ? '0' : '' }${ minutes }`;
  }

  const getFormattedHorametre = (prestation, horametre) => {
    const hours = Math.trunc(prestation[horametre]);
    const minutes = Math.round((prestation[horametre] - Math.trunc(prestation[horametre])) * (prestation.aeronef.decimal ? 10 : 100));
    return `${ hours }${prestation.aeronef.decimal ? ',' : ':'}${ !prestation.aeronef.decimal && minutes < 10 ? '0' : '' }${ minutes }`;
  }

  const VolsExpansion = () => (
    <>
      <ArrayField source="vols">
          <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}} className="text-xs italic">
              <NumberField source="quantite" label="Nb vol(s)"/>
              <FunctionField
                source="circuit"
                render={record => isDefined(record.circuit) && <p>{record.circuit.code} - <span className="text-xs italic">{record.circuit.nom}</span></p>}
              />
              <FunctionField
                source="nature"
                render={record => isDefined(record.circuit) && isDefined(record.circuit.nature) && <p>{record.circuit.nature.code} - <span className="text-xs italic">{record.circuit.nature.label}</span></p>}
              />
              <TextField source="option.nom" label="Option"/>
          </Datagrid>
      </ArrayField>
      
    </>
  );

const CustomBody = (props) => {

    const { data, isLoading } = useListContext();
    const session = useSession();
    const user = session.data.user;
  
    if (isLoading || !data) return null;
  
    const totalDuration = data.reduce((sum, record) => {
      const duree = parseFloat(record.duree) || 0;
      return sum + duree;
    }, 0);
  
    return (
      <Fragment>
        <DatagridBody {...props} />
        <TableRow sx={{ backgroundColor: '#ededed' }}>
          <TableCell colSpan={ 6 } sx={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
            Total
          </TableCell>

          <TableCell sx={{fontStyle: 'italic', fontWeight: 'bold', color: '#555', textAlign: 'right' }}>
            {formatHeure(totalDuration)}
          </TableCell>
          <TableCell />
          <TableCell />
          {/* @ts-ignore */}
          {isDefined(session) && isDefined(user) && user.roles.includes("admin") && (
            <TableCell />
          )}
        </TableRow>
      </Fragment>
    );
};

const CustomDatagrid = () => {

    const session = useSession();
    const user = session.data.user;

    return (
      <Datagrid body={<CustomBody />} expand={ <VolsExpansion/> } sx={{ '& .RaDatagrid-expandedPanel': {backgroundColor: '#ededed'}, '& .RaDatagrid-tbody': {backgroundColor: '#FFFFFF'}, '& .RaDatagrid-headerCell': {backgroundColor: '#ededed'}}}>
          <DateField source="date" sortable={ true }/>
          <TextField source="aeronef.immatriculation" label="Aéronef" sortable={ true }/>
          <TextField source="pilote.firstName" label="Pilote" sortable={ true }/>
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
          <TextField source="remarques" label="Remarques"/>
          {/* @ts-ignore */}
          { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
              <p className="text-right">
                  <ShowButton />
                  <EditButton />
              </p>
          }
      </Datagrid>
    )
};
  
export const PrestationsList: NextPage<Props> = ({ data, hubURL, page }) => {

    const session = useSession();
    const user = session.data.user;
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

    return (
        <List
            resource="prestations"
            // @ts-ignore
            actions={isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") ? <ListActions/> : null} 
            filters={ filters }
        >
            { isSmall ? 
                <SimpleList
                  primaryText={ record => record.aeronef.immatriculation + ' | ' +  record.pilote.firstName }
                  // @ts-ignore
                  secondaryText={ record => `${ (new Date(record.date)).toLocaleDateString("fr-FR", options) } `}
                  tertiaryText={ record => getFormattedDuration(record) }
                  linkType="show"
                /> 
                : 
                <CustomDatagrid />
            }
        </List>

    );
};
  