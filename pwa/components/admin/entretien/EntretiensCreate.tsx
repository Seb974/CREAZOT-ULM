import { 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  ReferenceArrayInput
} from "react-admin";
import { Create } from "react-admin";

export const EntretiensCreate = () => (
<Create redirect="list">
  <SimpleForm>
    <DateInput source="date" defaultValue={ new Date() } label="Date"/>
    <ReferenceInput reference="aeronefs" source="aeronef" label="Aéronef" />
    <ReferenceArrayInput source="intervenants" reference="users" />
    <TextInput source="intervention" label="Détail de l'intervention" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
    <BooleanInput source="changementMoteur" label="Changement du moteur" defaultValue={ false }/>
    <NumberInput source="horametreNextIntervention" label="Prochaine intervention"/>
  </SimpleForm>
</Create>
);