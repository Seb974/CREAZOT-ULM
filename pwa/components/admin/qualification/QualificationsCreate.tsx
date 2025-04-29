import { TextInput, BooleanInput, SelectInput, SimpleForm, Create } from "react-admin";
import { Box } from "@mui/material";
import { useWatch } from 'react-hook-form';
import { colors } from '../../../app/lib/colors';

const ColorPreview = () => {
  const selectedColor = useWatch({ name: 'color', defaultValue: '#9ca3af' });

  return (
      <Box display="flex" alignItems="center" width="100%" gap={2}>
        <Box flexGrow={1}>
          <SelectInput source="color" label="Couleur associée" choices={ colors } defaultValue={ '#9ca3af' } fullWidth/>
        </Box>
        <Box
          width={48}
          height={48}
          borderRadius={1}
          border="1px solid #ccc"
          style={{ backgroundColor: selectedColor, marginBottom: '1.2rem' }}
        />
      </Box>
  );
};

export const QualificationsCreate = () => {

  return (
    <Create redirect="list">
      <SimpleForm>
        <TextInput source="nom" label="Qualification"/>
        <TextInput source="slug" label="Alias"/>
        <ColorPreview />
        <BooleanInput source="encadrant" label="Qualification d'encadrant" defaultValue={ false }/>
      </SimpleForm>
    </Create>
  );
};