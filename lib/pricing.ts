import {business} from './business';
/** All amounts in this catalogue exclude 21% VAT. */
export const hostingPlans = [
  {name:"Hosting",price:business.hostingMonthly,tag:"Online houden",items:["Je website online houden","Geen wijzigingen of onderhoud"]},
  {name:"Hosting & technisch onderhoud",price:29.99,tag:"Online & technisch verzorgd",items:["Hosting inbegrepen","Maandelijkse controle op snelheid en fouten","Herstel van technische fouten binnen je bestaande website"]},
  {name:"Hosting, onderhoud & SEO",price:69.99,tag:"Techniek & bestaande inhoud",items:["Alles uit technisch onderhoud","Doorlopende SEO-verbeteringen","Bestaande teksten aanscherpen en code bijwerken waar nodig"]}
];
export const blogPlans = [
  {name:"2 blogs per maand",price:175,tag:"Een rustig publicatieritme",items:["Onderwerpenonderzoek","Schrijven vanuit jouw expertise","SEO-opmaak en interne links","Publiceren op je website"]},
  {name:"4 blogs per maand",price:325,tag:"Meer ruimte voor je onderwerpen",items:["Dezelfde complete verzorging","Onderwerpenonderzoek en schrijven","SEO-opmaak en interne links","Vier publicaties verdeeld over de maand"]}
];
export const socialPrices = [[4,149,174,199],[6,199,234,269],[8,249,294,339]];
