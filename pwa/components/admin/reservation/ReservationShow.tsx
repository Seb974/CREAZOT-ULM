import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, FunctionField } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';

export const ReservationShow = () => {

    const status = [
        {id: "VALIDATED", name: "Validé"},
        {id: "WAITING", name: "En attente de confirmation"},
        {id: "WHEATER_CANCEL", name:"Annulation météo"},
        {id: "PASSENGER_CANCEL", name: "Annulation client"},
        {id: "INTERN_CANCEL", name: "Annulation interne"}
    ];

    const getStatusLabel = ({statut}) => {
        const selectedStatus = status.find(s => s.id === statut);
        return isDefined(selectedStatus) ? selectedStatus.name : status[0].name;
    };

    return (
        <Show>
            <SimpleShowLayout>
                <DateField source="debut" label="Date" sortable={ true } />
                <DateField source="debut" label="Heure" showTime showDate={false}/>
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
                <TextField source="pilote.firstName" label="Pilote" sortable={ true }/>
                <TextField source="avion.immatriculation" label="Aéronef" sortable={ true }/>
                <TextField source="remarques" label="Remarque(s)" />
                <NumberField source="prix" label="Prix" options={{ style: 'currency', currency: 'EUR' }}/>
                <FunctionField
                    source="statut"
                    label="Statut"
                    render={record =>  getStatusLabel(record) }
                    textAlign="right"
                />
                <TextField source="color" label="Code couleur"/>
                <BooleanField source="report" label="Report"/>
            </SimpleShowLayout>
        </Show>
    );
}