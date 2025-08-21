import { Edit, SelectInput } from "react-admin";
import { DateTimeInput, ReferenceInput, SimpleForm, TextInput, NumberInput, BooleanInput, ArrayInput, SimpleFormIterator, required } from "react-admin";
import { useClient } from '../../admin/ClientProvider';
import { isDefinedAndNotVoid } from "../../../app/lib/utils";
import { clientWithLandingManagement, clientWithOptions, clientWithWebshop } from "../../../app/lib/client";
import { Box } from "@mui/material";

export const CircuitsEdit = () => {

  const { client } = useClient();

  const OptionsInput = () => {
    return !clientWithOptions(client) ? null :
      <BooleanInput source="avecOptions" label="Options disponibles" defaultValue={ false }/>
  };

  const IdsInput = () => {
      return !clientWithWebshop(client) ? 
        <TextInput source="code" label="Code interne" fullWidth validate={required()}/> :
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
          <Box flex={1}>
              <TextInput source="code" label="Code interne" fullWidth validate={required()}/>
          </Box>
          <Box flex={1}>
              <TextInput source="webshopId" label="code e-commerce" fullWidth/>
          </Box>
        </Box>
    };

  const LandingsInput = () => {
      return !clientWithLandingManagement(client) ? null : 
        <BooleanInput source="requireLandingDeclaration" label="Déclaration atterrissages" defaultValue={ false }/>
  };

  const AddDefaultLandingInput = () => {
    return !clientWithLandingManagement(client) ? null : 
      <BooleanInput source="hadDefaultLanding" label="Ajouter un attérrissage par défaut" defaultValue={ false } fullWidth/>
  };

  const transform = data => {
    data['nature'] = data['nature']['@id'];
    data['qualifications'] = isDefinedAndNotVoid(data['qualifications']) ? data['qualifications'].map(qualification => qualification['@id']) : [];
    data['avecOptions'] = clientWithOptions(client) ? data['avecOptions'] : false;
    return data;
  };

  return (
  <Edit transform={transform}>
    <SimpleForm>
      <TextInput source="nom" validate={required()}/>
      <IdsInput />
      <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
          <Box flex={1} display="flex" alignItems="center">
              <BooleanInput source="prixFixe" label="Prix fixe" defaultValue={ false } fullWidth helperText="Facturation à la minute si non coché"/>
          </Box>
          <Box flex={2}>
              <DateTimeInput source="duree" validate={required()}/>
          </Box>
      </Box>
      <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
        <Box flex={1}>
            <NumberInput source="prix" defaultValue={ 0 } validate={required()}/>
        </Box>
        <Box flex={1}>
            <NumberInput source="cout" defaultValue={ 0 } validate={required()}/>
        </Box>
      </Box>  
      <ReferenceInput reference="natures" source="nature.@id">
        <SelectInput label="Nature du circuit" validate={required()}/>
      </ReferenceInput>
      <ArrayInput source="qualifications" label="Qualification(s) requise(s) du pilote">
        <SimpleFormIterator inline disableReordering>
          <ReferenceInput reference="qualifications" source="@id" label="Qualifications" />
        </SimpleFormIterator>
      </ArrayInput>
      <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
          <Box flex={1} display="flex" alignItems="center">
            <OptionsInput/>
          </Box>
          <Box flex={1}>
            <BooleanInput source="needsEncadrant" label="Encadrant requis" defaultValue={ false } fullWidth/>
          </Box>
      </Box>
      <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
          <Box flex={1} display="flex" alignItems="center">
            <LandingsInput/>
          </Box>
          <Box flex={1}>
            <AddDefaultLandingInput/>
          </Box>
      </Box>
    </SimpleForm>
  </Edit>
  )
};