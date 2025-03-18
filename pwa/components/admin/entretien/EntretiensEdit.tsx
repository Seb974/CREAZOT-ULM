import { DateInput, Edit } from "react-admin";
import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput
} from "react-admin";

export const EntretiensEdit = () => {

  const transform = data => {
    data['aeronef'] = data['aeronef']['@id'];
  
    return data;
  };

  return (
  <Edit transform={transform}>
      <SimpleForm>
          <DateInput source="date" label="Date"/>
          <ReferenceInput reference="aeronefs" source="aeronef.@id" label="Aéronef"/>
          <TextInput source="intervention" label="Détail de l'intervention" multiline/>
          <NumberInput source="horametreIntervention" label="Horamètre"/>
          <NumberInput source="horametreNextIntervention" label="Prochaine intervention"/>
      </SimpleForm>
  </Edit>
  )
};