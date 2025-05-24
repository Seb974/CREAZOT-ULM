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
        {/* <div className="flex">
            <div className="relative z-20 bg-white dark:bg-form-input mt-2 w-full">   */}
                <RichTextInput 
                source="thanksMessage" 
                label="Contenu de la page de redirection"
                />
                <div className="w-full">
                    <p className="mt-0 pt-0 text-xs text-right bg-gray-50 italic ">
                        Écrire { <span className="text-red-700">{ '{{FIRSTNAME}} ' }</span> } pour utiliser le prénom du formulaire
                    </p>
                </div>
            {/* </div>
        </div> */}
    </>
};