import { EditGuesser, type EditGuesserProps } from "@api-platform/admin";
import { TopToolbar } from "react-admin";

import { PrestationForm } from "./PrestationForm";
import { ShowButton } from "./ShowButton";

// @ts-ignore
const Actions = () => (
  <TopToolbar>
    <ShowButton />
  </TopToolbar>
);
export const PrestationEdit = () => (
  // @ts-ignore
  <EditGuesser title="Modifier un vol" actions={<Actions />}>
    <PrestationForm />
  </EditGuesser>
);
