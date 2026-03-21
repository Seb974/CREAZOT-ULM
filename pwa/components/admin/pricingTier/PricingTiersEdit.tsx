import {
  Edit,
  SimpleForm,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  required,
} from "react-admin";

export const PricingTiersEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="pricingCategory" reference="pricing-categories">
        <AutocompleteInput optionText="name" label="Grille tarifaire" validate={required()} />
      </ReferenceInput>
      <NumberInput source="minAeronefs" label="Min aéronefs" validate={required()} />
      <NumberInput source="maxAeronefs" label="Max aéronefs" />
      <NumberInput source="pricePerAeronef" label="€/aéronef/mois" validate={required()} />
    </SimpleForm>
  </Edit>
);
