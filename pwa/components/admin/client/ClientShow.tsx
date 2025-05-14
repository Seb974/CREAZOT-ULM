import { Show, SimpleShowLayout, TextField, NumberField, DateField, BooleanField, FunctionField, ArrayField, Datagrid } from 'react-admin';
import { getColor } from '../../../app/lib/client';
import { isDefined } from '../../../app/lib/utils';

export const ClientShow = () => {

    const getDescription = ({ address, zipcode, city }) => {
        return <p>{ address }<br/>{ zipcode } - { city }</p>
    };

    const getFilename = path => isDefined(path) ? path.split('/').pop() : '';

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="name" label="Nom"/>
                <FunctionField 
                    source="address"
                    label="Adresse"
                    render={record => getDescription(record) }
                />
                <TextField source="phone" label="N° de téléphone"/>
                <TextField source="email" label="Adresse email"/>
                <FunctionField 
                    source="lat"
                    label="Coordonnées GPS"
                    render={({lat, lng}) => '[' + lat + ', ' + lng + ']'}
                />
                <TextField source="timezone" label="Fuseau horaire"/>
                <ArrayField source="airportCodes" label="Aéroports fréquentés">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} className="text-xs italic">
                        <FunctionField
                            label=""
                            source="name"
                            render={ ({ code, nom }) => code + " - " + nom }
                        />
                    </Datagrid>
                </ArrayField>
                <FunctionField source="logo" label="Logo" render={({ logo }) => getFilename(logo) }/>
                <FunctionField source="favicon" label="Favicon" render={({ favicon }) => getFilename(favicon) }/>
                <FunctionField source="mapIcon" label="Icone représentative sur les cartes" render={({ mapIcon }) => getFilename(mapIcon) }/>
                <FunctionField 
                    source="pdfBackground" 
                    label="Image de fond du PDF" 
                    render={({ pdfBackground, opacity }) => <p>
                        { getFilename(pdfBackground) }
                        { isDefined(opacity) && opacity > 0 && <span className="ml-4 text-xs italic text-teal-800">{ "Opacité de " + opacity + " appliquée"}</span> }
                        </p>
                    }
                />
                <ArrayField source="camIds" label="Caméras Windy suivies">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} className="text-xs italic">
                        <FunctionField
                            label=""
                            source="id"
                            render={ ({ id, nom }) => id + " - " + nom }
                        />
                    </Datagrid>
                </ArrayField>
                <FunctionField 
                    source="color"
                    label="Couleur du Header"
                    render={({ color }) => <span style={{ color }}>{ getColor(color).name }</span> }
                />
                <TextField source="zoom" label="Zoom par défaut des cartes"/>
                <DateField source="createdAt" label="Créé le"/>
                <DateField source="updatedAt" label="Dernière mise à jour, le"/>
                <BooleanField source="active" label="Compte activé" textAlign="center"/>
            </SimpleShowLayout>
        </Show>
    )
}