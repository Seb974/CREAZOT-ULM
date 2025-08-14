import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  SelectInput,
  Create,
  required,
  useDataProvider,
  ArrayInput,
  SimpleFormIterator,
  BooleanInput,
  useCreate,
  useRedirect,
  useNotify
} from "react-admin";
import { useLocation } from 'react-router-dom';
import { useWatch, useFormContext } from 'react-hook-form';
import { generateSafeCode, getRandomColor, isDefined, isDefinedAndNotVoid, isNotBlank } from "../../../app/lib/utils";
import { useEffect, useRef, useState } from "react";
import { status } from "../../../app/lib/reservation";
import { useClient } from '../../admin/ClientProvider';
import { clientWithGifts, clientWithOptions, clientWithOriginContact, clientWithPartners } from "../../../app/lib/client";
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import { Box, useMediaQuery } from "@mui/material";
import { Toolbar, SaveButton } from 'react-admin';
import { Button } from '@mui/material';
import CreditScoreIcon from '@mui/icons-material/CreditScore';

const CustomToolbar = () => {
  const redirect = useRedirect();
  const { client } = useClient();
  const isSmall = useMediaQuery('(max-width:600px)');

  return (
    <Toolbar>
      <SaveButton />
      { !clientWithGifts(client) ? null : 
        <Button onClick={() => redirect('/convert')} sx={{ ml: 'auto'}}>
          { !isSmall ? <CreditScoreIcon className="mr-2"/> : <></> } Convertir un prépaiement
        </Button>
      }
    </Toolbar>
  );
};

const QuantiteWatcher = ({ setSelectedQuantite }) => {
  const { control } = useFormContext();
  const quantite = useWatch({ control, name: 'quantite', defaultValue: 1 });

  useEffect(() => setSelectedQuantite(quantite), [quantite, setSelectedQuantite]);

  return null;
};

