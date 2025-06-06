import { Show, TabbedShowLayout, TextField, DateField, BooleanField, FunctionField, RichTextField, ArrayField, Datagrid } from 'react-admin';
import { getColor } from '../../../app/lib/client';
import { isDefined } from '../../../app/lib/utils';
import { Box } from "@mui/material";

export const ClientShow = () => {

    const getDescription = ({ address, zipcode, city }) => {
        return <p>{ address }<br/>{ zipcode } - { city }</p>
    };

    const getFilename = path => isDefined(path) ? path.split('/').pop() : '';

    return (
        <Show>
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Informations">
                    <TextField source="name" label="Nom"/>
                    <FunctionField 
                        source="address"
                        label="Adresse"
                        render={record => getDescription(record) }
                    />
                    <TextField source="phone" label="N° de téléphone"/>
                    <TextField source="email" label="Adresse email"/>
                    <DateField source="createdAt" label="Créé le"/>
                    <DateField source="updatedAt" label="Dernière mise à jour, le"/>
                    <BooleanField source="active" label="Compte activé" textAlign="center"/>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Dashboard">
                    <FunctionField 
                        source="color"
                        label="Couleur du Header"
                        render={({ color }) => <span style={{ color }}>{ getColor(color).name }</span> }
                    />
                    <TextField source="timezone" label="Fuseau horaire"/>
                    <FunctionField 
                        source="lat"
                        label="Coordonnées GPS"
                        render={({lat, lng}) => '[' + lat + ', ' + lng + ']'}
                    />
                    <TextField source="zoom" label="Zoom par défaut des cartes"/>
                    <ArrayField source="airportCodes" label="Aéroports fréquentés">
                        <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} className="text-xs italic">
                            <FunctionField
                                label=""
                                source="name"
                                render={ ({ code, nom }) => code + " - " + nom }
                            />
                        </Datagrid>
                    </ArrayField>
                    <ArrayField source="camIds" label="Caméras Windy suivies">
                        <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} className="text-xs italic">
                            <FunctionField
                                label=""
                                source="id"
                                render={ ({ id, nom }) => id + " - " + nom }
                            />
                        </Datagrid>
                    </ArrayField>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Images">
                    <FunctionField source="logo" label="Logo" render={({ logo }) => isDefined(logo) ? <a href={logo} target="_blank" rel="noopener noreferrer">{ getFilename(logo) }</a> : ''}/>
                    <FunctionField source="favicon" label="Favicon" render={({ favicon }) => isDefined(favicon) ? <a href={favicon} target="_blank" rel="noopener noreferrer">{ getFilename(favicon) }</a> : ''}/>
                    <FunctionField source="mapIcon" label="Icone représentative sur les cartes" render={({ mapIcon }) => isDefined(mapIcon) ? <a href={mapIcon} target="_blank" rel="noopener noreferrer">{ getFilename(mapIcon) }</a> : ''}/>
                    <FunctionField source="thanksImage" label="Image de la page de remerciement" render={({ thanksImage }) => isDefined(thanksImage) ? <a href={thanksImage} target="_blank" rel="noopener noreferrer">{ getFilename(thanksImage) }</a> : ''}/>
                    <FunctionField 
                        source="pdfBackground" 
                        label="Image de fond du PDF" 
                        render={({ pdfBackground, opacity }) => <p>
                            { isDefined(pdfBackground) ? <a href={pdfBackground} target="_blank" rel="noopener noreferrer">{  getFilename(pdfBackground) }</a> : '' }
                            { isDefined(opacity) && opacity > 0 && <span className="ml-4 text-xs italic text-teal-800">{ "Opacité de " + opacity + " appliquée"}</span> }
                            </p>
                        }
                    />
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Options">
                    <BooleanField source="hasReservation" label="Réservations" textAlign="center"/>
                    <BooleanField source="hasOptions" label="Options" textAlign="center"/>
                    <BooleanField source="hasPartners" label="Partenariat" textAlign="center"/>
                    <BooleanField source="hasGifts" label="Cadeaux" textAlign="center"/>
                    <BooleanField source="hasOriginContact" label="Origine du contact" textAlign="center"/>
                    <BooleanField source="hasLandingManagement" label="Gestion des atterrissages" textAlign="center"/>
                    <BooleanField source="hasPaymentManagement" label="Gestion des paiements" textAlign="center"/>
                    <BooleanField source="hasPassengerRegistration" label="Enregistrement des passagers" textAlign="center"/>
                    <TextField source="thanksTitle" label="Titre du formulaire"/>
                    <RichTextField source="thanksMessage" label="Contenu de la page de redirection"/>
                    <BooleanField source="hasEmailConfirmation" label="Email de confirmation" textAlign="center"/>
                    <TextField source="confirmationSubject" label="Objet de l'email"/>
                    <RichTextField source="confirmationMessage" label="Contenu de l'email de confirmation"/>
                </TabbedShowLayout.Tab>     
            </TabbedShowLayout>
        </Show>
    )
}