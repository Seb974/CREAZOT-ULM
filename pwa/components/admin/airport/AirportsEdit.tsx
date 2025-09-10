import { Box, Link } from "@mui/material";
import { BooleanInput, Edit, FileInput, required, useDataProvider, useNotify, useRecordContext, useRedirect } from "react-admin";
import { SimpleForm, TextInput } from "react-admin";
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useSessionContext } from "../SessionContextProvider";
import { syncDocuments } from "../../../app/lib/client";
import { useClient } from "../ClientProvider";

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

export const AirportsEdit = () => {

  const { session } = useSessionContext();
  const dataProvider = useDataProvider();
  const { client, updateClient } = useClient();

  const redirect = useRedirect();
  const notify = useNotify();

  const getDocuments = async (documents) => {   
      const docs = documents.map(document => {
          return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
      });
      return await syncDocuments(docs, session);
  };

  const transform = async ({documents, ...data}) => {
      const documentIds = isDefinedAndNotVoid(documents) ? await getDocuments(documents) : [];
      return {...data, documents: documentIds};
  };

  const handleSubmit = async (airport) => {
      try {
          const formattedData = await transform(airport);

          const isEdit = !!airport['@id'];
          const { data } = isEdit
              //@ts-ignore
              ? await dataProvider.update('airports', { id: airport.id, data: formattedData })
              : await dataProvider.create('airports', { data: formattedData });

          if (!data || !data['@id']) {
              notify(`Erreur inattendue : l'aéroport n'a pas été ${isEdit ? 'mis à jour' : 'créé'}`, { type: 'warning' });
              return;
          }

          if (client) {
              let newAirports = client.airports?.map(a => {
                  if (a['@id'] === data['@id']) return data;
                  if (data.main && a.main) return { ...a, main: false };
                  return a;
              }) || [];

              if (!client.airports?.some(a => a['@id'] === data['@id'])) {
                  newAirports = [...newAirports, data];
              }

              updateClient({ ...client, airports: newAirports });
          }

          notify(`Aéroport ${isEdit ? 'mis à jour' : 'créé'} avec succès`, { type: 'success' });
          redirect('list', 'airports');

      } catch (error) {
          console.error(error);
          notify(`Erreur lors de la ${airport.id ? 'mise à jour' : 'création'}`, { type: 'error' });
      }    
  };

  return (
    <Edit>
        <SimpleForm onSubmit={handleSubmit}>
            <TextInput source="code" label="Code de l'aéroport"/>
            <TextInput source="name" label="Nom"validate={required()}/>
            <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
              <Box flex={1} display="flex" alignItems="center">
                  <BooleanInput source="main" label="Aéroport principal" defaultValue={ false }/>
              </Box>
              <Box flex={1}>
                  <BooleanInput source="meteo" label="Données météo" defaultValue={ false }/>
              </Box>
            </Box>
            <FileInput source="documents" multiple={ true } label="Documents associés">
                <MyFileField source="contentUrl"/>
            </FileInput>
          </SimpleForm>
    </Edit>
  )
};