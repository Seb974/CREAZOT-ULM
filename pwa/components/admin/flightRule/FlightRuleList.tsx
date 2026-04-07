import { List, Datagrid, TextField, NumberField, FunctionField } from "react-admin";
import { Chip } from "@mui/material";

const NotamStrategyField = (props) => (
    <FunctionField
        {...props}
        render={(record) => {
            const strategy = record?.notamStrategy;
            const map = {
                block: { label: 'Bloquant', color: 'error' },
                warn: { label: 'Avertissement', color: 'warning' },
                ignore: { label: 'Ignoré', color: 'default' },
            };
            const cfg = map[strategy] || map.warn;
            return <Chip label={cfg.label} color={cfg.color as any} size="small" />;
        }}
    />
);

export const FlightRuleList = () => (
    <List title="Règles de vol" sort={{ field: 'id', order: 'ASC' }} perPage={25}>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom du profil" />
            <NumberField source="maxWindKts" label="Vent max (kt)" />
            <NumberField source="maxGustKts" label="Rafales max (kt)" />
            <NumberField source="minVisibilityM" label="Visibilité min (m)" />
            <NumberField source="minCeilingFt" label="Plafond min (ft)" />
            <NotamStrategyField source="notamStrategy" label="NOTAM" />
        </Datagrid>
    </List>
);
