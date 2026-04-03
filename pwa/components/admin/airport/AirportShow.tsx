import { Show, SimpleShowLayout, TextField, BooleanField, FileField } from 'react-admin';
import { DocumentListField } from "../shared/OdooDocumentField";

export const AirportShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="code" label="Code de l'aéroport" sortable={ true }/>
            <TextField source="name" label="Nom" sortable={ true }/>
            <BooleanField source="main" label="Aéroport principal"/>
            <BooleanField source="meteo" label="Données météo"/>
            <DocumentListField source="documents" label="Documents associés"/>
        </SimpleShowLayout>
    </Show>
)