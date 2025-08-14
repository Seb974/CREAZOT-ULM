import React, { useEffect, useMemo, useState } from 'react';
import { List, useListContext, TopToolbar, ExportButton, TextInput, DateInput, Form, SimpleList } from 'react-admin';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, IconButton, TableFooter } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import { groupLandingsByDateAirportAndAeronef } from '../../../app/lib/landing';
import { isDefinedAndNotVoid, toLocalDateString } from '../../../app/lib/utils';
import { useMediaQuery, Theme, Box } from '@mui/material';
import { ListContextProvider } from 'react-admin';

const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };

const addDays = (d, n) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  c.setHours(0, 0, 0, 0);
  return c;
};

const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
        'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
        'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
        aeronef: filterValues.aeronef || '',
        airport: filterValues.airport || '',
    });

    useEffect(() => {
        setFormValues({
            'date[after]': filterValues['date[after]'] ? toLocalDateString(new Date(filterValues['date[after]'])) : '',
            'date[before]': filterValues['date[before]'] ? toLocalDateString(new Date(filterValues['date[before]'])) : '',
            aeronef: filterValues.aeronef || '',
            airport: filterValues.airport || '',
        });
    }, [filterValues]);
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...formValues, [name]: value };
        setFormValues(newValues);
        setFilters(newValues); 
    };
  
    return (
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
                {showMore && (
                    <>
                        <TextInput
                            source="aeronef"
                            label="Aéronef"
                            onChange={handleChange}
                            defaultValue={formValues.aeronef}
                            sx={{ width: isSmall ? '100%' : 200 }}
                        />
                        <TextInput
                            source="airport"
                            label="Aéroport"
                            onChange={handleChange}
                            defaultValue={formValues.airport}
                            sx={{ width: isSmall ? '100%' : 200 }}
                        />
                    </>
                )}
            </Box>
        </Form>
    );
  };

