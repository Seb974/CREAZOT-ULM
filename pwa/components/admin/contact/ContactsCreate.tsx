import { SimpleForm, TextInput } from "react-admin";
import { Create } from "react-admin";

export const ContactsCreate = () => {

  return (
      <Create>
          <SimpleForm>
              <TextInput source="name" label="Nom"/>
          </SimpleForm>
      </Create>
  )
};