import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import ReactDOM from 'react-dom';

export const LeafletControl = ({ position = 'topright', children }) => {
    const map = useMap();
    const controlDivRef = useRef(document.createElement('div'));

    useEffect(() => {
        const control = new L.Control({ position });

        control.onAdd = () => {
            controlDivRef.current.className = 'leaflet-control ';       // leaflet-bar
            return controlDivRef.current;
        };

        map.addControl(control);
        return () => {
            map.removeControl(control);
        };
    }, [map, position]);

    return ReactDOM.createPortal(children, controlDivRef.current);
};
