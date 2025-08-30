import { type NextPage } from "next";
import React, { useEffect, useState } from 'react';
import { Datagrid,
  List,
  TextInput,
  BooleanInput,
  CreateButton,
  ExportButton,
  TopToolbar,
  DateField,
  DateInput,
  EditButton,
  ShowButton,
  BooleanField,
  SimpleList,
  Form, 
  useListContext,
  FunctionField
} from "react-admin";
import Button from '@mui/material/Button';
import DownloadGiftButton from "./DownloadGiftButton";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import FilterListIcon from '@mui/icons-material/FilterList';
import { useMediaQuery, Theme, Box } from '@mui/material';
import { ConversionLink } from './ConversionLink';
import { isDefined, isDefinedAndNotVoid, toLocalDateString } from "../../../app/lib/utils";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSessionContext } from "../SessionContextProvider";

export interface Props {
  data: PagedCollection<Circuit> | null;
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
      <CreateButton className={`${!isSmall && 'mb-[2px]'}`}/>
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
      {!isSmall && 'FILTRER'}
    </Button>
  );
};

const CustomFilterBar = ({ showMore, isSmall }) => {

    const { filterValues, setFilters } = useListContext();
    const [formValues, setFormValues] = useState({
      beneficiaire: filterValues.beneficiaire || '',
      offreur: filterValues.offreur || '',
      used: filterValues.used || '',
      'fin[before]': filterValues['fin[before]'] ? toLocalDateString(new Date(filterValues['fin[before]'])) : '',
    });

    useEffect(() => {
      showMore ? handleBooleanChange({target: {name: 'used', checked: false}}) : handleBooleanChange({target: {name: 'used', checked: ''}}); 
    }, [showMore]);
  
    useEffect(() => {
        setFormValues({
          beneficiaire: filterValues.beneficiaire || '',
          offreur: filterValues.offreur || '',
          used: isDefined(filterValues.used) ? filterValues.used : '',
          'fin[before]': filterValues['fin[before]'] ? toLocalDateString(new Date(filterValues['fin[before]'])) : '',
        });
    }, [filterValues]);
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...formValues, [name]: value };
        setFormValues(newValues);
        setFilters(newValues); 
    };

    const handleBooleanChange = (e) => {
      const { name, checked } = e.target;
      const newValues = { ...formValues, [name]: checked };
      setFormValues(newValues);
      setFilters(newValues); 
  };
  
    return !showMore ? <></> :
        <Form>
            <Box display="flex" flexWrap="wrap" columnGap={isSmall ? 6 : 2} rowGap={0.5} mt={1} alignItems="flex-end">
                <TextInput
                    source="beneficiaire"
                    label="Bénéficiaire"
                    onChange={handleChange}
                    defaultValue={formValues['beneficiaire']}
                    sx={{ width: isSmall ? '100%' : 200 }}
                />
                <TextInput
                    source="offreur"
                    label="Personne offrante"
                    onChange={handleChange}
                    defaultValue={formValues['offreur']}
                    sx={{ width: isSmall ? '100%' : 200 }}
                />
                <DateInput
                    source="fin[after]"
                    label="Date Max de validité"
                    onChange={handleChange}
                    defaultValue={formValues['fin[after]']}
                    sx={{ width: isSmall ? '100%' : 200 }}
                />
                <BooleanInput
                    source="used"
                    label="Bons utilisés"
                    onChange={handleBooleanChange}
                    defaultChecked={formValues['used']}
                    sx={{ width: isSmall ? '100%' : 200, marginBottom: '0.5em' }}
                />
            </Box>
        </Form>
  };

export const CadeauxList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const defaultFilters = {}; 
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const getDiscountSource = origine => {
    if (isDefinedAndNotVoid(origine)) {
      const maxDiscount = origine.reduce((max, current) => max = current.discount > max.discount ? current : max, origine[0]);
      return maxDiscount.discount > 0 ? `${maxDiscount.discount}% ${maxDiscount.value}` : '';
    }
    return '';
  };

  return (
    <List 
      resource="cadeaux" 
      title="Prépaiements"
      actions={<CustomListActions showMore={showMore} setShowMore={setShowMore} isSmall={isSmall} resource="cadeaux"/>}
      filters={<CustomFilterBar showMore={showMore} isSmall={isSmall}/>}
      // @ts-ignore
      filterValues={filters}
      filterDefaultValues={defaultFilters}
      disableSyncWithLocation
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => (record?.beneficiaire ?? '') }
              secondaryText={ record => <><div>{(record?.code ?? '') + ' - ' + (record?.offreur ?? '')}</div><div className="flex mt-1"><div className="mr-2"><DownloadGiftButton/></div><div className="ml-2"><ConversionLink/></div></div></> }
              tertiaryText={ record => (isDefined(record.quantite) ? record.quantite : 1) + " x " + (record?.circuit?.code ?? '') + (isDefined(record.option) ? (' + option') : '') }
              linkType="show"
            /> 
            : 
            <Datagrid rowClick={ false } sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <FunctionField
                  label="Code"
                  render={({code, fin}) => <><span>{code ?? ''}</span><br/></> }
                />
                <FunctionField
                  label="Personne(s)"
                  render={({beneficiaire, offreur}) => <><span>{beneficiaire}</span><br/>{offreur !== beneficiaire ? <span className="text-gray-500 text-xs italic">{ offreur }</span> : <></> }</> }
                />
                <FunctionField
                  label="Circuit"
                  render={({quantite, circuit, origine}) => <><span>{isDefined(quantite) ? quantite : 1 } x { circuit?.code ?? '' }</span><br/><span className="text-gray-500 text-xs italic">{ getDiscountSource(origine) }</span></> }
                />
                 <FunctionField
                  label="Prix"
                  render={({prix, cout}) => <><span>{`${(isDefined(prix) ? prix : isDefined(cout) ? cout : 0).toFixed(2)} €`}</span></> }
                />
                <DateField source="fin" label="Expiration" sortable={ true } />
                <BooleanField source="used" label="utilisé" textAlign="center"/>
                <DownloadGiftButton/>
                <ConversionLink/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}