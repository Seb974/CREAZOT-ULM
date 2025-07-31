import { useEffect } from "react";
import { useFormContext, useWatch } from 'react-hook-form';
import { DateInput } from "react-admin";
import { addDays, addYears } from "date-fns";

export const DateExpirationInput = () => {
  const { setValue } = useFormContext();
  const dateAchat = useWatch({ name: "date" });

  useEffect(() => {
    if (!dateAchat) return;

    const dateExp = addDays(addYears(new Date(dateAchat), 1), 1);
    setValue("fin", dateExp);
  }, [dateAchat, setValue]);

  return <DateInput source="fin" label="Date d'expiration" readOnly/>
};
