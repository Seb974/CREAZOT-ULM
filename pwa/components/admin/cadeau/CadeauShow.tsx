import { Show, SimpleShowLayout, TextField, DateField, FunctionField, BooleanField, ArrayField, Datagrid } from 'react-admin';

export const CadeauShow = () => (
    <Show title="Détail du prépaiement">
        <SimpleShowLayout>
            <TextField source="code" label="N° de bon"/>
            <DateField source="date" label="Date d'achat"/>
            <DateField source="fin" label="Date d'expiration"/>
            <TextField source="beneficiaire" label="Bénéficiaire"/>
            <TextField source="offreur" label="Payeur"/>
            <TextField source="email" label="Adresse email"/>
            <TextField source="telephone" label="N° de téléphone"/>
            <FunctionField
                    source="circuit.code"
                    label="Circuit"
                    render={record => <>{record.quantite}x {record.circuit.code}<span className="text-xs italic">{'-'}</span> { record.circuit.nom }</> }
                    textAlign="right"
                />
            <FunctionField
                source="options"
                label="Options"
                render={({option, options}) => <>{option?.nom ?? ''}{options?.nom ?? ''}</> }
            />
            <ArrayField source="origine" label="Origine de l'appel">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                        <TextField source="name" label="Nom"/>
                    </Datagrid>
                </ArrayField>
            <TextField source="message" />
            <TextField source="paymentId" label="N° du paiement"/>
            <BooleanField source="used" label="utilisé"/>
        </SimpleShowLayout>
    </Show>
)