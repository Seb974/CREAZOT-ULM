import { SimpleForm, TextInput, NumberInput, SelectInput, required, SaveButton, Toolbar } from "react-admin";
import { Box, Typography, Divider, Alert } from "@mui/material";

const FlightRuleToolbar = () => (
    <Toolbar>
        <SaveButton label="Enregistrer" />
    </Toolbar>
);

const SectionTitle = ({ title }: { title: string }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1, color: '#1565c0' }}>
        {title}
    </Typography>
);

const ThresholdRow = ({ limiteSource, limiteLabel, nogoSource, nogoLabel, unit }) => (
    <Box display="flex" gap={2} flexWrap="wrap" width="100%" mb={1}>
        <Box flex={1} minWidth={200}>
            <NumberInput source={limiteSource} label={`${limiteLabel} (${unit})`} validate={required()} fullWidth
                helperText="Seuil SELON EXPÉRIENCE (jaune)" />
        </Box>
        <Box flex={1} minWidth={200}>
            <NumberInput source={nogoSource} label={`${nogoLabel} (${unit})`} validate={required()} fullWidth
                helperText="Seuil NO GO (rouge)" />
        </Box>
    </Box>
);

export const FlightRuleForm = ({ onSubmit }: { onSubmit?: any }) => (
    <SimpleForm toolbar={<FlightRuleToolbar />} onSubmit={onSubmit}>
        <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
            Définissez les seuils météorologiques pour votre club. Deux niveaux :
            <strong> SELON EXPÉRIENCE</strong> (jaune) et <strong>NO GO</strong> (rouge).
            En dessous du seuil jaune = <strong>GO</strong> (vert).
        </Alert>

        <TextInput source="name" label="Nom du profil de règles" validate={required()} fullWidth
            helperText="Ex: Règles standard club, Règles élèves, etc." />

        <Divider sx={{ width: '100%', my: 2 }} />
        <SectionTitle title="Vent" />
        <ThresholdRow
            limiteSource="limiteWindKts" limiteLabel="Vent LIMITE"
            nogoSource="maxWindKts" nogoLabel="Vent NO GO"
            unit="kt"
        />
        <ThresholdRow
            limiteSource="limiteGustKts" limiteLabel="Rafales LIMITE"
            nogoSource="maxGustKts" nogoLabel="Rafales NO GO"
            unit="kt"
        />
        <ThresholdRow
            limiteSource="limiteCrosswindKts" limiteLabel="Traversier LIMITE"
            nogoSource="maxCrosswindKts" nogoLabel="Traversier NO GO"
            unit="kt"
        />

        <Divider sx={{ width: '100%', my: 2 }} />
        <SectionTitle title="Visibilité" />
        <ThresholdRow
            limiteSource="limiteVisibilityM" limiteLabel="Visibilité LIMITE"
            nogoSource="minVisibilityM" nogoLabel="Visibilité NO GO"
            unit="m"
        />

        <Divider sx={{ width: '100%', my: 2 }} />
        <SectionTitle title="Plafond nuageux" />
        <ThresholdRow
            limiteSource="limiteCeilingFt" limiteLabel="Plafond LIMITE"
            nogoSource="minCeilingFt" nogoLabel="Plafond NO GO"
            unit="ft AGL"
        />

        <Divider sx={{ width: '100%', my: 2 }} />
        <SectionTitle title="Jour / Nuit aéronautique" />
        <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
            La fenêtre de vol autorisée va de l'<strong>aube civile</strong> au <strong>crépuscule civil</strong>.
            Les marges <strong>réduisent</strong> cette fenêtre pour plus de sécurité (0 = pas de marge supplémentaire).
            La durée minimale de vol empêche un GO si le temps restant est insuffisant pour compléter un vol.
        </Alert>
        <Box display="flex" gap={2} flexWrap="wrap" width="100%" mb={1}>
            <Box flex={1} minWidth={180}>
                <NumberInput source="dayMarginMinutes" label="Marge après aube (min)" fullWidth min={0}
                    helperText="Délai supplémentaire après l'aube civile avant d'autoriser le vol" defaultValue={0} />
            </Box>
            <Box flex={1} minWidth={180}>
                <NumberInput source="nightMarginMinutes" label="Marge avant crépuscule (min)" fullWidth min={0}
                    helperText="Anticipation avant le crépuscule civil pour atterrir" defaultValue={0} />
            </Box>
            <Box flex={1} minWidth={180}>
                <NumberInput source="minFlightDurationMinutes" label="Durée min. de vol (min)" fullWidth min={15}
                    helperText="Temps minimum nécessaire pour un vol (défaut 60 min)" defaultValue={60} />
            </Box>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }} />
        <SectionTitle title="NOTAM" />
        <SelectInput source="notamStrategy" label="Stratégie NOTAM" validate={required()} fullWidth
            choices={[
                { id: 'ai', name: 'Analyse IA (Kimi) — classifie bloquant vs informatif' },
                { id: 'block', name: 'Bloquant — tout NOTAM actif = NO GO' },
                { id: 'warn', name: 'Avertissement — NOTAM actif = SELON EXPÉRIENCE' },
                { id: 'ignore', name: 'Ignoré — les NOTAM ne sont pas pris en compte' },
            ]}
            helperText="L'analyse IA ne classe comme bloquant que les fermetures de piste/aérodrome et les interdictions d'espace aérien (PROHIBITED). Tout le reste est informatif."
        />

        <Divider sx={{ width: '100%', my: 2 }} />
        <TextInput source="notes" label="Notes / remarques" multiline rows={3} fullWidth
            helperText="Informations complémentaires visibles par les pilotes." />
    </SimpleForm>
);
