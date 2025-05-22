import { Edit } from "react-admin";
import { DateTimeInput, ReferenceInput, SimpleForm, TextInput, NumberInput, BooleanInput, ArrayInput, SimpleFormIterator } from "react-admin";
import { useClient } from '../../admin/ClientProvider';
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { clientWithOptions } from "../../../app/lib/client";


export const CircuitsEdit = () => {

  const { client } = useClient();

  const OptionsInput = () => {
    return !clientWithOptions(client) ? null :
      <BooleanInput source="avecOptions" label="Options disponibles" defaultValue={ false }/>
  };

  const transform = data => {
    data['nature'] = data['nature']['@id'];
    data['qualifications'] = isDefinedAndNotVoid(data['qualifications']) ? data['qualifications'].map(qualification => qualification['@id']) : [];
    data['avecOptions'] = clientWithOptions(client) ? data['avecOptions'] : false;
    return data;
  };

  return (
  <Edit transform={transform}>
    <SimpleForm>
      <TextInput source="nom"/>
      <TextInput source="code"/>
      <NumberInput source="prix"/>
      <NumberInput source="cout"/>
      <DateTimeInput source="duree" />
      <ReferenceInput reference="natures" source="nature.@id"/>
      <ArrayInput source="qualifications" label="Qualification(s) requise(s) du pilote">
        <SimpleFormIterator inline disableReordering>
          <ReferenceInput reference="qualifications" source="@id" label="Qualifications" />
        </SimpleFormIterator>
      </ArrayInput>
      <BooleanInput source="needsEncadrant" label="Pilote encadrant requis" defaultValue={ false }/>
      <BooleanInput source="prixFixe" label="Tarif non lié à la durée" defaultValue={ false }/>
      <OptionsInput/>
    </SimpleForm>
  </Edit>
  )
};