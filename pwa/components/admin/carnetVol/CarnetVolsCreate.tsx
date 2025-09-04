import { SimpleForm, TextInput, Create, required, DateInput, ReferenceInput, SelectInput, ArrayInput, SimpleFormIterator, useDataProvider } from "react-admin";
import { useClient } from '../../admin/ClientProvider';
import { decimalToTime, isDefined, isDefinedAndNotVoid, timeToDecimal } from "../../../app/lib/utils";
import { useEffect, useState } from "react";
import { useSessionContext } from "../SessionContextProvider";
import { useFormContext } from "react-hook-form";

export const CarnetVolsCreate = () => {

    const { client } = useClient();
    const dataProvider = useDataProvider();
    const { session } = useSessionContext();
    
    const getMainAirportName = () => {
        const mainAirport = client?.airports?.find(a => a.main);
        return isDefined(mainAirport) ? mainAirport.nom : '';
    };

    const transform = (data) => {
        return { ...data, date: data.date ? new Date(data.date).toISOString() : null };
    };

    const ProfileInput = () => {
        const { setValue } = useFormContext();

        useEffect(() => {
            const fetchProfile = async () => {
                try {
                    const { data } = await dataProvider.getList("profil_pilotes", {});
                    if (!data || !session?.user?.email) return;

                    const currentProfile = data.find(p => p.pilote?.email === session.user.email);
                    if (currentProfile) setValue("profil", currentProfile.id); 
    
                } catch (e) {
                    console.error("Erreur récupération profil :", e);
                }
            };
            fetchProfile();
        }, [setValue]);

        return (
            <ReferenceInput reference="profil_pilotes" source="profil">
                <SelectInput 
                    label="Pilote" 
                    optionText={(choice) => choice?.pilote?.firstName ? choice.pilote.firstName.charAt(0).toUpperCase() + choice.pilote.firstName.slice(1) : '' } 
                    readOnly 
                />
            </ReferenceInput>
        );
    };

    return (
        <Create transform={ transform } redirect="list">
            <SimpleForm>
                <DateInput source="date" label="Date" defaultValue={ new Date() } validate={required()}/>
                <ProfileInput />
                <TextInput source="aeronef" label="Aeronef" validate={required()}/>
                <ReferenceInput reference="natures" source="typeDeVol">
                    <SelectInput label="Nature du vol" validate={required()}/>
                </ReferenceInput>
                <TextInput source="duree" label="Durée du vol" format={ decimalToTime } parse={ timeToDecimal } validate={required()}/>
                <TextInput source="lieuDepart" label="Lieu de départ"  defaultValue={ getMainAirportName() } validate={required()}/>
                <ArrayInput source="lieuxArrivee" label="Lieu(x) d'arrivée" defaultValue={ [getMainAirportName()] }>
                    <SimpleFormIterator inline disableReordering>
                        <TextInput source="" />   
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Create>
    )
};