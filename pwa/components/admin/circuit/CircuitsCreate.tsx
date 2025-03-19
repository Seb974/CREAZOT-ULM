import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput,
} from "react-admin";
import { Create } from "react-admin";
import { useWatch } from "react-hook-form";

export const CircuitsCreate = () => {


  const DurationInput = () => {

      const prixFixe = useWatch<{ prixFixe: string }>({ name: "prixFixe" });
      return <DateTimeInput source="duree" defaultValue={ new Date((new Date()).setHours(1,0,0)) } readOnly={ !prixFixe } />
  };

  return (
      <Create>
        <SimpleForm>
          <TextInput source="nom"/>
          <TextInput source="code"/>
          <NumberInput source="prix"/>
          <NumberInput source="cout"/>
          <DurationInput />
          <ReferenceInput reference="natures" source="nature" /> 
          <BooleanInput source="prixFixe" label="Prix indépendant de la durée" />
          <BooleanInput source="avecOptions" label="Options disponibles"/>
        </SimpleForm>
      </Create>
  )
};