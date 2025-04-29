import { ReferenceInput, SimpleForm, Create, ArrayInput, SimpleFormIterator, useCreate, useRedirect, useNotify } from "react-admin";
import { isDefinedAndNotVoid } from "../../../app/lib/utils";

export const ProfilesCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();

  const onSubmit = async ({ qualifications, ...data }) => {
    try {
      const qualifs = isDefinedAndNotVoid(qualifications) ? qualifications.map(q => q['@id']) : [];
      await create('profil_pilotes', {data: {...data, qualifications: qualifs}});
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
        <ReferenceInput reference="users" source="pilote" label="Pilote" />
        <ArrayInput source="qualifications" label="Qualifications">
          <SimpleFormIterator inline disableReordering>
              <ReferenceInput reference="qualifications" source="@id" label="Qualifications" />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Create>
  );
};