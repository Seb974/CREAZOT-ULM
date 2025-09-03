import { Show, FunctionField, ArrayField, Datagrid, DateField, TabbedShowLayout, TextField, NumberField, FileField, BooleanField } from 'react-admin';
import { decimalToTimeFormatted, getShipStyle, isDefined } from '../../../app/lib/utils';
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
                    <FunctionField
                        label="Total des heures de vol"
                        render={record => isDefined(record?.totalFlightHours) ? decimalToTimeFormatted(record.totalFlightHours) : "00:00"}
                        textAlign="center"
                    />
                    <BooleanField source="availableByDefault" label="Disponible par défaut"/>
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
                            <FileField source="document.contentUrl" title="document.description" target="_blank" label="Document"/>
                        </Datagrid>
                    </ArrayField>
                    <FileField source="documents" src="contentUrl" title="description" target="_blank" label="Autres documents"/>
                    <DateField source="createdAt" label="Créé le" showTime/>
                    <FunctionField
                        label="Créé par"
                        source="createdBy.firstName"
                        render={(record) => isDefined(record?.createdBy) && isDefined(record?.createdBy?.firstName) ?
                            record?.createdBy?.firstName?.charAt(0).toUpperCase() + record?.createdBy?.firstName?.slice(1) : ''
                        }
                    />
                    <DateField source="updatedAt" label="Modifié le" showTime/>
                    <FunctionField
                        label="Modifié par"
                        source="updatedBy.firstName"
                        render={(record) => isDefined(record?.updatedBy) && isDefined(record?.updatedBy?.firstName) ?
                            record?.updatedBy?.firstName?.charAt(0).toUpperCase() + record?.updatedBy?.firstName?.slice(1) : ''
                        }
                    />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Médical">
                    <FunctionField label="Type" render={({certificatMedical}) => getTypeName(certificatMedical?.type)}/>
                    <DateField source="certificatMedical.dateObtention" label="Date d'obtention"/>
                    <NumberField source="certificatMedical.validityDurationMonths" label="Nombre de mois de validité"/>
                    <DateField source="certificatMedical.validUntil" label="Date de fin de validité"/>
                    <TextField source="certificatMedical.medecin" label="Nom du Médecin"/>
                    <TextField source="certificatMedical.remarques" label="Remarques"/>
                    <FileField source="certificatMedical.document.contentUrl" title="certificatMedical.document.description" target="_blank" label="Document"/>
                    <DateField source="certificatMedical.createdAt" label="Créé le" showTime/>
                    <FunctionField
                        label="Créé par"
                        source="certificatMedical.createdBy.firstName"
                        render={(record) => isDefined(record?.certificatMedical) && isDefined(record?.certificatMedical?.createdBy) && isDefined(record?.certificatMedical?.createdBy?.firstName) ?
                            record?.certificatMedical?.createdBy?.firstName?.charAt(0).toUpperCase() + record?.certificatMedical?.createdBy?.firstName?.slice(1) : ''
                        }
                    />
                    <DateField source="certificatMedical.updatedAt" label="Modifié le" showTime/>
                    <FunctionField
                        label="Modifié par"
                        source="ucertificatMedical.pdatedBy.firstName"
                        render={(record) => isDefined(record?.certificatMedical) && isDefined(record?.certificatMedical?.updatedBy) && isDefined(record?.certificatMedical?.updatedBy?.firstName) ?
                            record?.certificatMedical?.updatedBy?.firstName?.charAt(0).toUpperCase() + record?.certificatMedical?.updatedBy?.firstName?.slice(1) : ''
                        }
                    />
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </Show>
    )
}