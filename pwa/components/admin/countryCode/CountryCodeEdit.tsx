import { Edit, SimpleForm, TextInput, required } from "react-admin";

const transformData = (data: any) => ({
  ...data,
  code: data.code?.toUpperCase().trim(),
});

export const CountryCodeEdit = () => (
  <Edit title="Modifier le code pays" transform={transformData} mutationMode="pessimistic">
    <SimpleForm>
      <TextInput
        source="code"
        label="Code"
        validate={[required()]}
        inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
      />
      <TextInput
        source="label"
        label="Libellé"
        validate={[required()]}
        fullWidth
      />
    </SimpleForm>
  </Edit>
);
