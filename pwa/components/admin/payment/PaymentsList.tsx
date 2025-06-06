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
  FunctionField,
  DateField,
  useListContext,
  DatagridBody,
  Form,
  TextInput,
  DateInput,
  Button,
  ArrayField,
  NumberField
} from "react-admin";
import Chip from '@mui/material/Chip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Fragment, useEffect, useState } from 'react';
import { TableRow, TableCell, TableFooter, Box } from '@mui/material';
import { useMercure } from "../../../utils/mercure";
import { type Contact } from "../../../types/Contact";
import { useMediaQuery, Theme } from '@mui/material';
import { type PagedCollection } from "../../../types/collection";
import { getShipStyle, isDefined, isNotBlank, matchesStartOfWord, toLocalDateString } from "../../../app/lib/utils";
import { paymentMode } from "../../../app/lib/client";


export interface Props {
  data: PagedCollection<Contact> | null;
  hubURL: string | null;
  page: number;
}

const rowSx = (record, index) => ({
  backgroundColor:'#f5f5f5',
  fontWeight: "lighter"
});

const CustomListActions = ({ showMore, setShowMore }) => (
  <TopToolbar>
    <CustomFilterButton showMore={showMore} setShowMore={setShowMore}/>
    <CreateButton/>
    <ExportButton />
  </TopToolbar>
);

const CustomFilterBar = ({ showMore, isSmall }) => {

  const { filterValues, setFilters } = useListContext();
  const [formValues, setFormValues] = useState({
      'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
      'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
      'details.mode': filterValues['details.mode'] || '',
      'intitule': filterValues['intitule'] || ''
  });

  useEffect(() => {
      setFormValues({
          'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
          'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
          'details.mode': filterValues['details.mode'] || '',
          'intitule': filterValues['intitule'] || ''
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
            <TextInput
                source="details.mode"
                label="Mode de paiement"
                onChange={handleChange}
                defaultValue={formValues['details.mode']}
                sx={{ width: isSmall ? '100%' : 200 }}
            />
            <TextInput
                source="intitule"
                label="Intitulé"
                onChange={handleChange}
                defaultValue={formValues['intitule']}
                sx={{ width: isSmall ? '100%' : 200 }}
            />
        </Box>
    </Form>
};

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

const DetailsExpansion = () => {
  return (
    <ArrayField source="details">
      <Datagrid isRowSelectable={record => false} rowClick={false} bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} rowSx={ rowSx } className="text-xs italic">
        <FunctionField
          source="mode"
          render={({mode}) => getChipMode(mode)}
        />
        <NumberField source="amount" label="Montant" options={{ style: 'currency', currency: 'EUR' }}/>
      </Datagrid>
    </ArrayField>
  );
};

const getChipMode = mode => {
  const modeWithColor = paymentMode.find(p => p.id === mode);
  // @ts-ignore
  return <Chip label={mode.toUpperCase()} size="small" sx={ getShipStyle(modeWithColor) }/>
};

const getModeList = details => {
  const uniqueModes = Array.from(new Set(details.map(({ mode }) => mode)));
  return uniqueModes.map((mode, i) => {
    const modeWithColor = paymentMode.find(p => p.id === mode)
    // @ts-ignore
    return <Chip key={i} label={mode.toUpperCase()} size="small" sx={ getShipStyle(modeWithColor) }/>
  });
};

const CustomBody = (props) => {

    const { data, isLoading, filterValues } = useListContext();
    if (isLoading || !data) return null;

    const filteredData = isLoading || !data ? [] :
      data.map(payment => {
          const modeFilter = filterValues['details.mode']?.toLowerCase();
          const newDetails = modeFilter ? payment.details.filter(detail => detail.mode ? matchesStartOfWord(detail.mode, modeFilter) : false): payment.details;
          return { ...payment, details: newDetails };
      }).filter(payment => payment.details.length > 0);

    const total = filteredData.reduce((sum, row) => sum + row.details.reduce((s, c) => s+= c.amount, 0), 0);

    return (
      <Fragment>
        <DatagridBody {...props} data={filteredData}/>
        <TableFooter>
          <TableRow sx={{ backgroundColor: '#ededed', fontStyle: 'italic', fontWeight: 'bold', color: '#555'  }}>
              <TableCell colSpan={2}/>
              <TableCell colSpan={2} sx={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
                Total
              </TableCell>
              <TableCell style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#555', textAlign: 'center' }}>
                <strong>{total.toFixed(2)} €</strong>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
      </Fragment>
    );
};

const CustomDatagrid = () => {

  return (
    <Datagrid body={<CustomBody />} expand={<DetailsExpansion/>}  sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
        <DateField source="date" label="Date" sortable={ true } />
        <FunctionField
          source="name"
          label="Intitulé"
          render={ ({ name, label, details }) =>  <p>{ isNotBlank(name) ? name : (isNotBlank(label) ? label : '') }<br/>
            { getModeList(details) }</p>
          }
        />
        <FunctionField
          source="name"
          label="Total"
          render={({ details }) => (details.reduce((sum, current) => sum += current.amount, 0)).toFixed(2) + "€" }
          sx={{textAlign: 'center'}}
        />
        <p className="text-right">
            <ShowButton />
            <EditButton />
        </p>
    </Datagrid>
  );
}


export const PaymentsList: NextPage<Props> = ({ data, hubURL, page }) => {
  const collection = useMercure(data, hubURL);
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const defaultFilters = {}; 
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <List 
      title="Paiements"
      resource="payments" 
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore}/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={({ name, label }) =>  isNotBlank(name) ? name : (isNotBlank(label) ? label : '')}
              // @ts-ignore
              secondaryText={({ details, date }) => <p>{ getModeList(details) }<br/>{ `${ (new Date(date)).toLocaleDateString("fr-FR", options) } ` }</p>}
              tertiaryText={({ details }) => (details.reduce((sum, current) => sum += current.amount, 0)).toFixed(2) + "€" }
              linkType="show"
            /> 
            : <CustomDatagrid />
        }
    </List>
  );
}