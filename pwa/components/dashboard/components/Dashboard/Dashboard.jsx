"use client";
import React, { useState, useEffect } from "react";
import "../../../../css/satoshi.css";
import "../../../../css/style.css";
import { MetarView } from "./MetarView";
import { Cameras } from "./Cameras";
import { CalendarWidget } from "./CalendarWidget";
import dynamic from 'next/dynamic';
import { useClient } from '../../../admin/ClientProvider';
import GlobalLoader from "../../../admin/layout/GlobalLoader";
import { isDefined } from "../../../../app/lib/utils";
import { AppBar, Dialog, IconButton, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

const Dashboard = () => {

  const { client, loading } = useClient();
  const [isSmall, setIsSmall] = useState(true);
  const [showGraphic, setShowGraphic] = useState(true);
  const [showMetarMobile, setShowMetarMobile] = useState(true);
  const [selectedBalise, setSelectedBalise] = useState('none');
  const [showFullMap, setShowFullMap] = useState(false);
  const [appli, setAppli] = useState("W"); 

  const onWSelect = () => setAppli("W");
  const onMSelect = () => setAppli("M");
  const onCSelect = () => setAppli("C");
  const onMBSelect = () => setAppli("MB");

  useEffect(() => {
    const handleResize = () => setIsSmall(window.innerWidth < 768);

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return loading ? <GlobalLoader/> : 
    isDefined(client) && (
      <>
      <div className="overflow-x-hidden w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" >
          <MetarView showGraphic={ showGraphic } setShowGraphic={ setShowGraphic } switchToMap={() => setShowMetarMobile(false)} hidden={ isSmall && !showMetarMobile } client={ client }/>
          <MapView isSmall={ isSmall } switchToMetar={() => setShowMetarMobile(true)} hidden={ isSmall && showMetarMobile } client={ client } setShowFullMap={ setShowFullMap } selectedBalise={ selectedBalise } setSelectedBalise={ setSelectedBalise } fullScreen={ false } />
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
                    <iframe className="w-full h-96 rounded-sm flex justify-center" style={{ border: 'none' }} src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=${ client.zoom } &overlay=clouds&product=ecmwf&level=surface&lat=${ client.lat }&lon=${ client.lng }&message=true`}></iframe>
                  : appli === "M" ?
                    <iframe className="w-full h-96 rounded-sm flex justify-center" style={{ border: 'none' }} _ngcontent-serverapp-c135101453="" id="radarIframe" allow="web-share" src={`https://radar.wo-cloud.com/pwa/?zoom=${ client.zoom }&layer=WetterRadar&center=${ client.lat + ',' + client.lng }&tz=Indian/Reunion&tf=HH:mm&windunit=kmh&lang=fr-FR&desktop=true&fadeTop=false`} title="Carte radar météo"></iframe>
                  :
                  <iframe className="w-full h-96 rounded-sm flex justify-center" style={{ border: 'none' }} src={`https://www.meteoblue.com/fr/meteo/cartes/widget?windAnimation=0&gust=0&satellite=1&cloudsAndPrecipitation=1&temperature=1&sunshine=1&extremeForecastIndex=1&geoloc=detect&tempunit=C&windunit=km%252Fh&lengthunit=metric&zoom=${ client.zoom - 1 }&autowidth=auto`}  frameborder="0" scrolling="NO" allowtransparency="true" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
              : 
              <></>
              }
            </div>
            <div className={ `camera-container ${ appli === "C" ? "visible" : "invisible no-visible-cam"}`}>
              <Cameras client={ client }/>
            </div>
          </div>
        </div>
          { isDefined(client.hasReservation) && client.hasReservation &&  <CalendarWidget isSmall={ isSmall } client={ client }/> }
      </div>
      <Dialog fullScreen open={showFullMap} onClose={() => setShowFullMap(false)}>
        <AppBar position="static" style={{ backgroundColor: client.color || 'primary' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setShowFullMap(false)}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Carte en plein écran
            </Typography>
          </Toolbar>
        </AppBar>
        <MapView isSmall={ isSmall } switchToMetar={() => setShowMetarMobile(true)} hidden={ isSmall && showMetarMobile } client={ client } setShowFullMap={ setShowFullMap } selectedBalise={ selectedBalise } setSelectedBalise={ setSelectedBalise } fullScreen={ true }/>
      </Dialog>
      </>
  );
};

export default Dashboard;
