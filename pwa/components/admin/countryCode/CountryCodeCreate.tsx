import { Create, SimpleForm, TextInput, required } from "react-admin";

const transformData = (data: any) => ({
  ...data,
  code: data.code?.toUpperCase().trim(),
});

export const CountryCodeCreate = () => (
  <Create title="Ajouter un code pays" transform={transformData} redirect="list">
    <SimpleForm>
      <TextInput
        source="code"
        label="Code (ex: RE, FR, DE)"
        validate={[required()]}
        helperText="Code unique, 2-10 caractères"
        inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
      />
      <TextInput
        source="label"
        label="Libellé (ex: La Réunion, France)"
        validate={[required()]}
        fullWidth
      />
    </SimpleForm>
  </Create>
);
