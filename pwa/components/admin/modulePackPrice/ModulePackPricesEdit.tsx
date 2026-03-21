import {
  Edit,
  SimpleForm,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  required,
} from "react-admin";

export const ModulePackPricesEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="modulePack" reference="module-packs">
        <AutocompleteInput optionText="name" label="Pack de modules" validate={required()} />
      </ReferenceInput>
      <ReferenceInput source="pricingCategory" reference="pricing-categories">
        <AutocompleteInput optionText="name" label="Grille tarifaire" validate={required()} />
      </ReferenceInput>
      <NumberInput source="monthlyPrice" label="Prix mensuel (€)" validate={required()} />
    </SimpleForm>
  </Edit>
);
