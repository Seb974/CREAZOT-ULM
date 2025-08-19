import { ReferenceInput, SimpleForm, Create, ArrayInput, SimpleFormIterator, useCreate, useRedirect, useNotify, DateInput, BooleanInput, required, SelectInput } from "react-admin";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";

export const ProfilesCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();

  const onSubmit = async ({ pilotQualifications, ...data }) => {
    try {
      const newProfile = {
          ...data,
          pilote: getFormattedValueForBackEnd(data.pilote),
          pilotQualifications: !isDefinedAndNotVoid(pilotQualifications) ? [] : 
              pilotQualifications.map(q => ({
                  ...q, 
                  qualification: getFormattedValueForBackEnd(q.qualification),
                  dateObtention: new Date(q.dateObtention).toISOString().split('T')[0],
                  validUntil: isDefined(q.validUntil) ? new Date(q.validUntil).toISOString().split('T')[0] : null
              }))
      };
      await create('profil_pilotes', {data: newProfile});
      notify('Le profil du pilote a bien été enregistré.', { type: 'info' });
      redirect('list', 'profil_pilotes');
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement du profil du pilote.`, { type: 'error' });
      redirect('list', 'profil_pilotes');
      console.log(error);
    }
  };

  return (
    <Create redirect="list">
      <SimpleForm onSubmit={onSubmit}>
        <ReferenceInput reference="users" source="pilote" >
           <SelectInput label="Pilote" validate={required()}/>
        </ReferenceInput>
        <ArrayInput source="pilotQualifications" label="Qualifications">
          <SimpleFormIterator inline disableReordering>
              <ReferenceInput reference="qualifications" source="qualification">
                  <SelectInput label="Qualification" validate={required()}/>
              </ReferenceInput>
              <DateInput source="dateObtention" label="Date d'obtention" defaultValue={ new Date() } validate={required()}/>
              <DateInput source="validUntil" label="Date de fin de validité" helperText="Laisser vide si pas de fin de validité"/>
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Create>
  );
};