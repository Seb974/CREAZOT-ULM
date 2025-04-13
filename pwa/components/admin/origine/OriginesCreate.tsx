import { SimpleForm, TextInput, NumberInput } from "react-admin";
import { Create } from "react-admin";

export const OriginesCreate = () => {

  return (
      <Create>
          <SimpleForm>
              <TextInput source="name" label="Nom"/>
              <NumberInput source="discount" label="Remise (en %)"/>
          </SimpleForm>
      </Create>
  )
};