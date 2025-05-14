import React, { useEffect, useState } from 'react';
import { getMetarOrTaf } from '../../../../app/lib/actions' 
import { isDefined } from '../../../../app/lib/utils';
import { CircularProgress } from '@mui/material';

export const EncodedMetarTaf = ({ code }) => {

    const [metar, setMetar] = useState("");
    const [taf, setTaf] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!code) return;
        const load = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };
        load();
    }, [code]);

    const fetchData = async () => {
        const [metarRes, tafRes] = await Promise.all([
            getMetarOrTaf(code, 'metar', true),
            getMetarOrTaf(code, 'taf', true)
        ]);

        setMetar(metarRes.data[0]);
        setTaf(tafRes.data[0]);
    };

    return loading ?
        <div className="flex justify-center items-center w-full h-full">
            <CircularProgress color="error" size={50} />
        </div>
        :
        <>
            <h3><b>METAR</b></h3>
            { isDefined(metar) && metar !== "" &&
                <p>
                    <i className="text-xs">
                    Le {new Date(metar.observed).toLocaleDateString()} à {new Date(metar.observed).toLocaleTimeString()}
                    </i>
                    <br/>
                    {metar.raw_text}
                </p>
            }
            <br/>
            <h2><b>TAF</b></h2>
            { isDefined(taf) && taf !== "" &&
                <p>
                    <i className="text-xs">
                        Du {new Date(taf.timestamp.from).toLocaleDateString()} {new Date(taf.timestamp.from).toLocaleTimeString()}{" "}
                        au {new Date(taf.timestamp.to).toLocaleDateString()} {new Date(taf.timestamp.to).toLocaleTimeString()}
                    </i>
                    <br/>
                    {taf.raw_text} 
                </p>
            }
        </>
};