import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  DateTimeInput,
  required,
} from "react-admin";

export const PricingCategoriesCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Nom" validate={required()} />
      <TextInput source="slug" label="Slug" validate={required()} />
      <TextInput source="description" label="Description" multiline />
      <NumberInput source="discountPercent" label="Remise (%)" />
      <NumberInput source="maintenanceDiscount" label="Remise maintenance (%)" defaultValue={10} />
      <BooleanInput source="isDefault" label="Grille par défaut" />
      <BooleanInput source="isActive" label="Actif" defaultValue={true} />
      <DateTimeInput source="validFrom" label="Valide du" />
      <DateTimeInput source="validUntil" label="Valide jusqu'au" />
    </SimpleForm>
  </Create>
);
