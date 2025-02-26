"use client";
import React, { useState } from "react";
import "../../../../css/satoshi.css";
import "../../../../css/style.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MetarView } from "./MetarView";
import { CalendarView } from "../Calendar/CalendarView";
import { RegisterModal } from "../Modal/RegisterModal";
import { InformationsModal } from "../Modal/InformationsModal";
import { UpdateModal } from "../Modal/UpdateModal";
import { cameras } from "../../../../app/lib/cameras";

const Dashboard = () => {

  const now = new Date();
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0);
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30);
  const [selection, setSelection] = useState(null);
  const [events, setEvents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [slot, setSlot] = useState({start: min, end: max});
  const [reservations, setReservations] = useState([]);
  const [toUpdate, setToUpdate] = useState(null);
  const [appli, setAppli] = useState("W");

  const onWSelect = () => setAppli("W");
  const onMSelect = () => setAppli("M");
  const onCSelect = () => setAppli("C");
  const onMBSelect = () => setAppli("MB");
  const onMetarClick = e => e.preventDefault();

return (
    <>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4"> 
        <div className="w-full mt-6">
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full">
              <a onClick={ onMetarClick } href="https://metar-taf.com/fr/FMEP" id="metartaf-KiVSEp48" style={{fontSize: "18px", fontWeight:500, color:"#000", width:"100%", height:"278px", display:"block"}}>METAR Aéroport de Pierrefonds</a>
              <script async defer crossorigin="anonymous" src="https://metar-taf.com/fr/embed-js/FMEP?layout=landscape&qnh=hPa&rh=dp&target=KiVSEp48"></script>
            </div>
        </div>
        <MetarView />
      </div>
      <div className="col-span-12 mt-6">
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="inline-flex mb-4 flex justify-end">
              <button 
                className={`${appli === "W" && 'active'} bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-l`}
                onClick={ onWSelect }
              >
                Windy
              </button>
              <button 
                className={`${appli === "M" && 'active'} bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400`}
                onClick={ onMSelect }
              >
                MétéoRadar
              </button>
              <button 
                className={`${appli === "MB" && 'active'} bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400`}
                onClick={ onMBSelect }
              >
                MeteoBlue
              </button>
              <button 
                className={`${appli === "C" && 'active'} bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-r`}
                onClick={ onCSelect }
              >
                Caméras
              </button>
            </div>
            <br/> 
            <div className={` ${ appli !== "C" ? "visible" : "invisible"}`}>
              { appli !== "C" ? 
                  appli === "W" ? 
                    <iframe className="windyCard rounded-sm flex justify-center" src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=9&overlay=clouds&product=ecmwf&level=surface&lat=-21.152&lon=55.54&message=true"></iframe>
                  : appli === "M" ?
                    <iframe className="windyCard rounded-sm flex justify-center" _ngcontent-serverapp-c135101453="" id="radarIframe" allow="web-share" src="https://radar.wo-cloud.com/pwa/?zoom=7.45&amp;placemark=-21.250048,55.476224&amp;layer=WetterRadar&amp;center=-21.48,55.84&amp;tz=Indian/Reunion&amp;tf=HH:mm&amp;windunit=kmh&amp;lang=fr-FR&amp;placemarkName=Entre-Deux&amp;desktop=true&amp;fadeTop=false" title="Carte radar météo"></iframe>
                  :
                  <iframe className="windyCard rounded-sm flex justify-center" src="https://www.meteoblue.com/fr/meteo/cartes/widget?windAnimation=0&gust=0&satellite=1&cloudsAndPrecipitation=1&temperature=1&sunshine=1&extremeForecastIndex=1&geoloc=detect&tempunit=C&windunit=km%252Fh&lengthunit=metric&zoom=8&autowidth=auto"  frameborder="0" scrolling="NO" allowtransparency="true" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
                  // style="width: 100%; height: 720px"
                  // <div>
                  //   <!-- DO NOT REMOVE THIS LINK -->
                  //   <a href="https://www.meteoblue.com/fr/meteo/cartes/index?utm_source=map_widget&utm_medium=linkus&utm_content=map&utm_campaign=Weather%2BWidget" target="_blank" rel="noopener">meteoblue</a>
                  // </div>

                : 
                <></>
              }
            </div>
              <div className={ `camera-container ${ appli === "C" ? "visible" : "invisible no-visible-cam"}`}>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                  { cameras.map( (camera, i) => { 
                      return (
                        <div key={ i } className="camera">
                          <label>{ camera.title }</label>
                          <a name="windy-webcam-timelapse-player" data-id={ camera.id } data-play="day" data-loop="0" data-auto-play="0" data-force-full-screen-on-overlay-play="0" data-interactive="0" href={ `https://windy.com/webcams/${ camera.id }` } target="_blank"></a>
                          <script async type="text/javascript" src="https://webcams.windy.com/webcams/public/embed/v2/script/player.js"></script>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <CalendarView 
            events={ events } 
            setEvents={ setEvents } 
            selection={ selection } 
            setSelection={ setSelection }
            slot={ slot }
            setSlot={ setSlot }
            visible={ visible }
            setVisible={ setVisible }
            reservations={ reservations }
            setReservations={ setReservations }
            // popup={ true }
            />
      </div>
      <RegisterModal 
          visible={ visible } 
          setVisible={ setVisible } 
          slot={ slot }
          reservations={ reservations }
          setReservations={ setReservations }
      />
      <InformationsModal 
          selectedReservation={ selection } 
          setSelectedReservation={ setSelection }
          reservations={ reservations }
          setReservations={ setReservations }
          toUpdate={ toUpdate }
          setToUpdate={ setToUpdate }
      />
      <UpdateModal 
          toUpdate={ toUpdate } 
          setToUpdate={ setToUpdate }
          reservations={ reservations }
          setReservations={ setReservations }
      />
    </>
  );
};

export default Dashboard;
