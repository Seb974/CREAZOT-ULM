import { Show, SimpleShowLayout, TextField, NumberField, DateField, FunctionField, ArrayField, Datagrid, FileField, BooleanField } from 'react-admin';
import { getShipStyle, isDefined, isNotBlank } from '../../../app/lib/utils';
import { paymentMode } from '../../../app/lib/client';
import Chip from '@mui/material/Chip';

export const ExpenseShow = () => {

    const getChipMode = mode => {
    const modeWithColor = paymentMode.find(p => p.id === mode);
    // @ts-ignore
    return <Chip label={mode.toUpperCase()} size="small" sx={ getShipStyle(modeWithColor) }/>
    };

    return (
        <Show>
            <SimpleShowLayout>
                <DateField source="date" label="Date" sortable={ true } />
                <FunctionField
                    source="beneficiaire"
                    label="Bénéficiaire"
                    render={record => record?.beneficiaire ?? '' }
                />
                <TextField source="libelle" label="Libellé"/>
                <ArrayField source="details">
                    <Datagrid
                        optimized
                        bulkActionButtons={false}
                        sx={{
                            '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                            '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                        }}
                    >
                        <FunctionField
                            source="mode"
                            label="Mode de paiement"
                            render={({mode}) => isDefined(mode) ? getChipMode(mode) : ''}
                        />
                        <FunctionField
                            source="amount"
                            label="Montant (€)"
                            render={({ amount }) => amount.toFixed(2) + "€" }
                        />
                    </Datagrid>
                </ArrayField>
                <FunctionField
                    source="totalTTC"
                    label="Total TTC"
                    render={({ totalTTC, details }) => isDefined(totalTTC) ? totalTTC.toFixed(2) + " €" : '' }
                />
                <FunctionField
                    source="tva"
                    label="TVA appliquée"
                    render={({ tva }) => isDefined(tva) ? (tva * 100).toFixed(2) + ' %' : '' }
                />
                <FunctionField
                    source="totalHT"
                    label="Total HT"
                    render={({ totalHT }) => isDefined(totalHT) ? totalHT.toFixed(2) + ' €' : '' }
                />
                <FileField source="document.contentUrl" title="document.description" target="_blank" label="Justificatif"/>
                <BooleanField source="relatedToMaintenance" label="Associé à un entretien"/>
            </SimpleShowLayout>
        </Show>
    )
}