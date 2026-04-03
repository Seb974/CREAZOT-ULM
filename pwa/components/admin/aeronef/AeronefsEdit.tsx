import { Edit, SimpleForm, TextInput, NumberInput, BooleanInput, useRecordContext, FileInput } from "react-admin";
import { useClient } from "../ClientProvider";
import { Box } from '@mui/material';
import { clientWithMicrotrakTags, syncOdooDocuments } from "../../../app/lib/client";
import { Link } from "@mui/material";
import { useSessionContext } from "../SessionContextProvider";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { MyFileField } from "../shared/OdooDocumentField";

export const AeronefsEdit = () => {

  const { client } = useClient();
  const { session } = useSessionContext();

  const MicrotrakInput = () => {
    return !clientWithMicrotrakTags(client) ? null : 
      <TextInput source="codeBalise" label="Code Microtrak"/>
  };

  const transform = async ({documents, createdBy, updatedBy, ...data}) => {
      const documentIds = isDefinedAndNotVoid(documents) ? await syncOdooDocuments(documents.map(d => d?.['@id'] ? d : {...d, description: d.title}), 'aeronef', data.id, session) : [];
      return {
        ...data, 
        documents: documentIds,
        createdBy: getFormattedValueForBackEnd(createdBy),
        updatedBy: getFormattedValueForBackEnd(updatedBy),
      };
  };

  return (
    <Edit transform={ transform } redirect="list">
        <SimpleForm>
          <TextInput source="immatriculation" label="Immatriculation"/>
          <NumberInput source="horametre" label="Horamètre actuel"/>
          <NumberInput source="entretien" label="Prochain entretien"/>
          <NumberInput source="changementMoteur" label="Changement du moteur" />
          <NumberInput source="seuilAlerte" label="Seuil d'alerte (en h) avant entretien"/>
          <NumberInput source="seuilAlerteChangementMoteur" label="Seuil d'alerte (en h) avant changement du moteur"/>
          <MicrotrakInput/>
          <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
              <Box flex={1} display="flex" alignItems="center">
                  <BooleanInput source="decimal" label="Horamètre décimal" defaultValue={ false }/>
              </Box>
              <Box flex={1}>
                  <BooleanInput source="isAvailable" label="Disponible" defaultValue={ false }/>
              </Box>
          </Box>
          <FileInput source="documents" multiple={ true } label="Documents associés">
              <MyFileField source="contentUrl"/>
          </FileInput>
        </SimpleForm>
    </Edit>
  )
};
