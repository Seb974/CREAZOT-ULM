import { useFormContext, useWatch } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { NumberInput, useGetList } from 'react-admin';
import { getFormattedValueForBackEnd } from '../../../app/lib/utils';

export const PrixInput = () => {
  const { setValue } = useFormContext();

  const { data: circuits = [], isLoading: circuitsLoading } = useGetList("circuits");
  const { data: combinaisons = [], isLoading: combinaisonsLoading } = useGetList("combinaisons");
  const { data: origines = [], isLoading: originesLoading } = useGetList("origines");

  const quantite = useWatch({ name: "quantite" }) || 1;
  const circuit = useWatch({ name: "circuit" });
  const options = useWatch({ name: "options" });
  const origine = useWatch({ name: "origines" });
  const prixActuel = useWatch({ name: "prix" });

  const [manualOverride, setManualOverride] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (circuitsLoading || combinaisonsLoading || originesLoading) return;

    const selectedCircuit = circuits.find(c => c['@id'] === getFormattedValueForBackEnd(circuit));
    const selectedOptions = combinaisons.find(o => o['@id'] === getFormattedValueForBackEnd(options));
    const selectedOrigines = Array.isArray(origine)
      ? origines.filter(org => origine.find(o => getFormattedValueForBackEnd(o) === org['@id']))
      : [];

    const circuitPrix = selectedCircuit?.prix ?? 0;
    const optionPrix = selectedOptions?.prix ?? 0;
    const maxRemise = selectedOrigines.map(o => o.discount || 0).reduce((a, b) => Math.max(a, b), 0);

    const total = quantite * (circuitPrix * (1 - maxRemise / 100)) + optionPrix;
    const roundedTotal = Math.round(total * 100) / 100;

    if (!initialized.current && prixActuel === undefined) {
      initialized.current = true;
      setValue('prix', roundedTotal);
      return;
    }

    if (!manualOverride)
      setValue('prix', roundedTotal);

  }, [quantite, circuit, options, origine, circuits, combinaisons, origines, circuitsLoading, combinaisonsLoading, originesLoading]);

  const handlePrixChange = (value) => setManualOverride(true);


  return (
    <NumberInput
      source="prix"
      label="Prix total"
      onChange={(e) => handlePrixChange(e.target.value)}
    />
  );
};
