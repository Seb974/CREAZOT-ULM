import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput
} from "react-admin";
import { Create } from "react-admin";

export const CircuitsCreate = () => (
<Create>
  <SimpleForm>
    <TextInput source="nom"/>
    <TextInput source="code"/>
    <NumberInput source="prix"/>
    <NumberInput source="cout"/>
    <DateTimeInput source="duree" />
    <ReferenceInput reference="natures" source="nature" /> 
    <BooleanInput source="prixFixe" label="Prix indépendant de la durée"/>
    <BooleanInput source="avecOptions" label="Options disponibles"/>
  </SimpleForm>
</Create>
);