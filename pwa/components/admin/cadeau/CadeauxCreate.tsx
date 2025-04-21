import { SimpleForm, TextInput, DateInput, ReferenceInput, ArrayInput, BooleanInput, SimpleFormIterator, required, Create, useCreate, useRedirect, useNotify, useDataProvider } from "react-admin";
import { useEffect, useState } from "react";
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";

export const CadeauxCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const today = new Date();
  const dataProvider = useDataProvider();
  const [options, setOptions] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [origines, setOrigines] = useState([]);

  useEffect(() => {
    getCircuits();
    getOptions();
    getOrigines();
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

  const onSubmit = async ({circuit, option, origine, ...data}) => {
    const circuitId = isDefined(circuit) ? (typeof circuit === 'string' ? circuit : circuit['@id']) : null;
    const optionId = isDefined(option) ? (typeof option === 'string' ? option : option['@id']) : null;
    const selectedCircuit = isDefined(circuit) && isDefined(circuitId) ? circuits.find(c => c['@id'] === circuitId) : null;
    const selectedOption = isDefined(option) && isDefined(optionId) ? options.find(c => c['@id'] === optionId) : null;
    const selectedOrigines = isDefinedAndNotVoid(origine) ? origines.filter(org => isDefined(origine.find(o => org['@id'] === o['@id']))) : [];
    try {
        data = {
            ...data, 
            code: getUniqueCode(), 
            used: false,
            circuit: circuitId,        
            option: optionId,
            origine: isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
            cout: getTotalPrice(selectedCircuit, selectedOption, selectedOrigines)
        };
        create('cadeaux', { data });
        notify('Le bon cadeau a bien été enregistré.', { type: 'info' });
        redirect('list', 'cadeaux');
    } catch (error) {
        notify(`Une erreur bloque l\'enregistrement du bon cadeau.`, { type: 'error' });
        redirect('list', 'cadeaux');
        console.log(error);
    }
  };

  const getUniqueCode = () => Date.now().toString(36).substr(6) + Math.random().toString(36).substr(2);

  const getTotalPrice = (circuit, option, origines) => {
        const maxOriginDiscount = isDefinedAndNotVoid(origines) ? getMaxDiscountFromOrigin(origines) : 0;
        return (isDefined(circuit) && isDefined(circuit.prix) ? circuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(option) && isDefined(option.prix) ? option.prix : 0);
    };
          
  const getMaxDiscountFromOrigin = origines =>  origines.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

  return (
    <Create redirect="list">
      <SimpleForm onSubmit={ onSubmit }>
        <TextInput source="beneficiaire" label="Nom du bénéficiaire" validate={required()}/>
        <TextInput source="offreur" label="Nom de la personne offrante" validate={required()}/>
        <TextInput source="email" label="Adresse email de la personne offrante" validate={required()}/>
        <ReferenceInput reference="circuits" source="circuit" label="Circuit"/>
        <ReferenceInput reference="options" source="option" label="Option" />
        <ArrayInput source="origine" label="Origine de l'appel">
            <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="origines" source="@id" label="Origine de l'appel" />
            </SimpleFormIterator>
          </ArrayInput>
        <TextInput source="paymentId" label="N° du paiement"/>
        <DateInput source="fin" defaultValue={ new Date(today.getFullYear() + 1, today.getMonth(), today.getDate() + 1) } label="Date d'expiration"/>
        <TextInput source="message" label="Message" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <BooleanInput source="sendEmail" label="Envoi du bon cadeau par email"/>
      </SimpleForm>
    </Create>
  );
};