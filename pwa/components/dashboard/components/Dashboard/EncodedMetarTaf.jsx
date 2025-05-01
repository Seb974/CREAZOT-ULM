import React, { useEffect, useState } from 'react';
import { getMetarOrTaf } from '../../../../app/lib/actions' 
import { isDefined } from '../../../../app/lib/utils';

export const EncodedMetarTaf = () => {

    const [metarFMEP, setMetarFMEP] = useState("");
    const [tafFMEP, setTafFMEP] = useState("");
    const [metarFMEE, setMetarFMEE] = useState("");
    const [tafFMEE, setTafFMEE] = useState("");

    useEffect(() => {
        if (metarFMEP === "")
            getMetarOrTaf('FMEP', 'metar', true)
                .then(response => setMetarFMEP(response.data[0]))
        if (tafFMEP === "")
            getMetarOrTaf('FMEP', 'taf', true)
                .then(response => setTafFMEP(response.data[0]))
        if (metarFMEE === "")
            getMetarOrTaf('FMEE', 'metar', true)
                .then(response => setMetarFMEE(response.data[0]))
        if (tafFMEE === "")
            getMetarOrTaf('FMEE', 'taf', true)
                .then(response => setTafFMEE(response.data[0]))
        
    }, []);

    return (
        <>
            <h3><b>METARs</b></h3>
            { isDefined(metarFMEP) && metarFMEP !== "" &&
                <p>
                    <i className="text-xs">
                        Le { (new Date(metarFMEP.observed)).toLocaleDateString() } à { (new Date(metarFMEP.observed)).toLocaleTimeString() }
                    </i>
                    <br/>
                    { metarFMEP.raw_text } 
                </p>
            }
            <br/>
            { isDefined(metarFMEE) && metarFMEE !== "" &&
                <p>
                    <i className="text-xs">
                        Le { (new Date(metarFMEE.observed)).toLocaleDateString() } à { (new Date(metarFMEE.observed)).toLocaleTimeString() }
                    </i>
                    <br/>
                    { metarFMEE.raw_text }   
                </p>     
            }
            <br/>
            <h2><b>TAFs</b></h2>
            { isDefined(tafFMEP) && tafFMEP !== "" &&
                <p>
                    <i className="text-xs">
                        Du { (new Date(tafFMEP.timestamp.from)).toLocaleDateString() }, { (new Date(tafFMEP.timestamp.from)).toLocaleTimeString() } { " " } 
                            au { (new Date(tafFMEP.timestamp.to)).toLocaleDateString() }, { (new Date(tafFMEP.timestamp.to)).toLocaleTimeString() }
                    </i>
                    <br/>
                    { tafFMEP.raw_text } 
                </p>
            }
            <br/>
            { isDefined(tafFMEE) && tafFMEE !== "" &&
                <p>
                    <i className="text-xs">
                        Du { (new Date(tafFMEE.timestamp.from)).toLocaleDateString() }, { (new Date(tafFMEE.timestamp.from)).toLocaleTimeString() } { " " } 
                            au { (new Date(tafFMEE.timestamp.to)).toLocaleDateString() }, { (new Date(tafFMEE.timestamp.to)).toLocaleTimeString() }
                    </i>
                    <br/>
                    { tafFMEE.raw_text } 
                </p>
            }
        </>
    );

};