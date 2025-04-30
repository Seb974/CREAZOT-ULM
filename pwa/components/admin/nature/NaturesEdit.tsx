import { SimpleForm, TextInput, NumberInput, Edit, required } from "react-admin"; 

export const NaturesEdit = () => {

  return (
    <Edit>
        <SimpleForm>
          <TextInput source="code" label="Code" validate={required()}/>
          <TextInput source="label" label="Label" validate={required()}/>
        </SimpleForm>
    </Edit>
  )
};