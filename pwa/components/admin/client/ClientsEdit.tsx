import { SimpleForm, TextInput, FileInput, FileField, NumberInput, BooleanInput, SelectInput, SimpleFormIterator, ArrayInput, required } from "react-admin";
import { Edit } from "react-admin";
import { colors, timezones } from "../../../app/lib/client";
import { Box } from "@mui/material";
import { useWatch } from 'react-hook-form';
import { useSession } from "next-auth/react";

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

export const ClientsEdit = () => {

  const session = useSession();

  const images = [
    {name: 'logo', type: 'logo', opacity: null},
    {name: 'favicon', type: 'favicon', opacity: null},
    {name: 'mapIcon', type: 'mapicon', opacity: null},
    {name: 'pdfBackground', type: 'pdfbackground', opacity: null}
  ];

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

  const uploadImages = async (data) => {
    const uploadPromises = images.map(async (image) => {
        const value = data[image.name];
    
        const file = value instanceof File
          ? value
          : value?.rawFile instanceof File
            ? value.rawFile
            : null;
    
        if (file) {
          // Nouveau fichier envoyé
          const opacity = image.type === 'pdfbackground' ? data.opacity : image.opacity;
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', image.type);
          if (opacity !== null && opacity !== undefined) {
            formData.append('opacity', opacity);
          }
    
          try {
            const response = await fetch('/admin/upload/client-asset', {
              method: 'POST',
              body: formData,
              // @ts-ignore
              headers: { Authorization: `Bearer ${session.data.accessToken}` },
            });
    
            const jsonResponse = await response.json();
    
            if (response.ok && jsonResponse.path) {
              return { name: image.name, path: jsonResponse.path };
            } else {
              console.error(`Erreur lors de l'upload de ${image.name} :`, jsonResponse.error || response.statusText);
              return { name: image.name, path: null };
            }
          } catch (error) {
            console.error(`Exception lors de l'upload de ${image.name} :`, error);
            return { name: image.name, path: null };
          }
    
        } else if (typeof value === 'string') {
          // Image déjà existante
          return { name: image.name, path: value };
        } else {
          // Aucun fichier ni path → null
          return { name: image.name, path: null };
        }
    });
  
    return await Promise.all(uploadPromises);
  };
  
  const transform = async data => {
    const images = await uploadImages(data);
    // @ts-ignore
    return {...data, ...Object.fromEntries(images.map(img => [img.name, img.path || null]))};
  };

  return (
    // @ts-ignore
    <Edit transform={ transform }>
        <SimpleForm >
            <TextInput source="name" label="Nom"/>
            <TextInput source="address" label="Adresse"/>
            <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                <Box flex={1} display="flex" alignItems="center">
                    <TextInput source="zipcode" label="Code postal"/>
                </Box>
                <Box flex={2}>
                    <TextInput source="city" label="Ville"/>
                </Box>
            </Box>
            <TextInput source="email" label="Adresse email"/>
            <TextInput source="phone" label="N° de téléphone"/>
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
            <FileInput label="Logo" source="logo" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                       format={(value) => {
                        if (typeof value === 'string') {
                            return [{ src: value, title: value.split('/').pop() }];
                        }
                        return value;
                    }}
            >
                <FileField source="src" title="title" />
            </FileInput> 
            <FileInput label="Icone GPS" source="mapIcon" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                       format={(value) => {
                        if (typeof value === 'string') {
                            return [{ src: value, title: value.split('/').pop() }];
                        }
                        return value;
                    }}
            >
                <FileField source="src" title="title" />
            </FileInput> 
            <FileInput label="Favicon" source="favicon" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                       format={(value) => {
                        if (typeof value === 'string') {
                            return [{ src: value, title: value.split('/').pop() }];
                        }
                        return value;
                    }}
            >
                <FileField source="src" title="title" />
            </FileInput>
            <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                <Box flex={2}>
                    <FileInput label="Arrière plan PDF" source="pdfBackground" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                               format={(value) => {
                                if (typeof value === 'string') {
                                    return [{ src: value, title: value.split('/').pop() }];
                                }
                                return value;
                            }}
                    >
                        <FileField source="src" title="title" />
                    </FileInput>
                </Box>
                <Box flex={1} display="flex" alignItems="center" pt={2}>
                    <NumberInput source="opacity" label="Opacité" min={ 0 } max={ 1 } fullWidth />
                </Box>
            </Box>
            <BooleanInput source="active" label="Utilisateur actif" defaultValue={ true }/>
        </SimpleForm>
    </Edit>
  )
};