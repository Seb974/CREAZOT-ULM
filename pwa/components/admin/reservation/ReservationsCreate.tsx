import { DateTimeInput, ReferenceInput, SimpleForm, TextInput, NumberInput, SelectInput, Create, required, 
useDataProvider, BooleanInput, useCreate, useRedirect, useNotify, ReferenceArrayInput} from "react-admin";
import { useLocation } from 'react-router-dom';
import { useWatch, useFormContext } from 'react-hook-form';
import { generateSafeCode, getFormattedValueForBackEnd, getRandomColor, isDefined, isDefinedAndNotVoid, isNotBlank, isValid } from "../../../app/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { positions, status } from "../../../app/lib/reservation";
import { useClient } from '../../admin/ClientProvider';
import { clientUsingAvailabilityFilter, clientWithGifts, clientWithOptions, clientWithOriginContact, clientWithPartners } from "../../../app/lib/client";
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import { Box, useMediaQuery } from "@mui/material";
import { Toolbar, SaveButton } from 'react-admin';
import { Button } from '@mui/material';
import CreditScoreIcon from '@mui/icons-material/CreditScore';

const getEnd = (debut, circuit) => {
  const start = new Date(debut);
  const duration = new Date(circuit?.duree) ?? new Date((new Date()).setHours(0,0,0));
  return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
};

const CustomToolbar = ({ debut }) => {
  const redirect = useRedirect();
  const { client } = useClient();
  const isSmall = useMediaQuery('(max-width:600px)');
  const root = isDefined(debut) ? `/convert?debut=${encodeURIComponent(debut)}` : "/convert";

  return (
    <Toolbar>
      <SaveButton />
      { !clientWithGifts(client) ? null : 
        <Button onClick={() => redirect(root)} sx={{ ml: 'auto'}}>
          { !isSmall ? <CreditScoreIcon className="mr-2"/> : <></> } Convertir un prépaiement
        </Button>
      }
    </Toolbar>
  );
};

const QuantiteWatcher = ({ setSelectedQuantite }) => {
  const { control, setValue } = useFormContext();
  const quantite = useWatch({control, name: 'quantite' });

  useEffect(() => setSelectedQuantite(quantite), [quantite, setSelectedQuantite]);

  useEffect(() => {
    if (!isNotBlank(quantite) || quantite > 1 || quantite === 0) {
      setValue("pilote", null);
      setValue("avion", null);
      setValue("position", "-");
    }
  }, [quantite]);

  return null;
};

const CircuitWatcher = ({ circuits }) => {
  const { control, setValue } = useFormContext();
  const selectedCircuit = useWatch({ control, name: 'circuit' });
  const debut = useWatch({ control, name: 'debut', defaultValue: new Date((new Date()).setHours(7,0,0)) });

  useEffect(() => {
    let newFin = debut;
    if (isDefined(selectedCircuit)) {
      const selection = circuits.find(c => c['@id'] === selectedCircuit);
      newFin = getEnd(debut, selection)
    } 
    setValue("fin", newFin);
  }, [selectedCircuit, debut, circuits]);

  return null;
};

