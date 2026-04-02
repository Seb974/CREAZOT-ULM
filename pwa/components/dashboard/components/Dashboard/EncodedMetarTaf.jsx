import React, { useEffect, useState } from 'react';
import { getMetarOrTaf } from '../../../../app/lib/actions' 
import { isDefined } from '../../../../app/lib/utils';
import { CircularProgress, Alert } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import CloudOffIcon from '@mui/icons-material/CloudOff';

export const EncodedMetarTaf = ({ code }) => {

    const [metar, setMetar] = useState(null);
    const [taf, setTaf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!code) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                await fetchData();
            } catch {
                setError('Impossible de récupérer les données météo.');
            }
            setLoading(false);
        };
        load();
    }, [code]);

    const fetchData = async () => {
        const [metarRes, tafRes] = await Promise.all([
            getMetarOrTaf(code, 'metar', true).catch(() => null),
            getMetarOrTaf(code, 'taf', true).catch(() => null)
        ]);

        const m = metarRes?.data?.[0] || null;
        const t = tafRes?.data?.[0] || null;

        setMetar(m);
        setTaf(t);

        if (!m && !t) {
            setError('no_data');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center w-full h-full min-h-[200px]">
                <CircularProgress color="error" size={50} />
            </div>
        );
    }

    if (error && error !== 'no_data') {
        return (
            <Alert severity="error" icon={<CloudOffIcon />} sx={{ m: 1 }}>
                {error}
            </Alert>
        );
    }

    if (error === 'no_data') {
        return (
            <Alert severity="info" icon={<CloudOffIcon />} sx={{ m: 1 }}>
                Aucune donnée METAR/TAF disponible pour <strong>{code}</strong>. Cette station ne dispose peut-être pas de service météo automatique.
            </Alert>
        );
    }

    return (
        <>
            <h3><b>METAR</b></h3>
            { isDefined(metar) && metar.raw_text ?
                <p>
                    { metar.observed &&
                        <i className="text-xs">
                            Le {new Date(metar.observed).toLocaleDateString()} à {new Date(metar.observed).toLocaleTimeString()}
                        </i>
                    }
                    <br/>
                    {metar.raw_text}
                </p>
                :
                <Alert severity="info" variant="outlined" sx={{ my: 1, py: 0.5 }}>
                    Aucun METAR disponible pour <strong>{code}</strong>
                </Alert>
            }
            <br/>
            <h3><b>TAF</b></h3>
            { isDefined(taf) && taf.raw_text ?
                <p>
                    { taf.timestamp &&
                        <i className="text-xs">
                            Du {new Date(taf.timestamp.from).toLocaleDateString()} {new Date(taf.timestamp.from).toLocaleTimeString()}{" "}
                            au {new Date(taf.timestamp.to).toLocaleDateString()} {new Date(taf.timestamp.to).toLocaleTimeString()}
                        </i>
                    }
                    <br/>
                    {taf.raw_text}
                </p>
                :
                <Alert severity="info" variant="outlined" sx={{ my: 1, py: 0.5 }}>
                    Aucun TAF disponible pour <strong>{code}</strong>
                </Alert>
            }
        </>
    );
};
