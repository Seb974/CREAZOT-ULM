import { useEffect, useState, useRef } from "react";
import { isDefined } from '../../../../../app/lib/utils';
import axios from "axios";

export const useBalisePositions = (baliseId, aeronefs = [], pollingInterval = 8000, hidden = false) => {
    const intervalRef = useRef(null);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible")
                startPolling();
            else
                stopPolling();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        if (document.visibilityState === "visible")
            startPolling();

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        stopPolling();
        if (document.visibilityState === "visible")
            startPolling(); 
    }, [baliseId, JSON.stringify(aeronefs), hidden]);

    const startPolling = () => {
        if (!intervalRef.current && !hidden) {
            fetchPositions();
            intervalRef.current = setInterval(fetchPositions, pollingInterval);
        }
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const fetchPositions = async () => {
        if (baliseId && (baliseId === "all" ? aeronefs.length > 0 : true) && !hidden) {
            setLoading(true);
            setError(null);
            try {
                if (baliseId === "all") {
                    const positionsPromises = aeronefs.map(balise =>
                        axios.get(`/admin/microtrak/position/${balise.codeBalise}`)
                            .then(res => getTransformedData(res, balise))
                            .catch(() => null)
                    );
                    
                    const allPositions = (await Promise.all(positionsPromises)).filter(Boolean);;
                    setPositions(allPositions);
                } else {
                    const aeronef = aeronefs.find(a => a.codeBalise === baliseId) || {immatriculation: "", codeBalise: ""};
                    const response = await axios.get(`/admin/microtrak/position/${baliseId}`);
                    const positions = getTransformedData(response, aeronef);
                    setPositions([positions].filter(Boolean));
                }
            } catch (err) {
                setError(err.message || 'Erreur lors de la récupération des balises');
            } finally {
                setLoading(false);
            }
        }
        return ;
    };

    const getTransformedData = ({ data }, { immatriculation, codeBalise }) => {
        if (!isDefined(data) || !isDefined(data.lat) || !isDefined(data.lng)) 
            return null;

        return {...data, nombalise: immatriculation, deveui: codeBalise };
    }

    return { positions, loading, error };
};
