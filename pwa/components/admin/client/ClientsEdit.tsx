import { TextInput, FileInput, FileField, NumberInput, BooleanInput, SelectInput, SimpleFormIterator, ArrayInput, TabbedForm } from "react-admin";
import { Edit } from "react-admin";
import { timezones, fileInputSX, uploadImages, sanitizeData } from "../../../app/lib/client";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { ColorPreview } from './ColorPreview';
import { ThanksOptions } from './ThanksOptions';

export const ClientsEdit = () => {

  const session = useSession();

  const transform = async data => {
    const sanitizedData = sanitizeData(data);
    const images = await uploadImages(sanitizedData, session);
    // @ts-ignore
    const updatedClient = { ...sanitizedData, ...Object.fromEntries(images.map(img => [img.name, img.path || null])) };

    const cachedClient = sessionStorage.getItem("client");
    if (cachedClient) {
      const parsedClient = JSON.parse(cachedClient);
      if (parsedClient.id === updatedClient.id) {
        sessionStorage.setItem("client", JSON.stringify(updatedClient)); 
      }
    }
    return updatedClient;
  };

  return (
    // @ts-ignore
    <div style={{ overflowX: 'auto', width: '100%'}}>
      <Edit transform={ transform }>
          <TabbedForm  
            syncWithLocation={false} 
            defaultValues={(record) => ({
              ...record,
              hasPassengerRegistration: false,
              hasOptions: false, 
              hasPartners: false,
              hasGifts: false,
              hasReservation: false,
              hasLandingManagement: false,
              hasEmailConfirmation: false,
              airportCodes: record?.airportCodes?.map(code => ({ ...code, meteo: code.meteo ?? false, main: code.main ?? false })) ?? [],
            })}
          >   
              <TabbedForm.Tab label="Informations">
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
                  <TextInput source="website" label="Site web"/>
                  <TextInput source="emailServer" label="Serveur d'email SendGrid"/>
                  <TextInput source="emailAddressSender" label="Adresse email d'envoi"/>
                  <BooleanInput source="active" label="Utilisateur actif" />    
              </TabbedForm.Tab>
              <TabbedForm.Tab label="Dashboard">
                  <ColorPreview/>
                  <SelectInput source="timezone" choices={ timezones }/>   
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                      <Box flex={1}>
                          <NumberInput source="lat" label="Latitude" fullWidth />
                      </Box>
                      <Box flex={1}>
                          <NumberInput source="lng" label="Longitude" fullWidth />
                      </Box>
                  </Box>
                  <NumberInput source="zoom" label="Zoom" min={ 1 } max={ 15 }/>    
                  <ArrayInput source="airportCodes" label="Codes des aéroports">
                      <SimpleFormIterator inline disableReordering>
                          <TextInput source="code"/>
                          <TextInput source="nom"/>
                          <BooleanInput source="meteo" sx={{marginTop: '1em'}}/>
                          <BooleanInput source="main" label="principal" sx={{marginTop: '1em'}}/>
                      </SimpleFormIterator>
                  </ArrayInput>
                  <ArrayInput source="camIds" label="Caméras Windy">
                      <SimpleFormIterator inline disableReordering>
                          <TextInput source="id"/>
                          <TextInput source="nom"/>
                      </SimpleFormIterator>
                  </ArrayInput>
              </TabbedForm.Tab>
              <TabbedForm.Tab label="Images">
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
                  <FileInput label="Image de la page de remerciement" source="thanksImage" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
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
              </TabbedForm.Tab>
              <TabbedForm.Tab label="Options">
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                      <Box flex={1}>
                        <BooleanInput source="hasReservation" label="Réservations" fullWidth/>
                      </Box>
                      <Box flex={1}>
                          <BooleanInput source="hasOptions" label="Options" fullWidth/>
                      </Box>
                  </Box>
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                      <Box flex={1}>
                          <BooleanInput source="hasPartners" label="Partenariat" fullWidth/>
                      </Box>
                      <Box flex={1}>
                          <BooleanInput source="hasGifts" label="Cadeaux" fullWidth/>
                      </Box> 
                  </Box>
                  <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1}>
                            <BooleanInput source="hasOriginContact" label="Origine du contact" fullWidth/>
                        </Box>
                        <Box flex={1}>
                            <BooleanInput source="hasLandingManagement" label="Gestion des atterrissages" fullWidth/>
                        </Box>
                    </Box>
                    <BooleanInput source="hasPassengerRegistration" label="Enregistrement des passagers" fullWidth/>
                  <ThanksOptions/>
              </TabbedForm.Tab>
          </TabbedForm>
      </Edit>
    </div>
  )
};