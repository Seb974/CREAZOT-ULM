import { useWatch, useFormContext } from 'react-hook-form';
import { TextInput, BooleanInput, required } from 'react-admin';
import { useEffect } from "react";
import { Box } from "@mui/material";

export const PersonsInput = () => {
  const isGift = useWatch({ name: 'gift' });
  const { setValue } = useFormContext();
  const beneficiaire = useWatch({ name: 'beneficiaire' });

  useEffect(() => {
    if (isGift === false && beneficiaire) {
      setValue('offreur', beneficiaire);
    }
  }, [isGift, beneficiaire, setValue]);

  return (
    <>
      <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
        <Box flex={2}>
          <TextInput source="beneficiaire" label={isGift ? 'Nom du bénéficiaire' : 'Nom'} validate={required()}/>
        </Box>
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <BooleanInput source="gift" label="Bon cadeau"/>      
        </Box>
      </Box>
      { isGift &&  <TextInput source="offreur" label="Nom de la personne offrante" validate={required()} /> }
    </>
  );
};
