import { ArrayInput, DateInput, Edit, FileInput, SelectInput, SimpleFormIterator, useRecordContext } from "react-admin";
import { ReferenceInput, SimpleForm, TextInput, NumberInput, BooleanInput } from "react-admin";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { Link } from "@mui/material";
import { clientWithExpensesManagement, syncOdooDocuments } from "../../../app/lib/client";
import { useSessionContext } from "../SessionContextProvider";
import { useClient } from "../ClientProvider";
import { MyFileField } from "../shared/OdooDocumentField";

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

export const EntretiensEdit = () => {

  const { client } = useClient();
  const { session } = useSessionContext();

  const transform = async ({expenses, ...data}) => {
    const documentIds = isDefinedAndNotVoid(data.documents) ? await syncOdooDocuments(data.documents.map(d => d?.['@id'] ? d : {...d, description: d.title}), 'entretien', data.id, session) : [];

    data['documents'] = documentIds;
    data['intervenants'] = data['intervenants'].map(intervenant => getFormattedValueForBackEnd(intervenant));
    data['createdBy'] = getFormattedValueForBackEnd(data['createdBy']);
    data['updatedBy'] = getFormattedValueForBackEnd(data['updatedBy']);
    if (clientWithExpensesManagement(client) && isDefinedAndNotVoid(expenses)) {
      data['expenses'] = expenses.map(expense => getFormattedValueForBackEnd(expense))
    } else {
      data['expenses'] = [];
    }
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
          <ExpensesInput client={ client }/>
          <FileInput source="documents" multiple={ true } label="Documents associés">
              <MyFileField source="contentUrl"/>
          </FileInput>
      </SimpleForm>
  </Edit>
  )
};
