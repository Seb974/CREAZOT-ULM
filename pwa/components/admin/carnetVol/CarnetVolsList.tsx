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
  useListContext,
  Form,
  TextInput,
  DateInput,
} from "react-admin";
import FilterListIcon from '@mui/icons-material/FilterList';
import { TableRow, TableCell, TableFooter, Box, Button } from '@mui/material';
import { useMercure } from "../../../utils/mercure";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import { decimalToTimeFormatted, isDefined } from "../../../app/lib/utils";
import { Fragment, useEffect, useState } from "react";
import { useSessionContext } from "../SessionContextProvider";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export interface Props {
  data: PagedCollection<Contact> | null;
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

const ListActions = ({ showMore, setShowMore, isSmall, resource }) => {

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
      {/* @ts-ignore */}
      {!isSmall && 'FILTRER'}
    </Button>
  );
};

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

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
        'date[after]': filterValues['date[after]'] ? new Date(filterValues['date[after]']).toLocaleDateString() : '',
        'date[before]': filterValues['date[before]'] ? new Date(filterValues['date[before]']).toLocaleDateString() : ''
    });

    useEffect(() => {
        setFormValues({
            'date[after]': filterValues['date[after]'] ? new Date(filterValues['date[after]']).toLocaleDateString() : '',
            'date[before]': filterValues['date[before]'] ? new Date(filterValues['date[before]']).toLocaleDateString() : ''
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
  const defaultFilters = {};

  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <List
      key="carnet_vols-list"
      resource="carnet_vols" 
      actions={<ListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall} resource="carnet_vols"/>} 
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>} 
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
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