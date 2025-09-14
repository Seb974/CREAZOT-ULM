import { DateTimeInput, ReferenceInput, SimpleForm, Create, required, useDataProvider, useCreate, useUpdate, useRedirect, useNotify, SelectInput, Toolbar, SaveButton } from "react-admin";
import { generateSafeCode, getFormattedValueForBackEnd, getRandomColor, isDefined, isDefinedAndNotVoid, isNotBlank, isValid } from "../../../app/lib/utils";
import { Link, useLocation, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClient } from '../../admin/ClientProvider';
import { positions, status } from "../../../app/lib/reservation";
import { useFormContext, useWatch } from 'react-hook-form';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { clientUsingAvailabilityFilter, clientWithGifts, clientWithOptions, clientWithPartners } from "../../../app/lib/client";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";

const getEnd = (debut, circuit) => {
  const start = new Date(debut);
  const duration = new Date(circuit?.duree) ?? new Date((new Date()).setHours(0,0,0));
  return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
};

const QuantiteWatcher = ({ prepayments }) => {
  const { setValue } = useFormContext();
  const selection = useWatch({ name: "prepayment"});

  const prepayment = useMemo(() => {
    return isNotBlank(selection) ? prepayments.find(p => p['@id'] === selection) : null;
  }, [selection, prepayments]);

  useEffect(() => {
    if (!isNotBlank(prepayment) || prepayment?.quantite > 1 || prepayment?.quantite === 0) {
      setValue("pilote", null);
      setValue("avion", null);
      setValue("position", "-");
    }
  }, [prepayment]);

  return null;
};

const FilteredPiloteInput = ({ client, prepayments, circuits, defaultStart = new Date((new Date()).setHours(7,0,0)) }) => {
  const { setValue, getValues } = useFormContext();
  const debut = useWatch({ name: "debut", defaultValue: defaultStart });
  const selection = useWatch({ name: "prepayment"});
  
  const dataProvider = useDataProvider();

  const [pilotes, setPilotes] = useState([]);

  const prepayment = useMemo(() => {
    return isNotBlank(selection) ? prepayments.find(p => p['@id'] === selection) : null;
  }, [selection, prepayments]);

  const getProfilPilotes = useCallback(() => {
    if (!debut) return;
    const fin = isDefined(prepayment) ? getEnd(debut, prepayment.circuit) : defaultStart;

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
  }, [debut, prepayment, dataProvider, setPilotes]);

  const selectedCircuit = useMemo(() => circuits.find(c => c["@id"] === prepayment?.circuit?.['@id']), [circuits, prepayment]);

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
    debut: new Date(debut).toISOString()
  }), [debut]);

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
      readOnly={ !isNotBlank(prepayment?.quantite) || prepayment?.quantite > 1 || prepayment?.quantite === 0 }
    />
  );
};

const FilteredAeronefInput = ({ client, prepayments, defaultStart = new Date((new Date()).setHours(7,0,0)) }) => {
  const debut = useWatch({ name: "debut", defaultValue: defaultStart });
  const selection = useWatch({ name: "prepayment"});
  const dataProvider = useDataProvider();

  const prepayment = useMemo(() => {
    return isNotBlank(selection) ? prepayments.find(p => p['@id'] === selection) : null;
  }, [selection, prepayments]);

  const [aeronefs, setAeronefs] = useState([]);

  const getAeronefs = useCallback(() => {
    if (!debut) return;
    const fin = isDefined(prepayment) ? getEnd(debut, prepayment.circuit) : defaultStart;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const endpoint = clientUsingAvailabilityFilter(client) ? "aeronefs/disponibles" : "aeronefs";
    const filters = clientUsingAvailabilityFilter(client) ? { debut: new Date(debut).toISOString(), fin: new Date(fin).toISOString(), timezone } : {};
    dataProvider
        .getList(endpoint, { filter: filters })
        .then(({ data }) => setAeronefs(data));
  }, [debut, prepayment, dataProvider, setAeronefs]);

  const filterParams = useMemo(() => ({
    debut: new Date(debut).toISOString()
  }), [debut]);

  useEffect(() => getAeronefs(), [getAeronefs, filterParams]);

  return (
    <SelectInput
      source="avion"
      label="Aéronef"
      choices={ aeronefs }
      optionText={r => isDefined(r?.immatriculation) ? r?.immatriculation : " "}
      optionValue="@id"
      readOnly={ !isNotBlank(prepayment?.quantite) || prepayment?.quantite > 1 || prepayment?.quantite === 0 }
    />
  );
};

