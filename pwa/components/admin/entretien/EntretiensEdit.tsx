import { ArrayInput, DateInput, Edit, SimpleFormIterator } from "react-admin";
import { 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput
} from "react-admin";

export const EntretiensEdit = () => {

  const transform = data => {
    data['intervenants'] = data['intervenants'].map(intervenant => intervenant['@id']);
    return data;
  };

  return (
  <Edit transform={transform} redirect="list">
      <SimpleForm>
          <DateInput source="date" label="Date"/>
          <ReferenceInput reference="aeronefs" source="aeronef.@id" label="Aéronef"/>
          <ArrayInput source="intervenants">
              <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="users" source="@id" label="Intervenant"/>
              </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="intervention" label="Détail de l'intervention" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
          <BooleanInput source="changementMoteur" label="Changement du moteur"/>
          <NumberInput source="horametreIntervention" label="Horamètre"/>
          <NumberInput source="horametreNextIntervention" label="Prochaine intervention"/>
      </SimpleForm>
  </Edit>
  )
};