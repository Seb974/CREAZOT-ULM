import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  CheckboxGroupInput,
  required,
} from "react-admin";

const MODULE_CHOICES = [
  { id: "hasReservation", name: "Réservations" },
  { id: "hasOptions", name: "Options tarifaires" },
  { id: "hasEmailConfirmation", name: "Confirmation email" },
  { id: "hasGifts", name: "Bons cadeaux" },
  { id: "hasWebshop", name: "Boutique en ligne (Wix)" },
  { id: "hasPartners", name: "Partenaires" },
  { id: "hasPassengerRegistration", name: "Inscription passagers" },
  { id: "hasOriginContact", name: "Origines & Contacts" },
  { id: "hasPaymentManagement", name: "Gestion paiements" },
  { id: "hasExpensesManagement", name: "Gestion dépenses" },
  { id: "hasMicrotrakTag", name: "Tracking GPS (Microtrak)" },
  { id: "hasLandingManagement", name: "Gestion atterrissages" },
  { id: "hasIndividualFlightLogs", name: "Carnets de vol individuels" },
  { id: "hasGroupUpdate", name: "Mise à jour groupée" },
  { id: "hasNotam", name: "NOTAMs / SNOWTAMs" },
];

export const ModulePacksCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Nom" validate={required()} />
      <TextInput source="slug" label="Slug" validate={required()} />
      <TextInput source="description" label="Description" multiline />
      <BooleanInput source="isDefault" label="Pack par défaut" />
      <NumberInput source="sortOrder" label="Ordre d'affichage" defaultValue={0} />
      <CheckboxGroupInput source="modules" label="Modules inclus" choices={MODULE_CHOICES} />
    </SimpleForm>
  </Create>
);
