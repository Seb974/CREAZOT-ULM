import { Edit } from "react-admin";
import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput
} from "react-admin";

export const CircuitsEdit = () => {

  const transform = data => {
    data['nature'] = data['nature']['@id'];
  
    return data;
  };

  return (
  <Edit transform={transform}>
      <SimpleForm>
              <TextInput source="nom"/>
              <TextInput source="code"/>
              <NumberInput source="prix"/>
              <NumberInput source="cout"/>
              <DateTimeInput source="duree" />
              <ReferenceInput reference="natures" source="nature.@id"/>
              <BooleanInput source="prixFixe" label="Prix indépendant de la durée"/>
              <BooleanInput source="avecOptions" label="Options disponibles"/>
          </SimpleForm>
  </Edit>
  )
};