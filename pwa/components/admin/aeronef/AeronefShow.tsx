import { Show, SimpleShowLayout, TextField, NumberField, BooleanField, FunctionField } from 'react-admin';
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
            </SimpleShowLayout>
        </Show>
    );
}