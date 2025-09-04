import { Show, SimpleShowLayout, TextField } from 'react-admin';

export const CameraShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="code" label="Code de la caméra" sortable={ true }/>
            <TextField source="nom" label="Nom" sortable={ true }/>
        </SimpleShowLayout>
    </Show>
)