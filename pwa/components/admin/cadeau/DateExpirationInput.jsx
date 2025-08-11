import { useEffect } from "react";
import { useFormContext, useWatch } from 'react-hook-form';
import { DateInput } from "react-admin";

export const DateExpirationInput = () => {
  const { setValue } = useFormContext();
  const dateAchat = useWatch({ name: "date" });

  useEffect(() => {
    if (!dateAchat) return;

    const dateObj = new Date(dateAchat);
    // Ajoute 1 an
    dateObj.setFullYear(dateObj.getFullYear() + 1);
    // Ajoute 1 jour
    dateObj.setDate(dateObj.getDate() + 1);

    setValue("fin", dateObj);
  }, [dateAchat, setValue]);

  return <DateInput source="fin" label="Date d'expiration" readOnly />
};

