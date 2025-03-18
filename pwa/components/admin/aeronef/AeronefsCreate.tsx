import { 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput,
  required
} from "react-admin";
import { Create } from "react-admin";

export const AeronefsCreate = () => (
<Create>
  <SimpleForm>
    <TextInput source="immatriculation" label="Immatriculation" validate={required()}/>
    <NumberInput source="horametre" label="Horamètre actuel" validate={required()}/>
    <NumberInput source="entretien" label="Prochain entretien" validate={required()}/>
    <NumberInput source="seuilAlerte" label="Seuil d'alerte (en h) avant entretien" defaultValue={ 10 } validate={required()}/>
    <BooleanInput source="decimal" label="Horamètre décimal"/>
    { false && <BooleanInput source="alerteEnvoyee" label="Alerte envoyée" defaultValue={ false } /> }
  </SimpleForm>
</Create>
);