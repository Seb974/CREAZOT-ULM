import { SimpleForm, TextInput, NumberInput, BooleanInput } from "react-admin";
import { Create } from "react-admin";

export const OriginesCreate = () => {

  return (
      <Create>
          <SimpleForm>
              <TextInput source="name" label="Nom"/>
              <NumberInput source="discount" label="Remise Passager (en %)"/>
              <BooleanInput source="hasCommission" label="Rétro-commission" defaultValue={ false } />
          </SimpleForm>
      </Create>
  )
};