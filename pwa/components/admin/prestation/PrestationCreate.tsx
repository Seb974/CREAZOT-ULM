import { CreateGuesser, type CreateGuesserProps } from "@api-platform/admin";

import { PrestationForm } from "./PrestationForm";
import { Create } from 'react-admin';

export const PrestationCreate = (props: CreateGuesserProps) => (
  <Create title="Vols">
    <PrestationForm />
  </Create>
);