const FilteredPiloteInput = ({ circuits, client, selectedQuantite, defaultStart = new Date((new Date()).setHours(7,0,0)) }) => {
  const { control, setValue, getValues } = useFormContext();
  const debut = useWatch({ control, name: "debut", defaultValue: defaultStart }) ?? getValues("debut");
  const fin = useWatch({ control, name: "fin", defaultValue: defaultStart }) ?? getValues("fin");
  const circuitId = useWatch({ control, name: "circuit" }) ?? getValues("circuit");
  
  const dataProvider = useDataProvider();

  const [pilotes, setPilotes] = useState([]);

  const getProfilPilotes = useCallback(() => {
    if (!debut || !fin) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const endpoint = clientUsingAvailabilityFilter(client) ? "profil_pilotes/disponibles" : "profil_pilotes";
    const filters = clientUsingAvailabilityFilter(client) ? 
        { debut: new Date(debut).toISOString(), fin: new Date(fin).toISOString(), timezone, "exists[certificatMedical]": true }  : 
        { "exists[certificatMedical]": true };
    dataProvider
        .getList(endpoint, { filter: filters })
        .then(({ data }) => {
          const piloteProfils = data
            .filter(p => isDefined(p.pilote))
            .map(({pilote, ...profil}) => ({
              ...pilote, 
              profil: {...profil, pilotQualifications: isDefinedAndNotVoid(profil.pilotQualifications) ? profil.pilotQualifications : []},
            }))
          setPilotes(piloteProfils)
        });
  }, [debut, fin, circuitId, circuits, dataProvider, setPilotes]);

  const selectedCircuit = useMemo(() => circuits.find(c => c["@id"] === circuitId), [circuits, circuitId]);

  const enabledPilots = useMemo(() => {
    return pilotes.filter(({profil, ...p}) => isValid(profil?.certificatMedical?.validUntil, profil?.certificatMedical?.dateObtention, debut)) ?? [];
  }, [pilotes, debut]);

  const pilotesEligibles = useMemo(() => {
    if (!selectedCircuit) return enabledPilots;
    const qualificationsRequises = selectedCircuit?.qualifications?.map(q => q['@id']) || [];
    const needsEncadrant = selectedCircuit?.needsEncadrant;
    return qualificationsRequises.length === 0
      ? (needsEncadrant ? enabledPilots.filter(({profil, ...p}) => isDefined(profil.pilotQualifications.find(q => isDefined(q.qualification.encadrant) && q.qualification.encadrant && isValid(q.validUntil, q.dateObtention, debut)))) : enabledPilots)
      : enabledPilots.filter(({profil, ...p}) =>
          Array.isArray(profil.pilotQualifications) &&
          profil.pilotQualifications
                .filter(q => isValid(q.validUntil, q.dateObtention, debut))
                .map(q => q.qualification['@id'])
                .some(q => qualificationsRequises.includes(q))
    );
  }, [enabledPilots, selectedCircuit, debut]);

  const filterParams = useMemo(() => ({
    debut: new Date(debut).toISOString(),
    fin: new Date(fin).toISOString()
  }), [debut, fin]);

  useEffect(() => getProfilPilotes(), [getProfilPilotes, filterParams]);

  useEffect(() => {
    const selectedPiloteId = getValues("pilote");
    const stillEligible = pilotesEligibles.some(p => p["@id"] === selectedPiloteId);
    if (!stillEligible) setValue("pilote", null);
  }, [pilotesEligibles, getValues, setValue]);

  return (
    <SelectInput
      source="pilote"
      label="Pilote"
      choices={pilotesEligibles}
      optionText={r => isDefined(r) && isDefined(r.firstName) ? r.firstName.charAt(0).toUpperCase() + r.firstName.slice(1) : " "}
      optionValue="@id"
      readOnly={ !isNotBlank(selectedQuantite) || selectedQuantite > 1 || selectedQuantite === 0 }
    />
  );
};

const FilteredAeronefInput = ({ client, selectedQuantite, defaultStart = new Date((new Date()).setHours(7,0,0)) }) => {
  const debut = useWatch({ name: "debut", defaultValue: defaultStart });
  const fin = useWatch({ name: "fin", defaultValue: defaultStart });
  const dataProvider = useDataProvider();

  const [aeronefs, setAeronefs] = useState([]);

  const getAeronefs = useCallback(() => {
    if (!debut || !fin) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const endpoint = clientUsingAvailabilityFilter(client) ? "aeronefs/disponibles" : "aeronefs";
    const filters = clientUsingAvailabilityFilter(client) ? { debut: new Date(debut).toISOString(), fin: new Date(fin).toISOString(), timezone } : {};
    dataProvider
        .getList(endpoint, { filter: filters })
        .then(({ data }) => setAeronefs(data));
  }, [debut, fin, dataProvider, setAeronefs]);

  const filterParams = useMemo(() => ({
    debut: new Date(debut).toISOString(),
    fin: new Date(fin).toISOString(),
  }), [debut, fin]);

  useEffect(() => getAeronefs(), [getAeronefs, filterParams]);

  return (
    <SelectInput
      source="avion"
      label="Aéronef"
      choices={ aeronefs }
      optionText={r => isDefined(r?.immatriculation) ? r?.immatriculation : " "}
      optionValue="@id"
      readOnly={ !isNotBlank(selectedQuantite) || selectedQuantite > 1 || selectedQuantite === 0 }
    />
  );
};

const PositionInput = ({ selectedQuantite }) => {
    return (
        <SelectInput 
            source="position"
            choices={ positions } 
            defaultValue="-"
            readOnly={ !isNotBlank(selectedQuantite) || selectedQuantite > 1 || selectedQuantite === 0 }
        />
    )
};

const OptionInput = ({ client, enabledCombinaisons }) => !clientWithOptions(client) ? null : 
    <SelectInput key={ +new Date() }  source="option" choices={ enabledCombinaisons } label="Option" />
    
const OriginContactInput = ({ client }) => !clientWithOriginContact(client) ? null : 
  <ReferenceArrayInput source="contact" reference="contacts" label="Contact initial"/>
  
const PartnersInput = ({ client }) => !clientWithPartners(client) ? null : 
  <ReferenceArrayInput source="origine" reference="origines" label="Contact initial"/>

