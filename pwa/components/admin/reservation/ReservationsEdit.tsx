import { 
  Edit, 
  SelectInput, 
  useDataProvider,
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  BooleanInput,
  ArrayInput,
  SimpleFormIterator
} from "react-admin";
import { useWatch, useFormContext } from "react-hook-form";
import { generateSafeCode, isDefined, isDefinedAndNotVoid, isNotBlank, isValid } from "../../../app/lib/utils";
import { status, positions } from "../../../app/lib/reservation";
import { useEffect, useState } from "react";
import { useClient } from '../../admin/ClientProvider';
import { useLocation } from 'react-router-dom';
import { clientWithOptions, clientWithGifts, clientWithOriginContact, clientWithPartners } from "../../../app/lib/client";

const FilteredPiloteInput = ({ pilotes, circuits }) => {
  const circuitId = useWatch({ name: "circuit.@id" });
  const debut = useWatch({ name: "debut" });
  const { setValue, getValues } = useFormContext();

  const selectedCircuit = circuits.find(c => c['@id'] === circuitId);
  const qualificationsRequises = selectedCircuit?.qualifications?.map(q => q['@id']) || [];
  const needsEncadrant = selectedCircuit?.needsEncadrant;

  const pilotesEligibles = qualificationsRequises.length === 0
      ? (needsEncadrant ? pilotes.filter(({profil, ...p}) => isDefined(profil.pilotQualifications.find(q => isDefined(q.qualification.encadrant) && q.qualification.encadrant && isValid(q.validUntil, q.dateObtention, debut)))) : pilotes)
      : pilotes.filter(({profil, ...p}) =>
          Array.isArray(profil.pilotQualifications) &&
          profil.pilotQualifications
                .filter(q => isValid(q.validUntil, q.dateObtention, debut))
                .map(q => q.qualification['@id'])
                .some(q => qualificationsRequises.includes(q))
    );

  useEffect(() => {
    const selectedPiloteId = getValues("pilote.@id");
    const stillEligible = pilotesEligibles.some(p => p['@id'] === selectedPiloteId);
    if (!stillEligible) {
      setValue("pilote.@id", null);
    }
  }, [circuitId]);
  
  return (
    <SelectInput
      source="pilote.@id"
      label="Pilote @id"
      choices={ pilotesEligibles }
      optionText={(r) => isDefined(r) && isDefined(r.firstName) ? r.firstName.charAt(0).toUpperCase() + r.firstName.slice(1) : ' '}
      optionValue="@id"
    />
  );
};

export const ReservationsEdit = () => {

  const { client } = useClient();
  const location = useLocation();
  const dataProvider = useDataProvider();
  const origin = location?.state?.state?.origin;

  const [circuits, setCircuits] = useState([]);
  const [options, setOptions] = useState([]);
  const [origines, setOrigines] = useState([]);
  const [pilotes, setPilotes] = useState([]);
  const [recordDate, setRecordDate] = useState(new Date());

  useEffect(() => {
    getCircuits();
    getOptions();
    getOrigines();
    getProfilPilotes();
  }, []);

  const getCircuits = () => {
    dataProvider
      .getList("circuits", {})
      .then(({ data }) => setCircuits(data));
  };

  const getOptions = () => {
    dataProvider
      .getList("options", {})
      .then(({ data }) => setOptions(data));
  };

  const getOrigines = () => {
    dataProvider
        .getList("origines", {})
        .then(({ data }) => setOrigines(data));
  };

  const getProfilPilotes = () => {
    dataProvider
        .getList("profil_pilotes", {})
        .then(({ data }) => {
          const piloteProfils = data
            .filter(p => isDefined(p.pilote))
            .map(({pilote, ...profil}) => ({
              ...pilote, 
              profil: {...profil, pilotQualifications: isDefinedAndNotVoid(profil.pilotQualifications) ? profil.pilotQualifications : []},
            }))
          setPilotes(piloteProfils)
        });
  };

  const transform = ({circuit, option, debut, avion, pilote, contact, origine, cadeau, paid, ...data}) => {
    setRecordDate(new Date(debut));
    const selectedPilote = isDefined(pilote) && isDefined(pilote['@id']) ? pilote['@id'] : null;
    const selectedCircuit = isDefined(circuit) && isDefined(circuit['@id']) ? circuits.find(c => c['@id'] === circuit['@id']) : null;
    const selectedOption = clientWithOptions(client) && isDefined(option) && isDefined(option['@id']) ? options.find(c => c['@id'] === option['@id']) : null;
    const seletedContacts = clientWithOriginContact(client) && isDefinedAndNotVoid(contact) ? contact.map(c => c['@id']) : [];
    const selectedOrigines = clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origines.filter(org => isDefined(origine.find(o => org['@id'] === o['@id']))) : [];
    const formattedCadeau = clientWithGifts(client) && isDefined(cadeau) && isDefined(cadeau['@id']) ? cadeau['@id'] : null;
    return {...data,
        debut: new Date(debut),
        code: isNotBlank(data.code) ? data.code : generateSafeCode('RESA'),
        fin: getEnd(debut, selectedCircuit),
        prix: getTotalPrice(selectedCircuit, selectedOption, selectedOrigines),
        circuit: isDefined(circuit) ? circuit['@id'] : null,
        avion: isDefined(avion) ? avion['@id'] : null,
        option: clientWithOptions(client) && isDefined(option) ? option['@id'] : null,
        pilote: selectedPilote,
        paid: isDefined(formattedCadeau) ? true : paid,
        origine: clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
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

  const OptionInput = () => !clientWithOptions(client) ? null : 
    <ReferenceInput reference="options" source="option.@id" label="Option" />
  
  const GiftInput = () => !clientWithGifts(client) ? null : 
    <ReferenceInput reference="cadeaux" source="cadeau.@id" label="Prépaiement" filter={{ "fin['after']": new Date()  }}/>
  
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

  return (
  <Edit transform={transform} mutationMode="pessimistic" redirect={ origin === 'calendar' ? `/?scroll=calendar&date=${recordDate.toJSON().slice(0, 10) || ''}` : 'list' }>
      <SimpleForm>
          <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(8, 0, 0)) } label="Date"/>
          <TextInput source="nom" label="Nom & prénom du passager"/>
          <TextInput source="telephone" label="N° de téléphone"/>
          <TextInput source="email" label="Adresse email"/>
          <GiftInput/>
          <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit" />
          <OptionInput/>
          <FilteredPiloteInput pilotes={ pilotes } circuits={ circuits } />
          <ReferenceInput reference="aeronefs" source="avion.@id" label="Aéronef" />
          <SelectInput source="position" choices={ positions } defaultValue="-"/>
          <SelectInput source="statut" choices={ status } />
          <TextInput source="color" label="Code couleur"/>
          <OriginContactInput/>
          <PartnersInput/>
          <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
          <BooleanInput source="paid" label="Prépayé"/>
          <BooleanInput source="upsell" label="Upsell"/>
          <BooleanInput source="report" label="Report"/>
      </SimpleForm>
  </Edit>
  )
};