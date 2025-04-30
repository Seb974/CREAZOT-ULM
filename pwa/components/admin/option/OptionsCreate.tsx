import { NumberInput, SimpleForm, TextInput, Create, required } from "react-admin";

export const OptionsCreate = () => {

  return (
      <Create>
          <SimpleForm>
              <TextInput source="name" label="Nom de l'option" validate={required()}/>
              <NumberInput source="prix" label="Prix" validate={required()}/>
          </SimpleForm>
      </Create>
  )
};