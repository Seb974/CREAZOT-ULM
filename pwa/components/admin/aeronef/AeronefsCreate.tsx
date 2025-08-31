import { SimpleForm, TextInput, NumberInput, BooleanInput, required, useRecordContext, FileInput } from "react-admin";
import { Create } from "react-admin";
import { useClient } from '../../admin/ClientProvider';
import { clientWithMicrotrakTags, syncDocuments } from "../../../app/lib/client";
import { Link } from "@mui/material";
import { isDefined } from "../../../app/lib/utils";
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

export const AeronefsCreate = () => {

  const { client } = useClient();
  const { session } = useSessionContext();

  const MicrotrakInput = () => {
    return !clientWithMicrotrakTags(client) ? null : 
      <TextInput source="codeBalise" label="Code Microtrak"/>
  };

  const getDocuments = async (documents) => { 
      const docs = documents.map(document => {
          return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
      });
      return await syncDocuments(docs, session);
  };

  const transform = async ({documents, ...data}) => {
      const documentIds = await getDocuments(documents);
      return {...data, documents: documentIds};
  };

  return (
    <Create transform={ transform } redirect="list">
      <SimpleForm>
        <TextInput source="immatriculation" label="Immatriculation" validate={required()}/>
        <NumberInput source="horametre" label="Horamètre actuel" validate={required()}/>
        <NumberInput source="entretien" label="Prochain entretien" validate={required()}/>
        <NumberInput source="changementMoteur" label="Changement du moteur" />
        <NumberInput source="seuilAlerte" label="Seuil d'alerte (en h) avant entretien" defaultValue={ 10 } validate={required()}/>
        <NumberInput source="seuilAlerteChangementMoteur" label="Seuil d'alerte (en h) avant changement du moteur" defaultValue={ 200 }/>
        <MicrotrakInput/>
        <BooleanInput source="decimal" label="Horamètre décimal"/>
        <FileInput source="documents" multiple={ true } label="Documents associés">
            <MyFileField source="contentUrl"/>
        </FileInput>
        { false && <BooleanInput source="alerteEnvoyee" label="Alerte envoyée" defaultValue={ false } /> }
        { false && <BooleanInput source="alerteMoteurEnvoyee" label="Alerte moteur envoyée" defaultValue={ false } /> }
      </SimpleForm>
    </Create>
  );
};