const LandingsRowExpand = ({ record }) => {
  if (!record || !record.byAeronef) return null;

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0, backgroundColor: '#f5f5f5', fontStyle: 'italic', fontSize: 'small' }} colSpan={5}>
        <Collapse in={true} timeout="auto" unmountOnExit>
          <Table size="small" aria-label="aeronef-details">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '5%' }} />
                <TableCell style={{ width: '20%' }} />
                <TableCell style={{ width: '39%', fontWeight: 'bold' }}>Aéronef</TableCell>
                <TableCell style={{ width: '18%', textAlign: 'center', fontWeight: 'bold' }}>Touchés</TableCell>
                <TableCell style={{ width: '18%', textAlign: 'center', fontWeight: 'bold' }}>Complets</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.byAeronef.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell style={{ width: '5%' }} />
                  <TableCell style={{ width: '20%' }} />
                  <TableCell style={{ width: '39%' }}>{entry.aeronef}</TableCell>
                  <TableCell style={{ width: '18%', textAlign: 'center' }}>{entry.touches}</TableCell>
                  <TableCell style={{ width: '18%', textAlign: 'center' }}>{entry.complets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

const RowWithExpand = ({ row, isExpanded, toggleExpand }) => (
    <React.Fragment>
      <TableRow>
        <TableCell style={{ width: '5%' }}>
          <IconButton aria-label="expand row" size="small" onClick={toggleExpand}>
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell style={{ width: '20%' }}>{new Date(row.date).toLocaleDateString("fr-FR", dateOptions)}</TableCell>
        <TableCell style={{ width: '39%' }}>{row.airport}<span style={{ fontStyle: 'italic', fontSize: 'x-small', marginLeft: '1em' }}>{row.name}</span></TableCell>
        <TableCell style={{ width: '18%', textAlign: 'center' }}>{row.touches}</TableCell>
        <TableCell style={{ width: '18%', textAlign: 'center' }}>{row.complets}</TableCell>
      </TableRow>
      {isExpanded && <LandingsRowExpand record={row} />}
    </React.Fragment>
);

const CustomListActions = ({ showMore, setShowMore, isSmall }) => (
  <TopToolbar>
    <CustomFilterButton showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>
    <ExportButton />
  </TopToolbar>
);

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

const LandingsTable = ({ prestations, isSmall }) => {
    const listContext = useListContext();
    const { filterValues, ...rest } = listContext;
    
    const [data, setData] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});

    const filters = useMemo(() => ({
        startDate: filterValues?.['date[after]'],
        endDate: filterValues?.['date[before]'],
        aeronef: filterValues?.aeronef || '',
        airport: filterValues?.airport || ''
    }), [filterValues]);

  
    const handleToggleAll = () => {
        const allExpanded = Object.values(expandedRows).every(Boolean);
        setOpenStateToAll(data, !allExpanded);
    };

    const setOpenStateToAll = (data, state) => {
        const newState = {};
        data.forEach(item => newState[item.id] = state);
        setExpandedRows(newState);
    };

    useEffect(() => {
        if (!prestations) return;
        const groupedData = groupLandingsByDateAirportAndAeronef(prestations, filters);
        setData(groupedData);
        setOpenStateToAll(groupedData, false);
    }, [filters, prestations]);

    const getTotalTouches = data => isDefinedAndNotVoid(data) ? data.reduce((sum, row) => sum + row.touches, 0) : 0;
    const getTotalComplets = data => isDefinedAndNotVoid(data) ? data.reduce((sum, row) => sum + row.complets, 0) : 0;

    return isSmall ? 
        <ListContextProvider value={{ ...rest, data }}>
            <SimpleList
                primaryText={ record => <>{record.airport}<span style={{ fontStyle: 'italic', fontSize: 'x-small', marginLeft: '1em' }}>{record.name}</span></> }
                secondaryText={ record => <span style={{ fontSize: 'small' }}>{`Touchés : ${ record.touches }`}<br/>{`Complets : ${ record.complets }`}</span>}
                tertiaryText={ record => <span style={{ fontSize: 'small' }}>{`${ new Date(record.date).toLocaleDateString("fr-FR", dateOptions) }`}</span>}
                linkType={false}
            /> 
            <div style={{
                padding: '0.5em 1em',
                background: '#ededed',
                fontSize: '0.8em',
                fontWeight: 'bolder',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>{`Touchés : ${getTotalTouches(data)}`}</span>
                <span>{`Complets : ${getTotalComplets(data)}`}</span>
                {/* <span>{`Touchés : ${getTotalTouches(data)} | Complets : ${getTotalComplets(data)}`}</span> */}
            </div>
        </ListContextProvider>
        : 
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#ededed' }}>
                        <TableCell style={{ width: '5%' }}>
                            <IconButton size="small" onClick={handleToggleAll}>
                                {Object.values(expandedRows).every(Boolean) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                        </TableCell>
                        <TableCell style={{ width: '20%' }}>Date</TableCell>
                        <TableCell style={{ width: '39%' }}>Aéroport</TableCell>
                        <TableCell style={{ width: '18%', textAlign: 'center' }}>Touchés</TableCell>
                        <TableCell style={{ width: '18%', textAlign: 'center' }}>Complets</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { isDefinedAndNotVoid(data) ? data.map((item) => (
                        <RowWithExpand 
                            key={item.id} 
                            row={item} 
                            isExpanded={!!expandedRows[item.id]} 
                            toggleExpand={() => {
                                setExpandedRows(prev => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                }));
                            }}
                        />
                        )) 
                        : 
                        <TableRow>
                            <TableCell style={{ width: '5%' }} />
                            <TableCell colSpan={4} style={{ width: '95%', fontStyle: 'italic'}}>
                                Aucune donnée disponible
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
                <TableFooter>
                    <TableRow sx={{ backgroundColor: '#ededed', fontStyle: 'italic', fontWeight: 'bold', color: '#555' }}>
                        <TableCell style={{ width: '5%' }} />
                        <TableCell colSpan={2} style={{ width: '59%' }}>Totaux</TableCell>
                        <TableCell style={{ width: '18%', textAlign: 'center' }}>{getTotalTouches(data)}</TableCell>
                        <TableCell style={{ width: '18%', textAlign: 'center' }}>{getTotalComplets(data)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
};

export const LandingsList = (props) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = addDays(today, 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const isSmall = useMediaQuery('(max-width:600px)');

    const defaultFilters = {
        "date[after]": formatYMD(firstDayOfMonth),
        "date[before]": formatYMD(tomorrow),
        aeronef: '',
        airport: ''
    };

    const [showMore, setShowMore] = useState(false);
    const [filters, setFilters] = useState(defaultFilters);

    const LandingsTableWrapper = () => {
        const { data } = useListContext();
        if (!data) return null;

        return <LandingsTable prestations={data} isSmall={isSmall}/>;
    };

    return (
        <List
            {...props}
            key="landings-list"
            resource="prestations"
            perPage={1000}
            pagination={false}
            title="Attérrissages"
            actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall}/>}
            filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
            filterDefaultValues={defaultFilters}
            filterValues={filters}
            disableSyncWithLocation
        >
            <LandingsTableWrapper/>
        </List>
    );
};

