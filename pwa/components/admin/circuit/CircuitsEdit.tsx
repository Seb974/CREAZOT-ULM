import { Edit } from "react-admin";
import { DateTimeInput, ReferenceInput, SimpleForm, TextInput, NumberInput, BooleanInput, ArrayInput, SimpleFormIterator } from "react-admin";
import { useClient } from '../../admin/ClientProvider';
import { isDefinedAndNotVoid } from "../../../app/lib/utils";
import { clientWithLandingManagement, clientWithOptions } from "../../../app/lib/client";
import { Box } from "@mui/material";

export const CircuitsEdit = () => {

  const { client } = useClient();

  const OptionsInput = () => {
    return !clientWithOptions(client) ? null :
      <BooleanInput source="avecOptions" label="Options disponibles" defaultValue={ false }/>
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
      <TextInput source="nom"/>
      <TextInput source="code"/>
      <NumberInput source="prix"/>
      <NumberInput source="cout"/>
      <DateTimeInput source="duree" />
      <ReferenceInput reference="natures" source="nature.@id"/>
      <ArrayInput source="qualifications" label="Qualification(s) requise(s) du pilote">
        <SimpleFormIterator inline disableReordering>
          <ReferenceInput reference="qualifications" source="@id" label="Qualifications" />
        </SimpleFormIterator>
      </ArrayInput>
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
              <Box flex={1} display="flex" alignItems="center">
                <BooleanInput source="prixFixe" label="Tarif non lié à la durée" defaultValue={ false } fullWidth/>
              </Box>
              <Box flex={2}>
                <OptionsInput/>
              </Box>
          </Box>
          <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
              <Box flex={1} display="flex" alignItems="center">
                <LandingsInput/>
              </Box>
              <Box flex={2}>
                <AddDefaultLandingInput/>
              </Box>
          </Box>
          <BooleanInput source="needsEncadrant" label="Encadrant requis" defaultValue={ false } fullWidth/>
    </SimpleForm>
  </Edit>
  )
};