const ConversionLink = ({ client, debut }) => {
  
  if (!clientWithGifts(client)) return null;
  
  const root = isDefined(debut) ? `/convert?debut=${encodeURIComponent(debut)}` : "/convert";

  return (
    <Box display="flex" gap={2} flexWrap="nowrap" width="100%" sx={{ marginBottom: '1em'}}>
        <Box flex={1} display="flex" alignItems="right" justifyContent={"end"}>
          <Link to={ root } style={{ textDecoration: 'none', textAlign: 'right' }}>
            <Typography color="primary">Créer à partir d'un prépaiement</Typography>
          </Link>
        </Box>
    </Box>
  )
}

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
    
  const onSubmit = async ({option, origine, contact, remarques, quantite, pilote, avion, position, ...data}) => {
    if (isOperating.current) return;
    isOperating.current = true;
    try {
      const selectedCircuit = circuits.find(c => c['@id'] === getFormattedValueForBackEnd(data.circuit));
      const selectedOrigines = clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origines.filter(org => isDefined(origine.find(o => org['@id'] === getFormattedValueForBackEnd(o)))) : [];
      const selectedOptions = clientWithOptions(client) ? getSelectedOptions(option, quantite, options) : [];
      data = {
        ...data,
        quantite,
        remarques: isDefined(remarques) ? remarques : '', 
        fin: getEnd(data.debut, selectedCircuit),
        color: getRandomColor(),
        report: false,
        contact: clientWithOriginContact(client) && isDefinedAndNotVoid(contact) ? contact.map(c => getFormattedValueForBackEnd(c)) : [],
        origine: clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origine.map(o => getFormattedValueForBackEnd(o)) : [],
        code: generateSafeCode('RESA'),
        pilote : quantite <= 1 ? getFormattedValueForBackEnd(pilote) : null,
        avion: quantite <= 1 ? getFormattedValueForBackEnd(avion) : null,
        position: quantite <= 1 ? position : null
      };
      for (let i = 0; i < quantite; i++) {
        const option = isDefinedAndNotVoid(selectedOptions) && isDefined(selectedOptions[i]) ? selectedOptions[i]['@id'] : null;
        const bddOption = isDefined(option) ? options.find(o => o['@id'] === option) : null;
        const prix = getTotalPrice(selectedCircuit, bddOption, selectedOrigines);
        const newData = {...data, option, prix };
        if (i < quantite - 1)
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

  return (
    // @ts-ignore
    <Create redirect="list" mutationMode="pessimistic">
      <SimpleForm onSubmit={onSubmit} toolbar={<CustomToolbar debut={ debut }/>}
      >
        <ConversionLink client={ client } debut={ debut }/>
        <DateTimeInput source="debut" label="Décollage" validate={required()} defaultValue={ isNotBlank(debut) ? new Date(debut) : new Date((new Date()).setHours(7,0,0)) }/>
        <DateTimeInput source="fin" label="Fin" sx={{ display: 'none' }} defaultValue={ new Date(debut) }/>
        <TextInput source="nom" label="Nom & prénom du passager" validate={required()}/>
        <TextInput source="telephone" label="N° de téléphone" validate={required()}/>
        <TextInput source="email" label="Adresse email"/>
        <NumberInput source="quantite" label="Nombre de passager(s)" min={ 1 } defaultValue={ 1 } validate={required()}/>
        <ReferenceInput reference="circuits" source="circuit" label="Circuit"/>
        <OptionInput client={ client } enabledCombinaisons={ enabledCombinaisons }/>
        <FilteredPiloteInput circuits={ circuits } client={ client } selectedQuantite={ selectedQuantite }  defaultStart={ isNotBlank(debut) ? new Date(debut) : new Date((new Date()).setHours(7,0,0)) }/>
        <FilteredAeronefInput client={ client } selectedQuantite={ selectedQuantite } defaultStart={ isNotBlank(debut) ? new Date(debut) : new Date((new Date()).setHours(7,0,0)) }/>
        <PositionInput selectedQuantite={ selectedQuantite }/>
        <SelectInput source="statut" choices={ status } defaultValue={ status[0].id } validate={required()}/>
        <OriginContactInput client={ client }/>
        <PartnersInput client={ client }/>
        <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <BooleanInput source="paid" label="Prépayé"/>
        <BooleanInput source="upsell" label="Upsell"/>
        <BooleanInput source="report" label="Report"/>
        <CircuitWatcher circuits={ circuits }/>
        <QuantiteWatcher setSelectedQuantite={ setSelectedQuantite } />
      </SimpleForm>
    </Create>
  ) ;
}