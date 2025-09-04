import { SimpleForm, TextInput, required, useRedirect, useNotify, useDataProvider } from "react-admin";
import { Create } from "react-admin";
import { useClient } from "../ClientProvider";

export const CamerasCreate = () => {

    const dataProvider = useDataProvider();
    const { client, updateClient } = useClient();

    const redirect = useRedirect();
    const notify = useNotify();

    const handleSubmit = async (camera) => {
        try {
            const isEdit = !!camera['@id'];
            const { data } = isEdit
                //@ts-ignore
                ? await dataProvider.update('cameras', { id: camera.id, data: camera })
                : await dataProvider.create('cameras', { data: camera });

            if (!data || !data['@id']) {
                notify(`Erreur inattendue : la caméra n'a pas été ${isEdit ? 'mies à jour' : 'créée'}`, { type: 'warning' });
                return;
            }

            if (client) {
                let newCameras = client.cameras?.map(c => c['@id'] === data['@id'] ? data : c) || [];

                if (!client.cameras?.some(a => a['@id'] === data['@id'])) {
                    newCameras = [...newCameras, data];
                }

                updateClient({ ...client, cameras: newCameras });
            }

            notify(`Caméra ${isEdit ? 'mise à jour' : 'créée'} avec succès`, { type: 'success' });
            redirect('list', 'cameras');

        } catch (error) {
            console.error(error);
            notify(`Erreur lors de la ${camera.id ? 'mise à jour' : 'création'}`, { type: 'error' });
        }    
    };

    return (
        <Create>
            <SimpleForm onSubmit={ handleSubmit }>
                <TextInput source="code" label="Code de la caméra" validate={required()}/>
                <TextInput source="nom" label="Nom" validate={required()}/>
            </SimpleForm>
        </Create>
    );
};