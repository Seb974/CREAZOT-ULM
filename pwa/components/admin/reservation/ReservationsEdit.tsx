import { Edit, SelectInput, useDataProvider, DateTimeInput, ReferenceInput, SimpleForm, TextInput, BooleanInput, ArrayInput, SimpleFormIterator, ReferenceArrayInput, SelectArrayInput, useRedirect, useNotify, useRecordContext } from "react-admin";
import { useWatch, useFormContext } from "react-hook-form";
import { generateSafeCode, getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid, isNotBlank, isValid } from "../../../app/lib/utils";
import { status, positions } from "../../../app/lib/reservation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from '../../admin/ClientProvider';
import { useLocation } from 'react-router-dom';
import { Toolbar, SaveButton, DeleteButton } from 'react-admin';
import { Checkbox, FormControlLabel, useMediaQuery } from '@mui/material';
import { clientWithOptions, clientWithGifts, clientWithOriginContact, clientWithPartners, clientUsingAvailabilityFilter, clientWithGroupUpdate } from "../../../app/lib/client";

const ReservationEditToolbar = ({ applyToGroup, setApplyToGroup, isSmall, client, ...props }) => {

    const record = useRecordContext(props);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setApplyToGroup(event.target.checked);

    return (
        <Toolbar {...props} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <SaveButton {...props}/>
            { clientWithGroupUpdate(client) && 
              <FormControlLabel
                  control={ <Checkbox checked={applyToGroup} onChange={handleChange} color="primary" disabled={ isDefined(record?.quantite) && record.quantite <= 1 }/> }
                  label={isSmall ? "Groupe" : "Appliquer au groupe"}
                  style={{ marginRight: '16px' }}
              />
            }
            <DeleteButton {...props} />
        </Toolbar>
    );
};

const FilteredPiloteInput = ({ circuits, client }) => {
  const circuitId = useWatch({ name: "circuit.@id" });
  const debut = useWatch({ name: "debut" });
  const fin = useWatch({ name: "fin" });
  const id = useWatch({ name: "originId" });
  const dataProvider = useDataProvider();

  const [pilotes, setPilotes] = useState([]);

  const getProfilPilotes = useCallback(() => {
    if (!debut || !fin || !id) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const endpoint = clientUsingAvailabilityFilter(client) ? "profil_pilotes/disponibles" : "profil_pilotes";
    const filters = clientUsingAvailabilityFilter(client) ? 
        { debut, fin, timezone, reservationId: id, "exists[certificatMedical]": true }  : 
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
  }, [dataProvider, setPilotes]);

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
    debut: debut instanceof Date ? debut.toISOString() : new Date(debut).toISOString(),
    fin: fin instanceof Date ? fin.toISOString() : new Date(fin).toISOString(),
    id,
  }), [debut, fin, id]);

  useEffect(() => getProfilPilotes(), [getProfilPilotes, filterParams]);

  return (
    <SelectInput
      source="pilote.@id"
      label="Pilote"
      choices={pilotesEligibles}
      optionText={r => isDefined(r) && isDefined(r.firstName) ? r.firstName.charAt(0).toUpperCase() + r.firstName.slice(1) : " "}
      optionValue="@id"
    />
  );
};

