import { ReferenceInput, SimpleForm, Create, ArrayInput, SimpleFormIterator } from "react-admin";

export const ProfilesCreate = () => {

  return (
    <Create redirect="list">
      <SimpleForm>
        <ReferenceInput reference="users" source="pilote" label="Pilote" />
        <ArrayInput source="qualifications" label="Qualifications">
          <SimpleFormIterator inline disableReordering>
              <ReferenceInput reference="qualifications" source="@id" label="Qualifications" />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Create>
  );
};