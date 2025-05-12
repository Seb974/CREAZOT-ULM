import { Edit } from "react-admin";
import { SimpleForm, TextInput, NumberInput } from "react-admin";

export const ClientsEdit = () => {

  return (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom"/>
          </SimpleForm>
    </Edit>
  )
};