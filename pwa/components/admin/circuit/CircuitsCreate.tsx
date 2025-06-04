import { DateTimeInput, ReferenceInput, SimpleForm, TextInput, NumberInput, BooleanInput, ArrayInput, SimpleFormIterator } from "react-admin";
import { Create } from "react-admin";
import { useWatch } from "react-hook-form";
import { useClient } from '../../admin/ClientProvider';
import { clientWithLandingManagement, clientWithOptions } from "../../../app/lib/client";
import { Box } from "@mui/material";

export const CircuitsCreate = () => {

  const { client } = useClient();

  const DurationInput = () => {
      const prixFixe = useWatch<{ prixFixe: string }>({ name: "prixFixe" });
      return <DateTimeInput source="duree" defaultValue={ new Date((new Date()).setHours(1,0,0)) } readOnly={ !prixFixe } />
  };

  const OptionsInput = () => {
    return !clientWithOptions(client) ? null :
      <BooleanInput source="avecOptions" label="Options disponibles" defaultValue={ false } fullWidth/>
  };

  const LandingsInput = () => {
    return !clientWithLandingManagement(client) ? null : 
      <BooleanInput source="requireLandingDeclaration" label="Déclaration atterrissages" defaultValue={ false } fullWidth/>
  };

  const AddDefaultLandingInput = () => {
    return !clientWithLandingManagement(client) ? null : 
      <BooleanInput source="hadDefaultLanding" label="Ajouter un attérrissage par défaut" defaultValue={ false } fullWidth/>
  };

  return (
      <Create>
        <SimpleForm>
          <TextInput source="nom"/>
          <TextInput source="code"/>
          <NumberInput source="prix"/>
          <NumberInput source="cout"/>
          <DurationInput />
          <ReferenceInput reference="natures" source="nature" />
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
      </Create>
  )
};