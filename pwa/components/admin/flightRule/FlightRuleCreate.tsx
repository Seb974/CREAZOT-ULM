import { Create, useDataProvider, useNotify, useRedirect } from "react-admin";
import { useClient } from "../ClientProvider";
import { FlightRuleForm } from "./FlightRuleForm";

export const FlightRuleCreate = () => {
    const dataProvider = useDataProvider();
    const { client } = useClient();
    const notify = useNotify();
    const redirect = useRedirect();

    const handleSubmit = async (data) => {
        try {
            const payload = { ...data, client: "/clients/" + client?.id };
            await dataProvider.create('flight_rules', { data: payload });
            notify('Règles de vol créées avec succès', { type: 'success' });
            redirect('list', 'flight_rules');
        } catch (error) {
            console.error(error);
            notify('Erreur lors de la création', { type: 'error' });
        }
    };

    return (
        <Create title="Nouvelle règle de vol">
            <FlightRuleForm onSubmit={handleSubmit} />
        </Create>
    );
};
