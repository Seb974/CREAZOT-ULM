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
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { status, positions } from "../../../app/lib/reservation";
import { useEffect, useState } from "react";

const FilteredPiloteInput = ({ pilotes, circuits }) => {
  const circuitId = useWatch({ name: "circuit.@id" });
  const { setValue, getValues } = useFormContext();

  const selectedCircuit = circuits.find(c => c['@id'] === circuitId);
  const qualificationsRequises = selectedCircuit?.qualifications?.map(q => q['@id']) || [];
  const needsEncadrant = selectedCircuit?.needsEncadrant;

  const pilotesEligibles = qualificationsRequises.length === 0
    ? (needsEncadrant ? pilotes.filter(({profil, ...p}) => isDefined(profil.qualifications.find(q => isDefined(q.encadrant) && q.encadrant))) : pilotes)
    : pilotes.filter(({profil, ...p}) =>
        Array.isArray(profil.qualifications) &&
        profil.qualifications.map(q => q['@id']).some(q => qualificationsRequises.includes(q))
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
      label="Pilote"
      choices={ pilotesEligibles }
      optionText={(r) => isDefined(r) && isDefined(r.firstName) ? r.firstName.charAt(0).toUpperCase() + r.firstName.slice(1) : ' '}
      optionValue="@id"
      // emptyText="Aucun pilote éligible"
    />
  );
};

export const ReservationsEdit = () => {

  const dataProvider = useDataProvider();
  const [circuits, setCircuits] = useState([]);
  const [options, setOptions] = useState([]);
  const [origines, setOrigines] = useState([]);
  const [pilotes, setPilotes] = useState([]);

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
              profil: {...profil, qualifications: isDefinedAndNotVoid(profil.qualifications) ? profil.qualifications : []},
              encadrant: !!profil.qualifications?.find(q => q.encadrant)
            }))
          setPilotes(piloteProfils)
        });
  };

  const transform = ({circuit, option, debut, avion, pilote, contact, origine, cadeau, paid, ...data}) => {
    const selectedPilote = isDefined(pilote) && isDefined(pilote['@id']) ? pilote['@id'] : null;
    const selectedCircuit = isDefined(circuit) && isDefined(circuit['@id']) ? circuits.find(c => c['@id'] === circuit['@id']) : null;
    const selectedOption = isDefined(option) && isDefined(option['@id']) ? options.find(c => c['@id'] === option['@id']) : null;
    const seletedContacts = isDefinedAndNotVoid(contact) ? contact.map(c => c['@id']) : [];
    const selectedOrigines = isDefinedAndNotVoid(origine) ? origines.filter(org => isDefined(origine.find(o => org['@id'] === o['@id']))) : [];
    const formattedCadeau = isDefined(cadeau) && isDefined(cadeau['@id']) ? cadeau['@id'] : null;
    return {...data,
        fin: getEnd(debut, selectedCircuit),
        prix: getTotalPrice(selectedCircuit, selectedOption, selectedOrigines),
        circuit: isDefined(circuit) ? circuit['@id'] : null,
        avion: isDefined(avion) ? avion['@id'] : null,
        option: isDefined(option) ? option['@id'] : null,
        pilote: selectedPilote,
        paid: isDefined(formattedCadeau) ? true : paid,
        origine: isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
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
  <Edit transform={transform}>
      <SimpleForm>
          <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(8, 0, 0)) } label="Date"/>
          <TextInput source="nom" label="Nom & prénom du passager"/>
          <TextInput source="telephone" label="N° de téléphone"/>
          <TextInput source="email" label="Adresse email"/>
          <ReferenceInput reference="cadeaux" source="cadeau.@id" label="Bon cadeau" filter={{ "fin['after']": new Date()  }}/>
          <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit" />
          <ReferenceInput reference="options" source="option.@id" label="Option" />
          <FilteredPiloteInput pilotes={ pilotes } circuits={ circuits } />
          <ReferenceInput reference="aeronefs" source="avion.@id" label="Aéronef" />
          <SelectInput source="position" choices={ positions } defaultValue="-"/>
          <SelectInput source="statut" choices={ status } />
          <TextInput source="color" label="Code couleur"/>
          <ArrayInput source="contact" label="Contact initial">
            <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="contacts" source="@id" label="Contact initial" />
            </SimpleFormIterator>
          </ArrayInput>
          <ArrayInput source="origine" label="Origine de l'appel">
            <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="origines" source="@id" label="Origine de l'appel" />
            </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
          <BooleanInput source="paid" label="Prépayé"/>
          <BooleanInput source="upsell" label="Upsell"/>
          <BooleanInput source="report" label="Report"/>
      </SimpleForm>
  </Edit>
  )
};