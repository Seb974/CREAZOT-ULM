import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, FunctionField, ArrayField, Datagrid } from 'react-admin';
import { clientWithOptions, clientWithGifts, clientWithOriginContact, clientWithPartners } from "../../../app/lib/client";
import { isDefined } from '../../../app/lib/utils';
import { status } from "../../../app/lib/reservation";
import { useClient } from '../../admin/ClientProvider';

export const ReservationShow = () => {

    const { client } = useClient();

    const getStatusLabel = ({statut, report}) => {
        const selectedStatus = status.find(s => s.id === statut);
        return isDefined(selectedStatus) ? selectedStatus.name : report ? status[2].name : status[0].name;
    };

    const OptionField = () => !clientWithOptions(client) ? null : 
        <TextField source="option.nom" label="Option"/>

    const GiftField = () => !clientWithGifts(client) ? null : 
        <TextField source="cadeau.name" label="Bon cadeau"/>

    const OriginContactField = () => !clientWithOriginContact(client) ? null : 
        <ArrayField source="contact" label="Contact initial">
            <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                <TextField source="name" label="Nom"/>
            </Datagrid>
        </ArrayField>

    const PartnersField = () => !clientWithPartners(client) ? null : 
        <ArrayField source="origine" label="Origine de l'appel">
            <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                <TextField source="name" label="Nom"/>
            </Datagrid>
        </ArrayField>

    return (
        <Show>
            <SimpleShowLayout>
                <DateField source="debut" label="Date" sortable={ true } />
                <DateField source="debut" label="Heure" showTime showDate={false} options={{ hour: '2-digit', minute: '2-digit' }}/>
                <TextField source="nom" label="Passager" sortable={ true }/>
                <TextField source="code" label="Code de réservation"/>
                <TextField source="telephone" label="Téléphone" />
                <TextField source="email" label="Adresse email" />
                <FunctionField
                    source="circuit.code"
                    label="Circuit"
                    render={record => <>{record.quantite}<span className="text-xs italic">{'x'}</span> { record.circuit.code }</> }
                    textAlign="right"
                />
                <OptionField/>
                <GiftField/>
                <FunctionField
                    label="Pilote"
                    source="pilote.firstName"
                    render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                        record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                    }
                />
                <TextField source="avion.immatriculation" label="Aéronef" sortable={ true }/>
                <TextField source="position" label="Position"/>
                <OriginContactField/>
                <PartnersField/>
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