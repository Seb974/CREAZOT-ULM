import { CreateGuesser, type CreateGuesserProps } from "@api-platform/admin";

import { BookForm } from "./CircuitForm";

export const BooksCreate = (props: CreateGuesserProps) => (
  <CreateGuesser {...props} title="Create book">
    <BookForm />
  </CreateGuesser>
);
