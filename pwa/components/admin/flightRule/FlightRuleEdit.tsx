import { Edit, useDataProvider, useNotify, useRedirect } from "react-admin";
import { FlightRuleForm } from "./FlightRuleForm";

export const FlightRuleEdit = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();

    const handleSubmit = async (data) => {
        try {
            await dataProvider.update('flight_rules', { id: data.id, data, previousData: data });
            notify('Règles mises à jour avec succès', { type: 'success' });
            redirect('list', 'flight_rules');
        } catch (error) {
            console.error(error);
            notify('Erreur lors de la mise à jour', { type: 'error' });
        }
    };

    return (
        <Edit title="Modifier les règles de vol">
            <FlightRuleForm onSubmit={handleSubmit} />
        </Edit>
    );
};
