"use client";
import React, { useState, useEffect } from "react";
import "../../../../css/satoshi.css";
import "../../../../css/style.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MetarView } from "./MetarView";
import { CalendarView } from "../Calendar/CalendarView";
import { RappelModal } from "../Modal/RappelModal";
import { RegisterModal } from "../Modal/RegisterModal";
import { InformationsModal } from "../Modal/InformationsModal";
import { RappelInformationsModal } from "../Modal/RappelInformationsModal";
import { UpdateModal } from "../Modal/UpdateModal";
import { cameras } from "../../../../app/lib/cameras";

const Dashboard = () => {

  const now = new Date();
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0);
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30);
  const [selection, setSelection] = useState(null);
  const [rappelSelection, setRappelSelection] = useState(null);
  const [events, setEvents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [rappelVisible, setRappelVisible] = useState(false);
  const [slot, setSlot] = useState({start: min, end: max});
  const [reservations, setReservations] = useState([]);
  const [rappels, setRappels] = useState([]);
  const [toUpdate, setToUpdate] = useState(null);
  const [appli, setAppli] = useState("W");

  const onWSelect = () => setAppli("W");
  const onMSelect = () => setAppli("M");
  const onCSelect = () => setAppli("C");
  const onMBSelect = () => setAppli("MB");
  const onMetarClick = e => e.preventDefault();

  return (
    <div className="overflow-x-hidden w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="w-full mt-6 overflow-hidden">
          <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full">
            <a onClick={ onMetarClick } href="https://metar-taf.com/fr/FMEP" id="metartaf-KiVSEp48" className="w-full h-full" style={{fontSize: "18px", fontWeight:500, color:"#000"}}>METAR Aéroport de Pierrefonds</a>
            <script async defer crossOrigin="anonymous" src="https://metar-taf.com/fr/embed-js/FMEP?layout=landscape&qnh=hPa&rh=dp&target=KiVSEp48"></script>
          </div>
        </div>
        <MetarView />
      </div>

      <div className="col-span-12 mt-6">
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-wrap md:inline-flex mb-4 sm:justify-end md:justify-left">
            <button 
              className={`bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-l ${appli === "W" && 'active'}`}
              onClick={ onWSelect }
            >
              <span className="hidden sm:inline">Windy</span>
              <span className="inline sm:hidden">Wdy</span>
            </button>
            <button 
              className={`bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 ${appli === "M" && 'active'}`}
              onClick={ onMSelect }
            >
              <span className="hidden sm:inline">MétéoRadar</span>
              <span className="inline sm:hidden">Radar</span>
            </button>
            <button 
              className={`bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 ${appli === "MB" && 'active'}`}
              onClick={ onMBSelect }
            >
              <span className="hidden sm:inline">MeteoBlue</span>
              <span className="inline sm:hidden">Blue</span>
            </button>
            <button 
              className={`bg-white hover:bg-gray-100 active:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-r ${appli === "C" && 'active'}`}
              onClick={ onCSelect }
            >
              <span className="hidden sm:inline">Caméras</span>
              <span className="inline sm:hidden">Cams</span>
            </button>
          </div>

          <div className={` ${ appli !== "C" ? "visible" : "invisible"} w-full`}>
            { appli !== "C" ? 
                appli === "W" ? 
                  <iframe className="w-full h-80 rounded-sm flex justify-center" style={{ border: 'none' }} src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=9&overlay=clouds&product=ecmwf&level=surface&lat=-21.152&lon=55.54&message=true"></iframe>
                : appli === "M" ?
                  <iframe className="w-full h-80 rounded-sm flex justify-center" style={{ border: 'none' }} _ngcontent-serverapp-c135101453="" id="radarIframe" allow="web-share" src="https://radar.wo-cloud.com/pwa/?zoom=7.45&amp;placemark=-21.250048,55.476224&amp;layer=WetterRadar&amp;center=-21.48,55.84&amp;tz=Indian/Reunion&amp;tf=HH:mm&amp;windunit=kmh&amp;lang=fr-FR&amp;placemarkName=Entre-Deux&amp;desktop=true&amp;fadeTop=false" title="Carte radar météo"></iframe>
                :
                <iframe className="w-full h-80 rounded-sm flex justify-center" style={{ border: 'none' }} src="https://www.meteoblue.com/fr/meteo/cartes/widget?windAnimation=0&gust=0&satellite=1&cloudsAndPrecipitation=1&temperature=1&sunshine=1&extremeForecastIndex=1&geoloc=detect&tempunit=C&windunit=km%252Fh&lengthunit=metric&zoom=8&autowidth=auto"  frameborder="0" scrolling="NO" allowtransparency="true" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
            : 
            <></>
            }
          </div>

          <div className={ `camera-container ${ appli === "C" ? "visible" : "invisible no-visible-cam"}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
            rappelVisible={ rappelVisible } 
            setRappelVisible={ setRappelVisible }
            rappels={ rappels }
            setRappels={ setRappels }
            rappelSelection={ rappelSelection } 
            setRappelSelection={ setRappelSelection }
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
      <RappelModal 
          rappelVisible={ rappelVisible } 
          setRappelVisible={ setRappelVisible } 
          slot={ slot }
          rappels={ rappels }
          setRappels={ setRappels }
      />
      <RappelInformationsModal 
          selectedRappel={ rappelSelection } 
          setSelectedRappel={ setRappelSelection }
          rappels={ rappels }
          setRappels={ setRappels }
          events={ events }
          setEvents={ setEvents }
      />
    </div>
  );
};

export default Dashboard;
