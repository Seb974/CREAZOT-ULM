import { ReferenceInput, SimpleForm, TextInput, NumberInput, DateInput, BooleanInput, useDataProvider, ReferenceArrayInput, useRecordContext, FileInput, ArrayInput, SimpleFormIterator, SelectInput } from "react-admin";
import { Create } from "react-admin";
import { useEffect, useState } from "react";
import { useWatch, useFormContext } from 'react-hook-form';
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { Link } from "@mui/material";
import { clientWithExpensesManagement, syncDocuments } from "../../../app/lib/client";
import { useSessionContext } from "../SessionContextProvider";
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

const AeronefWatcher = ({ setSelectedAeronef, setIsChangementMoteur }) => {
  const dataProvider = useDataProvider();
  const { control, setValue } = useFormContext();
  const [aeronefs, setAeronefs] = useState([]);

  const aeronef = useWatch({ control, name: 'aeronef', defaultValue: null });
  const changementMoteur = useWatch({ control, name: 'changementMoteur', defaultValue: false});

  useEffect(() => getAeronefs(), []);
  useEffect(() => setIsChangementMoteur(changementMoteur), [changementMoteur, setIsChangementMoteur]);

  useEffect(() => {
    if (isDefined(aeronef)) {
      const selection = aeronefs.find(a => a['@id'] === (typeof aeronef === 'string' ? aeronef : aeronef['@id']));
      setSelectedAeronef(selection);

      if (selection && selection.id) {
        const nextValue = !changementMoteur ? selection.entretien : selection.changementMoteur;
        setValue('horametreIntervention', selection.horametre);
        setValue('horametreNextIntervention', nextValue ?? '');
      }
      return;
    }
    setSelectedAeronef(aeronef);
  }, [aeronef, changementMoteur, aeronefs, setSelectedAeronef, setValue]);

  const getAeronefs = () => {
    dataProvider
        .getList("aeronefs", {})
        .then(({ data }) => setAeronefs(data));
  };

  return null;
};

const ExpensesInput = ({ client }) => {
  return !clientWithExpensesManagement(client) ? null :
    <ArrayInput source="expenses" label="Dépense(s) associée(s)">
      <SimpleFormIterator disableReordering>
          <ReferenceInput reference="expenses" source="@id" filter={{ relatedToMaintenance: true, 'exists[entretien]': false }}>
              <SelectInput label="Dépense" optionText="name"/>
          </ReferenceInput>
      </SimpleFormIterator>
    </ArrayInput>
};

export const EntretiensCreate = () => {

  const { client } = useClient();
  const { session } = useSessionContext();
  const [selectedAeronef, setSelectedAeronef] = useState(null);
  const [isChangementMoteur, setIsChangementMoteur] = useState(null);

  const getDocuments = async (documents) => {   
      const docs = documents.map(document => {
          return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
      });
      return await syncDocuments(docs, session);
  };

  const transform = async ({expenses, ...data}) => {
      const documentIds = isDefinedAndNotVoid(data.documents) ? await getDocuments(data.documents) : [];
      data['documents'] = documentIds;
      data['intervenants'] = data['intervenants'].map(intervenant => getFormattedValueForBackEnd(intervenant));
      if (clientWithExpensesManagement(client) && isDefinedAndNotVoid(expenses)) {
        data['expenses'] = expenses.map(expense => getFormattedValueForBackEnd(expense))
      } else {
        data['expenses'] = [];
      }
      return data;
  };

  return (
    <Create transform={transform} redirect="list">
      <SimpleForm>
        <DateInput source="date" defaultValue={ new Date() } label="Date"/>
        <ReferenceInput reference="aeronefs" source="aeronef" label="Aéronef" />
        <ReferenceArrayInput source="intervenants" reference="users" />
        <TextInput source="intervention" label="Détail de l'intervention" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <BooleanInput source="changementMoteur" label="Changement du moteur" defaultValue={ false }/>
        <NumberInput source="horametreIntervention" label="Horamètre à l'intervention" defaultValue={ 0 }/>
        <NumberInput key={ isDefined(selectedAeronef) ? selectedAeronef.id : 0 } source="horametreNextIntervention" label="Prochaine intervention" helperText={isDefined(selectedAeronef) && isDefined(selectedAeronef.horametre) ? `Horamètre actuel : ${ selectedAeronef.horametre.toFixed(2) }h` : ''}/>
        <ExpensesInput client={ client }/>
        <FileInput source="documents" multiple={ true } label="Documents associés">
            <MyFileField source="contentUrl"/>
        </FileInput>
        <AeronefWatcher setSelectedAeronef={ setSelectedAeronef } setIsChangementMoteur={ setIsChangementMoteur }/>
      </SimpleForm>
    </Create>
  );
};