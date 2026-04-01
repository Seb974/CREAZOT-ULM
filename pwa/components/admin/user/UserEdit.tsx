import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceArrayInput,
  AutocompleteArrayInput,
} from "react-admin";
import { Typography } from "@mui/material";

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="firstName" label="Prénom" disabled />
      <TextInput source="lastName" label="Nom" disabled />
      <TextInput source="email" label="Email" disabled />

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
        Clients rattachés
      </Typography>

      <ReferenceArrayInput source="clients" reference="clients">
        <AutocompleteArrayInput
          optionText="name"
          label="Clients"
          filterToQuery={(q) => ({ name: q })}
          fullWidth
        />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
