import { SimpleForm, DateInput, Edit, TextInput, ReferenceInput, ArrayInput, SimpleFormIterator, BooleanInput, useDataProvider } from "react-admin";
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useEffect, useState } from "react";

export const CadeauxEdit = () => {

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

  const transform = ({circuit, option, origine, ...data}) => {
    const selectedCircuit = isDefined(circuit) && isDefined(circuit['@id']) ? circuits.find(c => c['@id'] === circuit['@id']) : null;
    const selectedOption = isDefined(option) && isDefined(option['@id']) ? options.find(c => c['@id'] === option['@id']) : null;
    const selectedOrigines = isDefinedAndNotVoid(origine) ? origines.filter(org => isDefined(origine.find(o => org['@id'] === o['@id']))) : [];
    return {...data,
        circuit: isDefined(circuit) ? circuit['@id'] : null,
        option: isDefined(option) ? option['@id'] : null,
        origine: isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
        cout: getTotalPrice(selectedCircuit, selectedOption, selectedOrigines)
    }
  };

  const getTotalPrice = (circuit, option, origines) => {
    const maxOriginDiscount = isDefinedAndNotVoid(origines) ? getMaxDiscountFromOrigin(origines) : 0;
    return (isDefined(circuit) && isDefined(circuit.prix) ? circuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(option) && isDefined(option.prix) ? option.prix : 0);
};
      
const getMaxDiscountFromOrigin = origines =>  origines.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

  return (
  <Edit redirect="list" transform={transform}>
     <SimpleForm>
        <TextInput source="code" label="N° du bon cadeau" disabled/>
        <TextInput source="beneficiaire" label="Nom du bénéficiaire" />
        <TextInput source="offreur" label="Nom de la personne offrante" />
        <TextInput source="email" label="Adresse email de la personne offrante"/>
        <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit"/>
        <ReferenceInput reference="options" source="option.@id" label="Option" />
        <ArrayInput source="origine" label="Origine de l'appel">
            <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="origines" source="@id" label="Origine de l'appel" />
            </SimpleFormIterator>
          </ArrayInput>
        <TextInput source="paymentId" label="N° du paiement"/>
        <DateInput source="fin" label="Date d'expiration"/>
        <TextInput source="message" label="Message" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <BooleanInput source="used" label="Bon déjà utilisé"/>
      </SimpleForm>
  </Edit>
  )
};