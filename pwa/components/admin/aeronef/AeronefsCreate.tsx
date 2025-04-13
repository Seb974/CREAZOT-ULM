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
    <NumberInput source="changementMoteur" label="Changement du moteur" />
    <NumberInput source="seuilAlerte" label="Seuil d'alerte (en h) avant entretien" defaultValue={ 10 } validate={required()}/>
    <NumberInput source="seuilAlerteChangementMoteur" label="Seuil d'alerte (en h) avant changement du moteur" defaultValue={ 200 }/>
    <TextInput source="codeBalise" label="Code Microtrak"/>
    <BooleanInput source="decimal" label="Horamètre décimal"/>
    { false && <BooleanInput source="alerteEnvoyee" label="Alerte envoyée" defaultValue={ false } /> }
    { false && <BooleanInput source="alerteMoteurEnvoyee" label="Alerte moteur envoyée" defaultValue={ false } /> }
  </SimpleForm>
</Create>
);