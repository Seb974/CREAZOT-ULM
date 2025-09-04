import { Show, SimpleShowLayout, TextField, BooleanField, FileField } from 'react-admin';

export const AirportShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="code" label="Code de l'aéroport" sortable={ true }/>
            <TextField source="name" label="Nom" sortable={ true }/>
            <BooleanField source="main" label="Aéroport principal"/>
            <BooleanField source="meteo" label="Données météo"/>
            <FileField source="documents" src="contentUrl" title="description" target="_blank" label="Documents associés"/>
        </SimpleShowLayout>
    </Show>
)