import { SimpleForm, TextInput, FileInput, FileField, NumberInput, BooleanInput, SelectInput, SimpleFormIterator, ArrayInput, required, useCreate, useRedirect, useNotify } from "react-admin";
import { Create } from "react-admin";
import { colors, timezones } from "../../../app/lib/client";
import { Box } from "@mui/material";
import { useWatch } from 'react-hook-form';

const ColorPreview = () => {
  const selectedColor = useWatch({ name: 'color', defaultValue: colors[0].id });

  return (
      <Box display="flex" alignItems="center" width="100%" gap={2}>
        <Box flexGrow={1}>
          <SelectInput source="color" label="Couleur du header" choices={ colors } defaultValue={ colors[0].id } fullWidth/>
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

export const ClientsCreate = () => {

    const fileInputSX = {
        '& .RaFileInput-dropZone': {
            minHeight: '48px', 
            padding: '8.5px 14px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: 0
        }
    };

    // const onSubmit = async (data) => {

    //     console.log(data);
        // try {
          
        //     await create('reservations', {data: newData});
        //   }
        //   notify('La réservation a bien été enregistrée.', { type: 'info' });
        //   redirect('list', 'reservations');
        // } catch (error) {
        //   notify(`Une erreur bloque l\'enregistrement de la réservation.`, { type: 'error' });
        //   redirect('list', 'reservations');
        //   console.log(error);
        // }
    //   };

    return (
        <Create redirect="list">
            <SimpleForm>
                <TextInput source="name" label="Nom" validate={required()}/>
                <TextInput source="address" label="Adresse" validate={required()}/>

                <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                    <Box flex={1} display="flex" alignItems="center">
                        <TextInput source="zipcode" label="Code postal" validate={required()}/>
                    </Box>
                    <Box flex={2}>
                        <TextInput source="city" label="Ville" validate={required()}/>
                    </Box>
                </Box>


                <TextInput source="email" label="Adresse email" validate={required()}/>
                <TextInput source="phone" label="N° de téléphone" validate={required()}/>
                <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                    <Box flex={1}>
                        <NumberInput source="lat" label="Latitude" fullWidth />
                    </Box>
                    <Box flex={1}>
                        <NumberInput source="lng" label="Longitude" fullWidth />
                    </Box>
                </Box>
                <NumberInput source="zoom" label="Zoom" defaultValue={ 9 } min={ 1 } max={ 15 }/>
                <ArrayInput source="airportCodes" label="Codes des aéroports">
                    <SimpleFormIterator inline disableReordering>
                        <TextInput source="code"/>
                    </SimpleFormIterator>
                </ArrayInput>
                <ArrayInput source="camIds" label="Caméras Windy">
                    <SimpleFormIterator inline disableReordering>
                        <TextInput source="id"/>
                    </SimpleFormIterator>
                </ArrayInput>
                <SelectInput source="timezone" choices={ timezones } defaultValue={ timezones[0].id } validate={required()}/>
                <ColorPreview />
                <FileInput label="Logo" source="logo" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                    <FileField source="src" title="title" />
                </FileInput> 
                <FileInput label="Icone GPS" source="mapIcon" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                    <FileField source="src" title="title" />
                </FileInput> 
                <FileInput label="Favicon" source="favicon" accept={{ 'image/vnd.microsoft.icon': ['.ico'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                    <FileField source="src" title="title" />
                </FileInput>
                <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                    <Box flex={2}>
                        <FileInput label="Arrière plan PDF" source="pdfBackground" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                            <FileField source="src" title="title" />
                        </FileInput>
                    </Box>
                    <Box flex={1} display="flex" alignItems="center" pt={2}>
                        <NumberInput source="opacity" label="Opacité" min={ 0 } max={ 1 } fullWidth />
                    </Box>
                </Box>
                <BooleanInput source="active" label="Utilisateur actif" defaultValue={ true }/>
             </SimpleForm>
        </Create>
    )
};