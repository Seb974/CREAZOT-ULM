import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  DateInput,
  ReferenceArrayInput
} from "react-admin";
import { Create } from "react-admin";

export const EntretiensCreate = () => (
<Create>
  <SimpleForm>
    <DateInput source="date" defaultValue={ new Date() } label="Date"/>
    <ReferenceInput reference="aeronefs" source="aeronef" label="Aéronef" />
    <ReferenceArrayInput source="intervenants" reference="users" />
    <TextInput source="intervention" label="Détail de l'intervention" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
    <NumberInput source="horametreNextIntervention" label="Prochaine intervention"/>
  </SimpleForm>
</Create>
);