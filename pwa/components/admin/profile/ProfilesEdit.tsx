import { Edit, ReferenceInput, SimpleForm, ArrayInput, SimpleFormIterator } from "react-admin";

export const ProfilesEdit = () => {

  const transform = data => {
    data['pilote'] = data['pilote']['@id'];
    data['qualifications'] = data['qualifications'].map(qualification => qualification['@id']);
    return data;
  };

  return (
    <Edit transform={ transform } redirect="list">
        <SimpleForm>
          <ReferenceInput reference="users" source="pilote.@id" label="Pilote" />
          <ArrayInput source="qualifications" label="Qualifications">
            <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="qualifications" source="@id" label="Qualifications" />
            </SimpleFormIterator>
          </ArrayInput>
        </SimpleForm>
    </Edit>
  )
};