import { useState, useEffect } from "react";
import { isDefined } from '../../../../../app/lib/utils';
import { useDataProvider } from 'react-admin';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export const SelectBalise = ({ value, onChange, setAeronefs }) => {

    const dataProvider = useDataProvider();

    const [choices, setChoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBalises = async () => {
            try {
                const { data } = await dataProvider.getList('aeronefs', {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'immatriculation', order: 'ASC' },
                });
                const balises = data.map(item => ({
                    ...item,
                    id: item.codeBalise,
                    name: item.immatriculation
                }));
                setAeronefs(data);
                setChoices([{ id: 'all', name: 'Toutes' }, ...balises]);
            } catch (err) {
                setError(err.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };
        fetchBalises();
    }, []);


    return isDefined(error) ? 
        <div>Erreur : {error}</div> : 
        loading ? 
        <div>Chargement...</div> :
        <FormControl 
            fullWidth 
            size="small" 
            sx={{
                backgroundColor: 'white',
                borderRadius: 1,
                minWidth: 120,
                padding: 0,
                margin: 0,
                boxShadow: 'none',
                outline: 'none',
                border: '1px solid #ccc',
                '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                },
                '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    padding: 0,
                    margin: 0,
                },
                '& .MuiInputLabel-root': {
                    margin: 0,
                    padding: 0,
                },
            }}
        >
            <InputLabel
                id="balise-label"
                shrink
                sx={{ marginBottom: '6px', paddingBottom: '12px' }}
            >
                Balises
            </InputLabel>
            <Select
                labelId="balise-label"
                value={value}
                label="Balises"
                onChange={(e) => onChange(e.target.value)}
                sx={{
                    fontSize: '0.85rem',
                    height: '42px', 
                    paddingBottom: '0',
                    paddingTop: '8px'
                }}
            >
                {choices.map(choice => (
                    <MenuItem key={choice.id} value={choice.id}>
                        {choice.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
};
