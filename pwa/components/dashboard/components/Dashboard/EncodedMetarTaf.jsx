import React, { useEffect, useState } from 'react';
import { getMetarOrTaf } from '../../../../app/lib/actions' 
import { isDefined } from '../../../../app/lib/utils';

export const EncodedMetarTaf = ({ code }) => {

    const [metar, setMetar] = useState("");
    const [taf, setTaf] = useState("");

    useEffect(() => {
        if (!code) return;
        getMetarOrTaf(code, 'metar', true).then(res => setMetar(res.data[0]));
        getMetarOrTaf(code, 'taf', true).then(res => setTaf(res.data[0]));
    }, [code]);

    return (
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
    );

};