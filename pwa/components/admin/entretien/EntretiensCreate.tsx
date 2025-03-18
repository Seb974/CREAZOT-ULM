import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  DateInput
} from "react-admin";
import { Create } from "react-admin";

export const EntretiensCreate = () => (
<Create>
  <SimpleForm>
    <DateInput source="date" defaultValue={ new Date() } label="Date"/>
    <ReferenceInput reference="aeronefs" source="aeronef" label="Aéronef" />
    <TextInput source="intervention" label="Détail de l'intervention" multiline/>
    <NumberInput source="horametreNextIntervention" label="Prochaine intervention"/>
  </SimpleForm>
</Create>
);