const FilteredAeronefInput = ({ client }) => {
  const debut = useWatch({ name: "debut" });
  const fin = useWatch({ name: "fin" });
  const id = useWatch({ name: "originId" });
  const dataProvider = useDataProvider();

  const [aeronefs, setAeronefs] = useState([]);

  const getAeronefs = useCallback(() => {
    if (!debut || !fin || !id) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const endpoint = clientUsingAvailabilityFilter(client) ? "aeronefs/disponibles" : "aeronefs";
    const filters = clientUsingAvailabilityFilter(client) ? { debut, fin, timezone, reservationId: id } : {};
    dataProvider
        .getList(endpoint, { filter: filters })
        .then(({ data }) => setAeronefs(data));
  }, [dataProvider, setAeronefs]);

  const filterParams = useMemo(() => ({
    debut: debut instanceof Date ? debut.toISOString() : new Date(debut).toISOString(),
    fin: fin instanceof Date ? fin.toISOString() : new Date(fin).toISOString(),
    id,
  }), [debut, fin, id]);

  useEffect(() => getAeronefs(), [getAeronefs, filterParams]);

  return (
    <SelectInput
      source="avion.@id"
      label="Aéronef"
      choices={ aeronefs }
      optionText={r => isDefined(r?.immatriculation) ? r?.immatriculation : " "}
      optionValue="@id"
    />
  );
};

const OptionInput = ({ client }) => !clientWithOptions(client) ? null : 
    <ReferenceInput reference="options" source="option.@id" label="Option" />

const GiftInput = ({ client }) => !clientWithGifts(client) ? null : 
    <ReferenceInput reference="cadeaux" source="cadeau.@id" label="Prépaiement" filter={{ "fin['after']": new Date() }}/>

const OriginContactInput = ({ client }) => { 

    const { setValue, getValues } = useFormContext();
    const contacts = getValues('contact') ?? [];

    if (!clientWithOriginContact(client)) return null;

    useEffect(() => {
        const formattedValues = contacts.map(o => getFormattedValueForBackEnd(o));
        setValue("contacts", formattedValues);
    }, [contacts, setValue]);

    return <ReferenceArrayInput source="contacts" reference="contacts" label="Origine"/>;
}

const PartnersInput = ({ client }) => { 

    const { setValue, getValues } = useFormContext();
    const origines = getValues('origine') ?? [];

    if (!clientWithPartners(client)) return null;

    useEffect(() => {
        const formattedValues = origines.map(o => getFormattedValueForBackEnd(o));
        setValue("origineIds", formattedValues);
    }, [origines, setValue]);

    return <ReferenceArrayInput source="origineIds" reference="origines" label="Origine"/>;
}

