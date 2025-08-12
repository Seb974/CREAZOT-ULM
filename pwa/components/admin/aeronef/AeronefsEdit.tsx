import { Edit, SimpleForm, TextInput, NumberInput, BooleanInput } from "react-admin";
import { useClient } from "../ClientProvider";
import { clientWithMicrotrakTags } from "../../../app/lib/client";

export const AeronefsEdit = () => {

  const { client } = useClient();
  
    const MicrotrakInput = () => {
      return !clientWithMicrotrakTags(client) ? null : 
        <TextInput source="codeBalise" label="Code Microtrak"/>
    };

  return (
    <Edit >
        <SimpleForm>
          <TextInput source="immatriculation" label="Immatriculation"/>
          <NumberInput source="horametre" label="Horamètre actuel"/>
          <NumberInput source="entretien" label="Prochain entretien"/>
          <NumberInput source="changementMoteur" label="Changement du moteur" />
          <NumberInput source="seuilAlerte" label="Seuil d'alerte (en h) avant entretien"/>
          <NumberInput source="seuilAlerteChangementMoteur" label="Seuil d'alerte (en h) avant changement du moteur"/>
          <MicrotrakInput/>
          <BooleanInput source="decimal" label="Horamètre décimal"/>
        </SimpleForm>
    </Edit>
  )
};