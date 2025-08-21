import { Show, FunctionField, ArrayField, Datagrid, DateField, TabbedShowLayout, TextField, NumberField } from 'react-admin';
import { getShipStyle, isDefined } from '../../../app/lib/utils';
import { certificatMedicalTypes } from '../../../app/lib/client';
import Chip from '@mui/material/Chip';

export const ProfileShow = () => {

    const getTypeName = code => {
        const type = certificatMedicalTypes.find(t => t.id === code);
        return type?.name ?? code;
    };

    return (
        <Show>
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Général">
                    <FunctionField
                        label="Prénom"
                        source="pilote.firstName"
                        render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                            record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                        }
                    />
                    <TextField source="pilote.email" label="Adresse email"/>
                    <DateField source="birthDate" label="Date de naissance"/>
                    <ArrayField source="pilotQualifications" label="Qualifications">
                        <Datagrid
                            optimized
                            bulkActionButtons={false}
                            sx={{
                                '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                                '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                            }}
                        >
                            <FunctionField
                                label="Qualification"
                                render={({qualification, validUntil}) => <Chip label={qualification.slug} size="small" sx={ getShipStyle(qualification, validUntil) }/>}
                            />
                            <DateField source="dateObtention" label="Obtention"/>
                            <FunctionField
                                label="Validité"
                                render={({validUntil}) => isDefined(validUntil) ? (new Date(validUntil)).toLocaleDateString() : 'Sans limite'}
                            />
                        </Datagrid>
                    </ArrayField>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Médical">
                    <FunctionField label="Type" render={({certificatMedical}) => getTypeName(certificatMedical?.type)}/>
                    <DateField source="certificatMedical.dateObtention" label="Date d'obtention"/>
                    <NumberField source="certificatMedical.validityDurationMonths" label="Nombre de mois de validité"/>
                    <DateField source="certificatMedical.validUntil" label="Date de fin de validité"/>
                    <TextField source="certificatMedical.medecin" label="Nom du Médecin"/>
                    <TextField source="certificatMedical.remarques" label="Remarques"/>
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </Show>
    )
}