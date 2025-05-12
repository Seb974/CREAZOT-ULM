"use client";
import React, { useState, useEffect } from "react";
import "../../../../css/satoshi.css";
import "../../../../css/style.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MetarView } from "./MetarView";
import { Cameras } from "./Cameras";
import { CalendarView } from "../Calendar/CalendarView";
import { RappelModal } from "../Modal/RappelModal";
import { RegisterModal } from "../Modal/RegisterModal";
import { InformationsModal } from "../Modal/InformationsModal";
import { RappelInformationsModal } from "../Modal/RappelInformationsModal";
import { UpdateModal } from "../Modal/UpdateModal";
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
});

const Dashboard = () => {

  const defaultView = {center: [-21.1351, 55.5114], zoom: 9};

  const now = new Date();
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0);
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30);

  const [isSmall, setIsSmall] = useState(true);
  const [showGraphic, setShowGraphic] = useState(true);
  const [showMetarMobile, setShowMetarMobile] = useState(true);
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

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 768);
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="overflow-x-hidden w-full">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" >
        <MetarView showGraphic={ showGraphic } setShowGraphic={ setShowGraphic } switchToMap={() => setShowMetarMobile(false)} hidden={ isSmall && !showMetarMobile }/>
        <MapView isSmall={ isSmall } switchToMetar={() => setShowMetarMobile(true)} hidden={ isSmall && showMetarMobile }/>
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
                  <iframe className="w-full h-96 rounded-sm flex justify-center" style={{ border: 'none' }} src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=${ defaultView.zoom } &overlay=clouds&product=ecmwf&level=surface&lat=${ defaultView.center[0] }&lon=${ defaultView.center[1] }&message=true`}></iframe>
                : appli === "M" ?
                  <iframe className="w-full h-96 rounded-sm flex justify-center" style={{ border: 'none' }} _ngcontent-serverapp-c135101453="" id="radarIframe" allow="web-share" src={`https://radar.wo-cloud.com/pwa/?zoom=${ defaultView.zoom }&layer=WetterRadar&center=${ defaultView.center[0] + ',' + defaultView.center[1] }&tz=Indian/Reunion&tf=HH:mm&windunit=kmh&lang=fr-FR&desktop=true&fadeTop=false`} title="Carte radar météo"></iframe>
                :
                <iframe className="w-full h-96 rounded-sm flex justify-center" style={{ border: 'none' }} src={`https://www.meteoblue.com/fr/meteo/cartes/widget?windAnimation=0&gust=0&satellite=1&cloudsAndPrecipitation=1&temperature=1&sunshine=1&extremeForecastIndex=1&geoloc=detect&tempunit=C&windunit=km%252Fh&lengthunit=metric&zoom=${ defaultView.zoom - 1 }&autowidth=auto`}  frameborder="0" scrolling="NO" allowtransparency="true" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
            : 
            <></>
            }
          </div>

          <div className={ `camera-container ${ appli === "C" ? "visible" : "invisible no-visible-cam"}`}>
            <Cameras />
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
