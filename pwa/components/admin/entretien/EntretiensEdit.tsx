import { ArrayInput, DateInput, Edit, FileInput, SimpleFormIterator, useRecordContext } from "react-admin";
import { ReferenceInput, SimpleForm, TextInput, NumberInput, BooleanInput } from "react-admin";
import { getFormattedValueForBackEnd, isDefined } from "../../../app/lib/utils";
import { Link } from "@mui/material";
import { syncDocuments } from "../../../app/lib/client";
import { useSessionContext } from "../SessionContextProvider";

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

export const EntretiensEdit = () => {

  const { session } = useSessionContext();

  const getDocuments = async (documents) => {   
      const docs = documents.map(document => {
          return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
      });
      return await syncDocuments(docs, session);
  };

  const transform = async data => {
    const documentIds = await getDocuments(data.documents);

    data['documents'] = documentIds;
    data['intervenants'] = data['intervenants'].map(intervenant => getFormattedValueForBackEnd(intervenant));
    data['createdBy'] = getFormattedValueForBackEnd(data['createdBy']);
    data['updatedBy'] = getFormattedValueForBackEnd(data['updatedBy']);
    return data;
  };

  return (
  <Edit transform={transform} redirect="list">
      <SimpleForm>
          <DateInput source="date" label="Date"/>
          <ReferenceInput reference="aeronefs" source="aeronef.@id" label="Aéronef"/>
          <ArrayInput source="intervenants">
              <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="users" source="@id" label="Intervenant"/>
              </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="intervention" label="Détail de l'intervention" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
          <BooleanInput source="changementMoteur" label="Changement du moteur"/>
          <NumberInput source="horametreIntervention" label="Horamètre"/>
          <NumberInput source="horametreNextIntervention" label="Prochaine intervention"/>
          <FileInput source="documents" multiple={ true } label="Documents associés">
              <MyFileField source="contentUrl"/>
          </FileInput>
      </SimpleForm>
  </Edit>
  )
};