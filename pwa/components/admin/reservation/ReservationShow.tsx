import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, FunctionField, ArrayField, Datagrid } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';
import { status } from "../../../app/lib/reservation";

export const ReservationShow = () => {

    const getStatusLabel = ({statut, report}) => {
        const selectedStatus = status.find(s => s.id === statut);
        return isDefined(selectedStatus) ? selectedStatus.name : report ? status[2].name : status[0].name;
    };

    return (
        <Show>
            <SimpleShowLayout>
                <DateField source="debut" label="Date" sortable={ true } />
                <DateField source="debut" label="Heure" showTime showDate={false} options={{ hour: '2-digit', minute: '2-digit' }}/>
                <TextField source="nom" label="Passager" sortable={ true }/>
                <TextField source="telephone" label="Téléphone" />
                <TextField source="email" label="Adresse email" />
                <FunctionField
                    source="circuit.code"
                    label="Circuit"
                    render={record => <>{record.quantite}<span className="text-xs italic">{'x'}</span> { record.circuit.code }</> }
                    textAlign="right"
                />
                <TextField source="option.nom" label="Option"/>
                <TextField source="cadeau.name" label="Bon cadeau"/>
                <FunctionField
                    label="Pilote"
                    source="pilote.firstName"
                    render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                        record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                    }
                />
                <TextField source="avion.immatriculation" label="Aéronef" sortable={ true }/>
                <TextField source="position" label="Position"/>
                <ArrayField source="contact" label="Contact initial">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                        <TextField source="name" label="Nom"/>
                    </Datagrid>
                </ArrayField>
                <ArrayField source="origine" label="Origine de l'appel">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                        <TextField source="name" label="Nom"/>
                    </Datagrid>
                </ArrayField>
                <TextField source="remarques" label="Remarque(s)" />
                <NumberField source="prix" label="Prix" options={{ style: 'currency', currency: 'EUR' }}/>
                <FunctionField
                    source="statut"
                    label="Statut"
                    render={record =>  getStatusLabel(record) }
                    textAlign="right"
                />
                <TextField source="color" label="Code couleur"/>
                <BooleanField source="paid" label="Prépayé"/>
                <BooleanField source="upsell" label="Upsell"/>
                <BooleanField source="report" label="Report"/>
            </SimpleShowLayout>
        </Show>
    );
}