const PositionInput = ({ prepayments }) => {
    const selection = useWatch({ name: "prepayment"});

    const prepayment = useMemo(() => {
      return isNotBlank(selection) ? prepayments.find(p => p['@id'] === selection) : null;
    }, [selection, prepayments]);

    return (
        <SelectInput 
            source="position"
            choices={ positions } 
            defaultValue="-"
            readOnly={ !isNotBlank(prepayment?.quantite) || prepayment?.quantite > 1 || prepayment?.quantite === 0 }
        />
    )
};

const PrepaymentHelperText = ({ prepayments }) => {
    const selectedId = useWatch({ name: 'prepayment' });
    const  data = prepayments.find(p => p.id === selectedId);
    
    if (!data) return null;
    const {quantite, circuit, options } = data;

    return `${quantite ?? 1} ${ circuit?.nom } ${ isDefined(options) ? ` avec ${ options.nom }` : ''}`;
};

const CustomToolbar = ({ debut }) => {
  const redirect = useRedirect();
  const { client } = useClient();
  const isSmall = useMediaQuery('(max-width:600px)');

  const root = isDefined(debut) ? `/reservations/create?debut=${encodeURIComponent(debut)}` : "/reservations/create";

  return (
    <Toolbar>
      <SaveButton />
      { !clientWithGifts(client) ? null : 
        <Button onClick={() => redirect(root)} sx={{ ml: 'auto'}}>
          { !isSmall ? <NoteAltIcon className="mr-2"/> : <></> } Saisir manuellement
        </Button>
      }
    </Toolbar>
  );
};

const ConversionLink = ({ client, debut }) => {
  
  if (!clientWithGifts(client)) return null;
  
  const root = isDefined(debut) ? `/reservations/create?debut=${encodeURIComponent(debut)}` : "/reservations/create";

  return (
    <Box display="flex" gap={2} flexWrap="nowrap" width="100%" sx={{ marginBottom: '1em'}}>
        <Box flex={1} display="flex" alignItems="right" justifyContent={"end"}>
          <Link to={ root } style={{ textDecoration: 'none', textAlign: 'right' }}>
            <Typography color="primary">Créer manuellement</Typography>
          </Link>
        </Box>
    </Box>
  )
}

