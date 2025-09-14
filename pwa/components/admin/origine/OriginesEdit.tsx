import { BooleanInput, Edit } from "react-admin";
import { SimpleForm, TextInput, NumberInput } from "react-admin";

export const OriginesEdit = () => {

  return (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom"/>
            <NumberInput source="discount" label="Remise Passager (en %)"/>
            <BooleanInput source="hasCommission" label="Rétro-commission" />
          </SimpleForm>
    </Edit>
  )
};