import { Edit, SimpleForm, TextInput, NumberInput, ReferenceInput, SelectInput, required } from "react-admin";

export const TaxRateEdit = () => (
  <Edit title="Modifier le taux de TVA" mutationMode="pessimistic">
    <SimpleForm>
      <ReferenceInput source="countryCode" reference="country_codes" sort={{ field: "code", order: "ASC" }}>
        <SelectInput
          label="Code pays"
          optionText={(record: any) => `${record.code} - ${record.label}`}
          validate={[required()]}
          fullWidth
        />
      </ReferenceInput>
      <TextInput source="label" label="Libellé" validate={[required()]} fullWidth />
      <NumberInput
        source="rate"
        label="Taux (ex: 0.20 pour 20%)"
        validate={[required()]}
        step={0.001}
        min={0}
        max={1}
        helperText="Saisir une valeur décimale entre 0 et 1"
      />
    </SimpleForm>
  </Edit>
);
