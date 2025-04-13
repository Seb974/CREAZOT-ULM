import { Show, SimpleShowLayout, TextField, DateField, FunctionField, BooleanField, ArrayField, Datagrid } from 'react-admin';

export const CadeauShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="code" label="N° de bon"/>
            <TextField source="beneficiaire" label="Bénéficiaire"/>
            <TextField source="offreur" label="Personne offrante"/>
            <TextField source="email" label="Adresse email de la personne offrante"/>
            <FunctionField
                    source="circuit.code"
                    label="Circuit"
                    render={record => <>{record.circuit.code}<span className="text-xs italic">{'-'}</span> { record.circuit.nom }</> }
                    textAlign="right"
                />
            <TextField source="option.nom" label="Option"/>
            <ArrayField source="origine" label="Origine de l'appel">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                        <TextField source="name" label="Nom"/>
                    </Datagrid>
                </ArrayField>
            <DateField source="fin" label="Date d'expiration"/>
            <TextField source="message" />
            <BooleanField source="used" label="utilisé"/>
        </SimpleShowLayout>
    </Show>
)