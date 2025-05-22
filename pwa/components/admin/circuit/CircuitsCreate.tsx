import { DateTimeInput, ReferenceInput, SimpleForm, TextInput, NumberInput, BooleanInput, ArrayInput, SimpleFormIterator } from "react-admin";
import { Create } from "react-admin";
import { useWatch } from "react-hook-form";
import { useClient } from '../../admin/ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";

export const CircuitsCreate = () => {

  const { client } = useClient();

  const DurationInput = () => {
      const prixFixe = useWatch<{ prixFixe: string }>({ name: "prixFixe" });
      return <DateTimeInput source="duree" defaultValue={ new Date((new Date()).setHours(1,0,0)) } readOnly={ !prixFixe } />
  };

  const OptionsInput = () => {
    return !clientWithOptions(client) ? null :
      <BooleanInput source="avecOptions" label="Options disponibles" defaultValue={ false }/>
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
          <ArrayInput source="qualifications" label="Qualification(s) requise(s) du pilote">
            <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="qualifications" source="@id" label="Qualifications" />
            </SimpleFormIterator>
          </ArrayInput>
          <BooleanInput source="needsEncadrant" label="Pilote encadrant requis" defaultValue={ false }/>
          <BooleanInput source="prixFixe" label="Tarif non lié à la durée" defaultValue={ false }/>
          <OptionsInput/>
        </SimpleForm>
      </Create>
  )
};