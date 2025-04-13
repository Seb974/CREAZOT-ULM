import { Edit } from "react-admin";
import { SimpleForm, TextInput, NumberInput } from "react-admin";

export const OriginesEdit = () => {

  return (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom"/>
            <NumberInput source="discount" label="Remise (en %)"/>
          </SimpleForm>
    </Edit>
  )
};