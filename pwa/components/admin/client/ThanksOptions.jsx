import { TextInput } from "react-admin";
import { RichTextInput } from 'ra-input-rich-text';
import { useWatch } from 'react-hook-form';
import { Typography, Divider } from '@mui/material';

export const ThanksOptions = () => {
  const hasPassengerRegistration = useWatch({ name: 'hasPassengerRegistration', defaultValue: false });

  return !hasPassengerRegistration ? null :
    <>
      <Divider sx={{ mt: 2, borderBottomWidth: 2, borderColor: '#666' }} />
      <Typography variant="h6" gutterBottom>
          Enregistrement des passagers
      </Typography>
        <TextInput source="thanksTitle" label="Titre du formulaire"/>
        <RichTextInput 
          source="thanksMessage" 
          label="Contenu de la page de redirection"
        />
    </>
};