import { Create, SimpleForm, TextInput, required } from "react-admin";

const validateIcao = (value: string) => {
    if (!value) return "Code ICAO requis";
    const upper = value.toUpperCase().trim();
    if (!/^[A-Z]{4}$/.test(upper)) return "Un code ICAO doit contenir exactement 4 lettres";
    return undefined;
};

const transformIcao = (data: any) => ({
    ...data,
    icao: data.icao?.toUpperCase().trim(),
});

export const IcaoReferenceCreate = () => (
    <Create title="Ajouter un code ICAO" transform={transformIcao} redirect="list">
        <SimpleForm>
            <TextInput
                source="icao"
                label="Code ICAO (4 lettres)"
                validate={[required(), validateIcao]}
                helperText="Ex : FMEE, LFPG, EGLL"
                inputProps={{ maxLength: 4, style: { textTransform: 'uppercase' } }}
            />
        </SimpleForm>
    </Create>
);
