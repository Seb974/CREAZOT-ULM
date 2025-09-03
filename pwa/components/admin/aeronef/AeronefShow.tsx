import { Show, SimpleShowLayout, TextField, NumberField, BooleanField, FunctionField, DateField, FileField } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';

export const AeronefShow = () => {

    const getDecimalTimeFromLocale = timeToFormat => Math.trunc(timeToFormat) + (timeToFormat - Math.trunc(timeToFormat)) / 60 * 100;

    const getRemainingTime = record => record.decimal ? getRemainingDecimalTime(record) : getRemainingLocaleTime(record);

    const getRemainingMotorTime = record => record.decimal ? getRemainingDecimalTime({entretien: record.changementMoteur, horametre: record.horametre, seuilAlerte: record.seuilAlerteChangementMoteur}) : getRemainingMotorLocaleTime(record);

    const getRemainingLocaleTime = ({entretien, horametre, seuilAlerte}) => getRemainingDecimalTime({entretien : getDecimalTimeFromLocale(entretien), horametre: getDecimalTimeFromLocale(horametre), seuilAlerte});

    const getRemainingMotorLocaleTime = ({changementMoteur, horametre, seuilAlerteChangementMoteur}) => getRemainingDecimalTime({entretien : getDecimalTimeFromLocale(changementMoteur), horametre: getDecimalTimeFromLocale(horametre), seuilAlerte: seuilAlerteChangementMoteur});

    const getRemainingDecimalTime = ({entretien, horametre, seuilAlerte}) => {
        const alerte = isDefined(seuilAlerte) ? seuilAlerte : 10;
        const remainingDecimalTime = entretien - horametre;
        const sign = remainingDecimalTime > 0 ? "" : "+ ";
        const intRemainingTime = Math.abs(Math.trunc(remainingDecimalTime));
        const rest = Math.round((Math.abs(remainingDecimalTime) - intRemainingTime) * 60);
        const formattedRest = rest < 10 ? "0" + rest.toFixed(0) : rest.toFixed(0);
        return (
            <p className={`${ (entretien - alerte) - horametre < 0 ? (horametre > entretien ? 'text-red-500' : 'text-orange-500') : 'text-green-500'}`}>
                { sign + intRemainingTime + "h" + formattedRest }
            </p>
        );
    };

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="immatriculation" label="Immatriculation" sortable={ true }/>
                <NumberField source="horametre" options={{ style: 'unit', unit: 'hour' }} label="Horamètre"/>
                <NumberField source="entretien" options={{ style: 'unit', unit: 'hour' }} label="Horamètre"/>
                <FunctionField
                    source="entretien"
                    label="Temps de vol avant le prochain entretien"
                    render={ record => <>{ getRemainingTime(record) }</> }
                />
                <FunctionField
                    source="changementMoteur"
                    label="Temps de vol avant le prochain Changement moteur"
                    render={ record => <>{ getRemainingMotorTime(record) }</> }
                />   
                <NumberField source="seuilAlerte" options={{ style: 'unit', unit: 'hour' }} label="Seuil d'alerte (en h) avant entretien"/>
                <NumberField source="seuilAlerteChangementMoteur" options={{ style: 'unit', unit: 'hour' }} label="Seuil d'alerte (en h) avant changement du moteur"/>
                <TextField source="codeBalise" label="Code Microtrak"/>
                <BooleanField source="decimal" label="Horamètre décimal"/>
                <BooleanField source="isAvailable" label="Disponible"/>
                <FileField source="documents" src="contentUrl" title="description" target="_blank" label="Documents associés"/>
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
            </SimpleShowLayout>
        </Show>
    );
}