"use client";
import { useState } from "react";

export function ServiceToolDemo(){
  const [requests,setRequests]=useState(20);
  const [minutes,setMinutes]=useState(6);
  const hours=(requests*minutes*52/12/60).toLocaleString("nl-NL",{maximumFractionDigits:1});
  return <div className="service-tool-demo"><div><span className="eyebrow">Probeer een eenvoudige rekentool</span><h3>Hoeveel tijd zit er<br/>in terugkerend werk?</h3><p>Deze demo rekent uit hoeveel tijd je huidige handeling vraagt. Zo maak je een proces eerst concreet, voordat je bepaalt wat je wilt automatiseren.</p><a className="text-link" href="/tools/automatiseringsplan">Maak een concreet automatiseringsplan ↗</a></div><div className="demo-controls"><label htmlFor="demo-requests">Aanvragen per week <b>{requests}</b></label><input id="demo-requests" type="range" min="1" max="100" step="1" value={requests} onChange={event=>setRequests(Number(event.target.value))}/><label htmlFor="demo-minutes">Minuten werk per aanvraag <b>{minutes}</b></label><input id="demo-minutes" type="range" min="1" max="30" step="1" value={minutes} onChange={event=>setMinutes(Number(event.target.value))}/><output aria-live="polite"><strong>{hours}<span> uur</span></strong><span>handmatig werk per gemiddelde maand</span></output><p>Berekening: aanvragen × minuten × 52 weken ÷ 12 maanden ÷ 60 minuten. Dit toont je huidige tijdsbesteding, niet een beloofde besparing.</p></div></div>;
}
