import { ArrayInput, DateInput, Edit, NumberInput, ReferenceInput, SimpleForm, SimpleFormIterator, TextInput, SelectInput, useDataProvider } from "react-admin";
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useClient } from '../../admin/ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";
import { useWatch, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";

const FilteredPiloteInput = ({ pilotes }) => {
  const vols = useWatch({ name: "vols" });
  const { setValue, getValues } = useFormContext();
  
  let needsEncadrant = false;
  let qualificationsRequises = [];
  if (isDefinedAndNotVoid(vols)) {
    vols.forEach(({ circuit }) => {
      qualificationsRequises = [...qualificationsRequises, ...circuit?.qualifications?.map(q => q['@id']) || []];
      needsEncadrant = circuit.needsEncadrant === true ? true : needsEncadrant;
    });
  }

  const pilotesEligibles = qualificationsRequises.length === 0
    ? pilotes
    : pilotes.filter(({profil, ...p}) =>
        Array.isArray(profil.qualifications) &&
        profil.qualifications.map(q => q['@id']).some(q => qualificationsRequises.includes(q))
  );

  useEffect(() => {
    const selectedPiloteId = getValues("pilote.@id");
    const stillEligible = pilotesEligibles.some(p => p['@id'] === selectedPiloteId);
    if (!stillEligible) {
      setValue("pilote.@id", null);
    }
  }, [vols]);
  
  return (
    <SelectInput
      source="pilote.@id"
      label="Pilote @id"
      choices={ pilotesEligibles }
      optionText={(r) => isDefined(r) && isDefined(r.firstName) ? r.firstName.charAt(0).toUpperCase() + r.firstName.slice(1) : ' '}
      optionValue="@id"
    />
  );
};

const EncadrantInput = ({ pilotes }) => {
    const vols = useWatch({ name: "vols" });
    const needsEncadrant = vols.reduce((result, { circuit }) => result = circuit.needsEncadrant === true ? true : result, false);
    const encadrants = pilotes.filter(p => p.encadrant);

    return (
      <SelectInput
        source="encadrant.@id" 
        label="Encadrant @id"
        choices={ encadrants }
        disabled={ !needsEncadrant }
        optionText={(r) => isDefined(r) && isDefined(r.firstName) ? r.firstName.charAt(0).toUpperCase() + r.firstName.slice(1) : ' '}
        optionValue="@id"
      />
    );
};

export const PrestationEdit = () => {

    const { client } = useClient();
    const dataProvider = useDataProvider();
    const [pilotes, setPilotes] = useState([]);

    useEffect(() => getProfilPilotes(), []);

    const getProfilPilotes = () => {
        dataProvider
            .getList("profil_pilotes", {})
            .then(({ data }) => {
              const piloteProfils = data
                .filter(p => isDefined(p.pilote))
                .map(({pilote, ...profil}) => ({
                  ...pilote, 
                  profil: {...profil, qualifications: isDefinedAndNotVoid(profil.qualifications) ? profil.qualifications : []},
                  encadrant: !!profil.qualifications?.find(q => q.encadrant)
                }))
              setPilotes(piloteProfils)
            });
    };

    const transform = ({date, aeronef, pilote, encadrant, vols, ...data}) => {
        const newData = ({
          ...data, 
          date: new Date((new Date(date)).setHours(12, 0, 0)),
          pilote: isDefined(pilote) && isDefined(pilote['@id']) ? pilote['@id'] : null,
          encadrant: isDefined(encadrant) && isDefined(encadrant['@id']) ? encadrant['@id'] : null,
          aeronef: isDefined(aeronef) && isDefined(aeronef['@id']) ? aeronef['@id'] : null,
          vols: vols.map(vol => ({
              ...vol,
              circuit: isDefined(vol.circuit) && isDefined(vol.circuit['@id']) ? vol.circuit['@id'] : null,
              option: clientWithOptions(client) && (isDefined(vol.option) && isDefined(vol.option['@id'])) ? vol.option['@id'] : null,
          }))
        });
        return newData;
    };

    const OptionInput = () => {
      return !clientWithOptions(client) ? null :
        <ReferenceInput reference="options" source="option.@id" label="Option" />
    };

    return (
      // @ts-ignore
      <Edit transform={transform}>  
        <SimpleForm>
            <DateInput source="date" />
            <ReferenceInput reference="aeronefs" source="aeronef.@id" label="Aéronef" />
            <FilteredPiloteInput pilotes={ pilotes }/>
            <EncadrantInput pilotes={ pilotes }/>
            <ArrayInput source="vols">
                <SimpleFormIterator inline disableReordering>
                    <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit" />
                    <OptionInput/>
                    <NumberInput source="quantite" />
                </SimpleFormIterator>
            </ArrayInput>
            <NumberInput source="horametreDepart" />
            <NumberInput source="duree" />
            <NumberInput source="horametreFin" />
            <TextInput source="remarques" />
        </SimpleForm>
      </Edit>
    );
};
