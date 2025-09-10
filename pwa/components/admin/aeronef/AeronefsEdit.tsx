import { Edit, SimpleForm, TextInput, NumberInput, BooleanInput, useRecordContext, FileInput } from "react-admin";
import { useClient } from "../ClientProvider";
import { Box } from '@mui/material';
import { clientWithMicrotrakTags, syncDocuments } from "../../../app/lib/client";
import { Link } from "@mui/material";
import { useSessionContext } from "../SessionContextProvider";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";

const MyFileField = ({ source }) => {
  const record = useRecordContext();
  if (!record) return null;

  const url = record[source];
  const label = record.description || record.title || record.path || "Sans nom";

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" underline="always"
      sx={{ color: "primary.main", fontSize: "0.85rem" }}
    >
      {label}
    </Link>
  );
};

export const AeronefsEdit = () => {

  const { client } = useClient();
  const { session } = useSessionContext();

  const getDocuments = async (documents) => {   
      const docs = documents.map(document => {
          return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
      });
      return await syncDocuments(docs, session);
  };
  
  const MicrotrakInput = () => {
    return !clientWithMicrotrakTags(client) ? null : 
      <TextInput source="codeBalise" label="Code Microtrak"/>
  };

  const transform = async ({documents, createdBy, updatedBy, ...data}) => {
      const documentIds = isDefinedAndNotVoid(documents) ? await getDocuments(documents) : [];
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