export const ReservationCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const [update] = useUpdate();
  const { client } = useClient();
  const location = useLocation();
  const dataProvider = useDataProvider();
  const isOperating = useRef(false);
  const [options, setOptions] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [prepayments, setPrepayments] = useState([]);
  const searchParams = new URLSearchParams(location.search);
  const debut = searchParams.get('debut');
  const { id: prepaymentIdFromUrl } = useParams();
  const [defaultValues, setDefaultValues] = useState({ debut: debut || new Date((new Date()).setHours(7,0,0)), prepayment: '' });

  useEffect(() => {
    getOptions();
    getCircuits();
  }, []);

  useEffect(() => {
  const fetchPrepayment = async () => {
    const { data } = await dataProvider.getList('cadeaux', { pagination: { page: 1, perPage: 100 }, sort: { field: 'id', order: 'ASC' } });
    setPrepayments(data.map(d => ({...d, quantite: d.quantite ?? 1})));
    if (prepaymentIdFromUrl) {
      const selected = data.find(p => String(p.originId) === String(prepaymentIdFromUrl));
      if (selected) {
        setDefaultValues({
          debut: debut || new Date(),
          prepayment: selected['@id'],
        });
      }
    }
  };
  fetchPrepayment();
}, [prepaymentIdFromUrl])

  const getOptions = () => {
    dataProvider
        .getList("options", {})
        .then(({ data }) => setOptions(data));
  };

  const getCircuits = () => {
    dataProvider
        .getList("circuits", {})
        .then(({ data }) => setCircuits(data));
  };
    
  const onSubmit = async ({debut, statut, prepayment, pilote, avion, position}) => {
    if (isOperating.current) return;

    isOperating.current = true;

    try {  
      const selection = prepayments.find(p => p['@id'] === prepayment);
      const { telephone, email, quantite, beneficiaire, circuit, origine } = selection;
      const selectedOptions = clientWithOptions(client) ? getOptionsArray(selection.options, quantite ?? 1, options) : [];
      const data = {
        telephone: telephone ?? '',
        email: email ?? '',
        quantite: quantite ?? 1, 
        debut: new Date(debut),
        fin: getEnd(new Date(debut), circuit),
        nom: beneficiaire,
        color: getRandomColor(),
        paid: true,
        upsell: false,
        report: false,
        contact: [],
        remarques: '',
        statut,
        circuit: circuit['@id'],
        cadeau: selection['@id'],
        origine: clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
        code: generateSafeCode('RESA'),
        pilote : quantite <= 1 ? getFormattedValueForBackEnd(pilote) : null,
        avion: quantite <= 1 ? getFormattedValueForBackEnd(avion) : null,
        position: quantite <= 1 ? position : null
      };

      for (let i = 0; i < data.quantite; i++) {
        const option = isDefined(selectedOptions?.[i]) ? selectedOptions[i] : null;
        const prix = getTotalPrice(circuit, option, origine);
        const newData = {...data, option: getFormattedValueForBackEnd(option), prix };

        await create('reservations', {data: newData});
        await updatePrepayment(selection);
      }
      notify(`${ data.quantite > 1 ? 'Les réservations ont bien été enregistrées.' : 'La réservation a bien été enregistrée.' }`, { type: 'info' });
      if (debut) {
        const dateStr = new Date(data.debut).toISOString().slice(0, 10);
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = `/admin#/?scroll=calendar&date=${dateStr}`;
      } else {
        redirect('list', 'cadeaux'); 
      }
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement de la réservation.`, { type: 'error' });
      console.error(error);
      if (debut)
        window.location.href = `/admin#/?scroll=calendar&date=${new Date(debut).toJSON().slice(0, 10) || ''}`;
      else
        redirect('list', 'cadeaux'); 
    } finally {
      isOperating.current = false;
    }
  };

  const getTotalPrice = (circuit, option, origines) => {
      const maxOriginDiscount = isDefinedAndNotVoid(origines) ? getMaxDiscountFromOrigin(origines) : 0;
      return (isDefined(circuit?.prix) ? circuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(option?.prix) ? option.prix : 0);
  };
        
  const getMaxDiscountFromOrigin = origines =>  origines.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

  const getOptionsArray = (selectedOptions, quantite, bddOptions) => {
      let options = isDefinedAndNotVoid(selectedOptions?.options) ? selectedOptions.options.map(o => bddOptions.find(option => option['@id'] === getFormattedValueForBackEnd(o))) : [];
      const missingInputs = quantite - options.length;
      if (missingInputs > 0) {
        for (let i = 0; i < missingInputs; i++) {
          options.unshift(null);
        }
      }
      return options;
  };

  const getFormattedPrepayment = prepayment => {
    const { circuit, options, option, origine } = prepayment; 
    return {
      ...prepayment, 
      circuit: isDefined(circuit) ? typeof circuit === 'string' ? circuit : circuit['@id'] : null,
      options: isDefined(options) ? typeof options === 'string' ? options : options['@id'] : null,
      option: isDefined(option) ? typeof option === 'string' ? option : option['@id'] : null,
      origine: isDefinedAndNotVoid(origine) ? origine.map(o => typeof o === 'string' ? o : o['@id']) : []
    };
  };

  const updatePrepayment = async prepayment => {
    const formattedPrepayment = getFormattedPrepayment(prepayment);
    await update('reservations', {
      id: formattedPrepayment.id,
      data: {...formattedPrepayment, used: true, sendEmail: false},
      previousData: formattedPrepayment
    });
  };

  return (
    // @ts-ignore
    <Create resource="reservations" redirect="list" mutationMode="pessimistic">
      <SimpleForm onSubmit={onSubmit} defaultValues={defaultValues} toolbar={<CustomToolbar debut={ debut }/>}>
        <ConversionLink client={ client } debut={ debut }/>
        <DateTimeInput source="debut" defaultValue={ isNotBlank(debut) ? new Date(debut) : new Date((new Date()).setHours(7,0,0)) } label="Décollage" validate={required()}/>
        <ReferenceInput reference="cadeaux" source="prepayment" label="Prépaiement" filter={{ used: false }}>
          <SelectInput optionText="name" label="Prépaiement" validate={required()} helperText={ <PrepaymentHelperText prepayments={ prepayments }/> }/>
        </ReferenceInput>
        <SelectInput source="statut" choices={ status } defaultValue={ status[0].id } validate={required()}/>
        <FilteredPiloteInput client={ client } prepayments={ prepayments } circuits={ circuits } defaultStart={ isNotBlank(debut) ? new Date(debut) : new Date((new Date()).setHours(7,0,0)) }/>
        <FilteredAeronefInput client={ client } prepayments={ prepayments } defaultStart={ isNotBlank(debut) ? new Date(debut) : new Date((new Date()).setHours(7,0,0)) }/>
        <PositionInput prepayments={ prepayments }/>
        <QuantiteWatcher prepayments={ prepayments }/>
      </SimpleForm>
    </Create>
  ) ;
}