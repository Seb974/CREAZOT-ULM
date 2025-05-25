import { TextInput, BooleanInput } from "react-admin";
import { Box } from "@mui/material";
import { RichTextInput } from 'ra-input-rich-text';
import { useWatch } from 'react-hook-form';
import { Typography, Divider } from '@mui/material';

export const ThanksOptions = () => {
  const hasPassengerRegistration = useWatch({ name: 'hasPassengerRegistration', defaultValue: false });
  const hasEmailConfirmation = useWatch({ name: 'hasEmailConfirmation', defaultValue: false });

  const EmailSubjectInput = () => {
    return !hasEmailConfirmation ? null : 
        <TextInput source="confirmationSubject" label="Objet de l'email"/>
  }

  const EmailContentInput = () => {
    return !hasEmailConfirmation ? null : 
        <RichTextInput 
            source="confirmationMessage" 
            label="Contenu de l'email de confirmation"
            helperText={
                <span className="text-xs italic text-gray-500">
                    Variables utilisables : <span className="text-red-700">{'{{FIRSTNAME}}, {{NAME}}, {{EMAIL}}, {{PHONE}}, {{DATE}}'}</span>.
                </span>
            }
        />
  };

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
            fullWidth
            helperText={
                <span className="text-xs italic text-gray-500">
                    Écrire <span className="text-red-700">{'{{FIRSTNAME}}'}</span> pour utiliser le prénom du formulaire.
                </span>
            }
        />
        
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
            <Box flex={1}>
                <BooleanInput source="hasEmailConfirmation" label="Email de confirmation" sx={{marginTop: '1em'}} fullWidth/>
            </Box>
            <Box flex={1}>
                <EmailSubjectInput/>
            </Box>
        </Box>
        <EmailContentInput/>
    </>
};