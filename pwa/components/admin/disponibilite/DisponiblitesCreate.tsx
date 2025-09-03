import { useCallback, useEffect, useState } from "react";
import { SimpleForm, TextInput, Create, required, DateInput, ReferenceInput, SelectInput, useDataProvider } from "react-admin";
import { useWatch } from "react-hook-form";
import { getFormattedEndDate, getFormattedStartDate, getFormattedValueForBackEnd, isDefined } from "../../../app/lib/utils";

const StartInput = () => {

    const dataProvider = useDataProvider();
    const [profils, setProfils] = useState([]);
    const [label, setLabel] = useState('Du');

    const profilId = useWatch({ name: "pilote" });

    const getProfils = useCallback(() => {
        dataProvider
            .getList('profil_pilotes', {})
            .then(({ data }) => setProfils(data));
    }, [dataProvider, setProfils]);

    const getPilotAvailabilityType = profilId => {
        if (!isDefined(profilId)) return 'Du';
        
        const selection = profils.find(p => p?.['@id'] === profilId);
        return selection?.availableByDefault ? 'Indisponible du' : 'Disponible du';
    };

    useEffect(() => getProfils(), []);

    useEffect(() => {
        const newLabel = getPilotAvailabilityType(profilId);
        setLabel(newLabel);
    }, [profilId]);

    return <DateInput source="debut" label={ label } defaultValue={ new Date() } validate={required()}/>

};

export const DisponiblitesCreate = () => {

    const transform = ({pilote, debut, fin, ...data}) => {
        return {
            ...data, 
            debut: getFormattedStartDate(debut),
            fin: getFormattedEndDate(fin),
            pilote: getFormattedValueForBackEnd(pilote)
        };
    };

    return (
        <Create transform={ transform } redirect="list">
            <SimpleForm>
                <ReferenceInput reference="profil_pilotes" source="pilote" >
                    <SelectInput label="Pilote" optionText="pilote.firstName" validate={required()} />
                </ReferenceInput>
                <StartInput/>
                <DateInput source="fin" label="Au" defaultValue={ new Date() } validate={required()}/>
                <TextInput source="motif" label="Motif"/>
            </SimpleForm>
        </Create>
    );
};