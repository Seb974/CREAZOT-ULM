import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  SimpleList,
  ShowButton,
  DateField,
  FunctionField,
  DatagridBody,
  useListContext
} from "react-admin";
import { TableRow, TableCell, TableFooter } from '@mui/material';
import { useMercure } from "../../../utils/mercure";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import { decimalToTimeFormatted, isDefined } from "../../../app/lib/utils";
import { Fragment } from "react";

export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);

const DestinationsExpansion = () => (
  <FunctionField
    render={record => {
      if (!record) return null;

      const destinations = [
        { etape: 'Départ', lieu: record.lieuDepart ?? ''},
        ...(record.lieuxArrivee ?? []).map(a => ({ etape: 'Arrivée', lieu: a ?? ''}))
      ];

      return (
        <Datagrid
          data={ destinations }
          isRowSelectable={() => false}
          rowClick={false}
          bulkActionButtons={false}
          sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}
          className="text-xs italic"
        >
          <TextField source="etape" />
          <TextField source="lieu" />
        </Datagrid>
      );
    }}
  />
);

const CustomBody = (props) => {

    const { data, isLoading } = useListContext();  
    if (isLoading || !data) return null;
  
    const heuresTotales = data.reduce((sum, row) => sum + row.duree, 0);

    return (
      <Fragment>
        <DatagridBody {...props} />
        <TableFooter>
          <TableRow sx={{ backgroundColor: '#ededed', fontStyle: 'italic', fontWeight: 'bold', color: '#555'  }}>
              <TableCell colSpan={2}/>
              <TableCell colSpan={ 3 } sx={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
                Total
              </TableCell>
              <TableCell style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555', textAlign: 'center' }}>
                <strong>{ decimalToTimeFormatted(heuresTotales) }</strong>
              </TableCell>
              <TableCell colSpan={3}/>
            </TableRow>
          </TableFooter>
      </Fragment>
    );
};

const MobileFooter = (props) => {
    const { data, isLoading } = useListContext();
  
    if (isLoading || !data) return null;
  
    const heuresTotales = data.reduce((sum, row) => sum + row.duree, 0);

    return (
      <div style={{
          padding: '0.5em 1em',
          background: '#ededed',
          fontSize: '0.8em',
          fontWeight: 'bolder',
          display: 'flex',
          justifyContent: 'space-between'
      }}>
          <span>{`Total`}</span>
          <span>{ decimalToTimeFormatted(heuresTotales) }</span>
      </div>
    );
};

export const CarnetVolsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <List resource="carnet_vols" actions={<ListActions/>}>
        { isSmall ?
          <>
            <SimpleList
              primaryText={ record => `${ (new Date(record.date)).toLocaleDateString() } ~ ${ record.aeronef }` }
              secondaryText={ record => isDefined(record?.typeDeVol) ? record.typeDeVol?.label : '' }
              tertiaryText={ record => decimalToTimeFormatted(record.duree) }
              linkType="show"
            />
            <MobileFooter/>
          </>
            :
            <Datagrid body={<CustomBody/>} expand={ <DestinationsExpansion/> } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <DateField source="date" sortable={true} showTime={ false }/>
                <TextField source="aeronef" label="Aéronef" sortable={ true }/>
                <FunctionField
                  label="Type de vol"
                  render={record => isDefined(record.typeDeVol) ? record.typeDeVol?.label : ""}
                />
                <FunctionField
                  source="duree"
                  label="Durée"
                  render={record => decimalToTimeFormatted(record.duree)}
                  textAlign="center"
                />
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}