export const ReservationsCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const { client } = useClient();
  const location = useLocation();
  const dataProvider = useDataProvider();
  const isOperating = useRef(false);
  const [options, setOptions] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [origines, setOrigines] = useState([]);
  const [combinaisons, setCombinaisons] = useState([]);
  const [enabledCombinaisons, setEnabledCOmbinaisons] = useState([]);
  const [selectedQuantite, setSelectedQuantite] = useState(1);
  const searchParams = new URLSearchParams(location.search);
  const debut = searchParams.get('debut');

  useEffect(() => {
      getCircuits();
      getOrigines();
      getCombinaisons();
      getOptions();
  }, []);

  useEffect(() => getEnabledCombinaisons(selectedQuantite, combinaisons), [selectedQuantite, combinaisons]);

  const getCircuits = () => {
    dataProvider
        .getList("circuits", {})
        .then(({ data }) => setCircuits(data));
  };

  const getOrigines = () => {
    dataProvider
        .getList("origines", {})
        .then(({ data }) => setOrigines(data));
  };

  const getOptions = () => {
    dataProvider
        .getList("options", {})
        .then(({ data }) => setOptions(data));
  };

  const getCombinaisons = () => {
    dataProvider
        .getList("combinaisons", {})
        .then(({ data }) => setCombinaisons(data));
  };
    
  const onSubmit = async ({option, origine, contact, remarques, ...data}) => {
    if (isOperating.current) return;
    isOperating.current = true;
    try {
      const selectedCircuit = circuits.find(c => c['@id'] === data.circuit);
      const selectedOrigines = clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origines.filter(org => isDefined(origine.find(o => org['@id'] === o['@id']))) : [];
      const selectedOptions = clientWithOptions(client) ? getSelectedOptions(option, data.quantite, options) : [];
      data = {
        ...data, 
        remarques: isDefined(remarques) ? remarques : '', 
        fin: getEnd(data.debut, selectedCircuit),
        color: getRandomColor(),
        report: false,
        contact: clientWithOriginContact(client) && isDefinedAndNotVoid(contact) ? contact.map(c => c['@id']) : [],
        origine: clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
        code: generateSafeCode('RESA')
      };
      for (let i = 0; i < data.quantite; i++) {
        const option = isDefinedAndNotVoid(selectedOptions) && isDefined(selectedOptions[i]) ? selectedOptions[i]['@id'] : null;
        const bddOption = isDefined(option) ? options.find(o => o['@id'] === option) : null;
        const prix = getTotalPrice(selectedCircuit, bddOption, selectedOrigines);
        const newData = {...data, option, prix };
        if (i < data.quantite - 1)
          await create('reservations', {data: newData});
        else
          await create('reservations', {data: newData});
      }
      notify('La réservation a bien été enregistrée.', { type: 'info' });
      if (debut) {
        const dateStr = new Date(data.debut).toISOString().slice(0, 10);
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = `/admin#/?scroll=calendar&date=${dateStr}`;
      } else {
        redirect('list', 'reservations'); 
      }
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement de la réservation.`, { type: 'error' });
      console.error(error);
      if (debut)
        window.location.href = `/admin#/?scroll=calendar&date=${new Date(data.debut).toJSON().slice(0, 10) || ''}`;
      else
        redirect('list', 'reservations'); 
    } finally {
      isOperating.current = false;
    }
  };

  const getTotalPrice = (circuit, option, origines) => {
      const maxOriginDiscount = isDefinedAndNotVoid(origines) ? getMaxDiscountFromOrigin(origines) : 0;
      return (isDefined(circuit) && isDefined(circuit.prix) ? circuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(option) && isDefined(option.prix) ? option.prix : 0);
  };
        
  const getMaxDiscountFromOrigin = origines =>  origines.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

  const getEnd = (debut, circuit) => {
    const start = new Date(debut);
    const duration = new Date(circuit.duree);
    return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
  };

  const getEnabledCombinaisons = (quantite, combinaisons) => {
      const enabledCombinaisons = combinaisons.map(c => ({...c, disabled: c.minPassager > quantite}));
      setEnabledCOmbinaisons(enabledCombinaisons);
  };

  const getSelectedOptions = (selection, quantite, bddOptions) => {
    if (isNotBlank(selection)) {
      const selectedCombinaison = combinaisons.find(c => c['@id'] === (!isDefined(selection) || typeof selection === 'string' ? selection : selection['@id']));
      let options = selectedCombinaison.options.map(o => bddOptions.find(option => option['@id'] === o['@id']));
  
      const missingInputs = quantite - options.length;
      if (missingInputs > 0) {
        for (let i = 0; i < missingInputs; i++) {
          options.unshift(null);
        }
      }
      return options;
    }
    return [];
  };

  const OptionInput = () => !clientWithOptions(client) ? null : 
    <SelectInput key={ selectedQuantite }  source="option" choices={ enabledCombinaisons } label="Option" />
    
  const OriginContactInput = () => !clientWithOriginContact(client) ? null : 
    <ArrayInput source="contact" label="Contact initial">
      <SimpleFormIterator inline disableReordering>
          <ReferenceInput reference="contacts" source="@id" label="Contact initial" />
      </SimpleFormIterator>
    </ArrayInput>
    
  const PartnersInput = () => !clientWithPartners(client) ? null : 
    <ArrayInput source="origine" label="Origine de l'appel">
      <SimpleFormIterator inline disableReordering>
          <ReferenceInput reference="origines" source="@id" label="Origine de l'appel" />
      </SimpleFormIterator>
    </ArrayInput>

  const ConversionLink = () => !clientWithGifts(client) ? null : 
    <Box display="flex" gap={2} flexWrap="nowrap" width="100%" sx={{ marginBottom: '1em'}}>
        <Box flex={1} display="flex" alignItems="right" justifyContent={"end"}>
          <Link to="/convert" style={{ textDecoration: 'none', textAlign: 'right' }}>
            <Typography color="primary">Créer à partir d'un prépaiement</Typography>
          </Link>
        </Box>
    </Box>

  return (
    // @ts-ignore
    <Create redirect="list" mutationMode="pessimistic">
      <SimpleForm onSubmit={onSubmit} defaultValues={{ debut }} toolbar={<CustomToolbar />}>
        <ConversionLink />
        <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(7,0,0)) } label="Décollage" validate={required()}/>
        <TextInput source="nom" label="Nom & prénom du passager" validate={required()}/>
        <TextInput source="telephone" label="N° de téléphone" validate={required()}/>
        <TextInput source="email" label="Adresse email"/>
        <NumberInput source="quantite" label="Nombre de passager(s)" min={ 1 } defaultValue={ 1 } validate={required()}/>
        <ReferenceInput reference="circuits" source="circuit" label="Circuit"/>
        <OptionInput/>
        <SelectInput source="statut" choices={ status } defaultValue={ status[0].id } validate={required()}/>
        <OriginContactInput/>
        <PartnersInput/>
        <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <BooleanInput source="paid" label="Prépayé"/>
        <BooleanInput source="upsell" label="Upsell"/>
        <BooleanInput source="report" label="Report"/>
        <QuantiteWatcher setSelectedQuantite={setSelectedQuantite} />
      </SimpleForm>
    </Create>
  ) ;
}