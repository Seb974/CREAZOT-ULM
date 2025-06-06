import { Show, SimpleShowLayout, TextField, NumberField, DateField, FunctionField, ArrayField, Datagrid } from 'react-admin';
import { getShipStyle, isNotBlank } from '../../../app/lib/utils';
import { paymentMode } from '../../../app/lib/client';
import Chip from '@mui/material/Chip';

export const PaymentShow = () => {

    const getChipMode = mode => {
    const modeWithColor = paymentMode.find(p => p.id === mode);
    // @ts-ignore
    return <Chip label={mode.toUpperCase()} size="small" sx={ getShipStyle(modeWithColor) }/>
    };

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="reference" label="Code du paiement"/>
                <DateField source="date" label="Date" sortable={ true } />
                <FunctionField
                    source="name"
                    label="Intitulé"
                    render={({ name, label, reservationCode }) =>  <>{isNotBlank(name) ? name : (isNotBlank(label) ? label : '')}{isNotBlank(reservationCode) ? <span className="text-sm text-gray-500 italic"><br/>{reservationCode}</span> : ''}</> }
                />
                <FunctionField
                    source="amount"
                    label="Total"
                    render={({ details }) => (details.reduce((sum, current) => sum += current.amount, 0)).toFixed(2) + "€" }
                />
                <ArrayField source="details">
                    <Datagrid
                        optimized
                        // expand={<LandingDetails />}
                        bulkActionButtons={false}
                        sx={{
                            '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                            '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                        }}
                    >
                        <FunctionField
                            source="mode"
                            label="Mode de paiement"
                            render={({mode}) => getChipMode(mode)}
                            // render={record => <p>{record.mode.toUpperCase()}</p>}
                        />
                        <FunctionField
                            source="amount"
                            label="Montant (€)"
                            render={({ amount }) => amount.toFixed(2) + "€" }
                        />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    )
}