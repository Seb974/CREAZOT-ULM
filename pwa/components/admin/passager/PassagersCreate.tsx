import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  DateInput,
  required
} from "react-admin";
import { Create } from "react-admin";

export const PassagersCreate = () => (
<Create>
  <SimpleForm>
    <DateInput source="date" defaultValue={ new Date() } label="Date" validate={required()}/>
    <TextInput source="nom" label="Nom" validate={required()}/>
    <TextInput source="prenom" label="Prénom" validate={required()}/>
    <TextInput source="telephone" label="N° de téléphone" validate={required()}/>
    <TextInput source="email" label="Adresse email" validate={required()}/>
  </SimpleForm>
</Create>
);