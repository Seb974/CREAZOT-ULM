import { 
  Edit,
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput
} from "react-admin";

export const AeronefsEdit = () => {

  return (
  <Edit >
      <SimpleForm>
        <TextInput source="immatriculation" label="Immatriculation"/>
        <NumberInput source="horametre" label="Horamètre actuel"/>
        <NumberInput source="entretien" label="Prochain entretien"/>
        <NumberInput source="seuilAlerte" label="Seuil d'alerte (en h) avant entretien"/>
        <BooleanInput source="decimal" label="Horamètre décimal"/>
      </SimpleForm>
  </Edit>
  )
};