export const ReservationsEdit = () => {

  const { client } = useClient();
  const location = useLocation();
  const dataProvider = useDataProvider();
  const origin = location?.state?.state?.origin;
  // @ts-ignore
  const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const redirect = useRedirect();
  const notify = useNotify();

  const [circuits, setCircuits] = useState([]);
  const [options, setOptions] = useState([]);
  const [origines, setOrigines] = useState([]);
  const [applyToGroup, setApplyToGroup] = useState(false);

  useEffect(() => {
    getCircuits();
    getOptions();
    getOrigines();
  }, []);

  const getCircuits = useCallback(() => {
    if (circuits.length > 0) return;
    dataProvider
      .getList("circuits", {})
      .then(({ data }) => setCircuits(data));
  }, [dataProvider]);

  const getOptions = useCallback(() => {
      if (options.length > 0) return;
      dataProvider
        .getList("options", {})
        .then(({ data }) => setOptions(data));
  }, [dataProvider]);

  const getOrigines = useCallback(() => {
      if (origines.length > 0) return;
      dataProvider
          .getList("origines", {})
          .then(({ data }) => setOrigines(data));
  }, [dataProvider]);

  const handleSubmit = async reservation => {
      try {
        const formattedData = await transform(reservation);

        //@ts-ignore
        formattedData.applyToGroup = applyToGroup;

        //@ts-ignore
        const { data } = await dataProvider.update('reservations', { id: reservation.id, data: formattedData });

        if (!data || !data['@id']) {
            notify(`Erreur inattendue : l'aéroport n'a pas été mis à jour`, { type: 'warning' });
            return;
        }
        if (origin === 'calendar') {
          const debut = new Date(reservation.debut);
          redirect(`/?scroll=calendar&date=${debut.toJSON().slice(0, 10) || ''}`)
        } else {
          redirect('list', 'reservations');
        }
      } catch (error) {
          console.error(error);
          notify(`Erreur lors de la mise à jour`, { type: 'error' });
      }
  };

  const transform = ({circuit, option, debut, avion, pilote, contacts, origineIds, cadeau, paid, ...data}) => {
    const selectedCircuit = isDefined(circuit) ? circuits.find(c => c['@id'] === getFormattedValueForBackEnd(circuit)) : null;
    const selectedOption = clientWithOptions(client) && isDefined(option) ? options.find(c => c['@id'] === getFormattedValueForBackEnd(option)) : null;
    const seletedContacts = clientWithOriginContact(client) && isDefinedAndNotVoid(contacts) ? contacts.map(c => getFormattedValueForBackEnd(c)) : [];
    const selectedOrigines = clientWithPartners(client) && isDefinedAndNotVoid(origineIds) ? origines.filter(org => isDefined(origineIds.find(o => org['@id'] === getFormattedValueForBackEnd(o)))) : [];
    const formattedCadeau = clientWithGifts(client) ? getFormattedValueForBackEnd(cadeau) : null;
    return {...data,
        debut: new Date(debut),
        code: isNotBlank(data.code) ? data.code : generateSafeCode('RESA'),
        fin: getEnd(debut, selectedCircuit),
        prix: getTotalPrice(selectedCircuit, selectedOption, selectedOrigines),
        circuit: isDefined(circuit) ? circuit['@id'] : null,
        avion: isDefined(avion) ? avion['@id'] : null,
        option: clientWithOptions(client) && isDefined(option) ? option['@id'] : null,
        pilote: getFormattedValueForBackEnd(pilote),
        paid: isDefined(formattedCadeau) ? true : paid,
        origine: clientWithPartners(client) && isDefinedAndNotVoid(origineIds) ? origineIds.map(o => getFormattedValueForBackEnd(o)) : [],
        cadeau: formattedCadeau,
        contact: seletedContacts,
    };
  };

  const getTotalPrice = (circuit, option, origines) => {
      const maxOriginDiscount = isDefinedAndNotVoid(origines) ? getMaxDiscountFromOrigin(origines) : 0;
      return (isDefined(circuit) && isDefined(circuit.prix) ? circuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(option) && isDefined(option.prix) ? option.prix : 0);
  };
        
  const getMaxDiscountFromOrigin = origines =>  origines.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

  const getEnd = (debut, circuit) => {
    const start = new Date(debut);
    const duration = isDefined(circuit) && isDefined(circuit.duree) ? new Date(circuit.duree) : new Date((new Date()).setHours(1, 0, 0));
    return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
  };

  return (
    <Edit>
      <SimpleForm 
        // @ts-ignore
        toolbar={<ReservationEditToolbar applyToGroup={applyToGroup} setApplyToGroup={setApplyToGroup} isSmall={isSmall} client={client}/>} 
        onSubmit={handleSubmit}
      >
          <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(8, 0, 0)) } label="Date"/>
          <TextInput source="nom" label="Nom & prénom du passager"/>
          <TextInput source="telephone" label="N° de téléphone"/>
          <TextInput source="email" label="Adresse email"/>
          <GiftInput client={ client }/>
          <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit" />
          <OptionInput client={ client }/>
          <FilteredPiloteInput circuits={ circuits } client={ client }/>
          <FilteredAeronefInput client={ client }/>
          <SelectInput source="position" choices={ positions } defaultValue="-"/>
          <SelectInput source="statut" choices={ status } />
          <TextInput source="color" label="Code couleur"/>
          <OriginContactInput client={ client }/>
          <PartnersInput client={ client }/>
          <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
          <BooleanInput source="paid" label="Prépayé"/>
          <BooleanInput source="upsell" label="Upsell"/>
          <BooleanInput source="report" label="Report"/>
          <TextInput source="originId" sx={{ display: 'none' }}/>
      </SimpleForm>
    </Edit>
  )
};