/*
 *  City labels
 */
#extracities,
#populated_places[NAME="Prince Rupert"][ISO_A2="CA"],
#populated_places[NAME="Metlakatla"][ISO_A2="CA"],
#populated_places[NAME="Kitamaat"][ISO_A2="CA"],
#populated_places[NAME="Hartley Bay"][ISO_A2="CA"],
#populated_places[NAME="Bella Bella"][ISO_A2="CA"],
#populated_places[NAME="Skidegate"][ISO_A2="CA"],
#populated_places[NAME="Old Massett"][ISO_A2="CA"],
#populated_places[NAME="Bella Coola"][ISO_A2="CA"],
#populated_places[NAME="Campbell River"][ISO_A2="CA"],
#populated_places[NAME="Klemtu"][ISO_A2="CA"],
#populated_places[NAME="Wuikinuxv"][ISO_A2="CA"],
#populated_places[NAME="Port Hardy"][ISO_A2="CA"],
#populated_places[NAME="Port McNeil"][ISO_A2="CA"],
#populated_places[NAME="Sayward"][ISO_A2="CA"],
#populated_places[NAME="Campbell River"][ISO_A2="CA"],
#populated_places[NAME="Comox"][ISO_A2="CA"],
#populated_places[NAME="Qualicum Beach"][ISO_A2="CA"],
#populated_places[NAME="Parksville"][ISO_A2="CA"],
#populated_places[NAME="Ottawa"][ISO_A2="CA"],
#populated_places[NAME="Pond Inlet"][ISO_A2="CA"],
#populated_places[NAME="Halifax"][ISO_A2="CA"],
#populated_places[NAME="Paulatuk"][ISO_A2="CA"],
#populated_places[NAME="Inuvik"][ISO_A2="CA"],
#populated_places[NAME="Iqaluit"][ISO_A2="CA"],
#populated_places[NAMEASCII="St. John's"][ISO_A2="CA"],
#populated_places[NAME="Vancouver"][ISO_A2="CA"],
#populated_places[NAME="Charleston"][ISO_A2="US"][ADM1NAME="South Carolina"],
#populated_places[NAME="Portland"][ISO_A2="US"],
#populated_places[NAME="Gloucester"][ISO_A2="US"],
#populated_places[NAME="Providence"][ISO_A2="US"],
#populated_places[NAME="New York"][ISO_A2="US"],
#populated_places[NAME="Virginia Beach"][ISO_A2="US"],
#populated_places[NAME="Miami"][ISO_A2="US"],
#populated_places[NAME="Mobile"][ISO_A2="US"],
#populated_places[NAME="New Orleans"][ISO_A2="US"],
#populated_places[NAME="Corpus Christi"][ISO_A2="US"],
#populated_places[NAME="San Diego"][ISO_A2="US"],
#populated_places[NAME="Santa Barbara"][ISO_A2="US"],
#populated_places[NAME="San Francisco"][ISO_A2="US"],
#populated_places[NAME="Port Orford"][ISO_A2="US"],
#populated_places[NAME="Portland"][ISO_A2="US"],
#populated_places[NAME="Seattle"][ISO_A2="US"],
#populated_places[NAME="Anchorage"][ISO_A2="US"],
#populated_places[NAME="Barrow"][ISO_A2="US"],
#populated_places[NAME="Nome"][ISO_A2="US"],
#populated_places[NAME="Washington, D.C."][ISO_A2="US"] {
  [SCALERANK<3][zoom>=4],
  [SCALERANK<=7][zoom>=5],
  [SCALERANK<=8][zoom>=6],
  [SCALERANK<=9][zoom>=7],
  [zoom>=8] { // show everything at this zoom
    marker-width:6;
    marker-fill:gray;
    marker-line-color:#333;
    marker-allow-overlap:true;
    marker-ignore-placement:true;

    text-name:[NAMEASCII];
    text-face-name: 'Arial Bold';
    text-size: 10;
    text-fill: #666;
    text-halo-radius: 2;
    text-halo-fill: #fff;
    text-allow-overlap: false;
    text-placement-type: simple;
    text-placements: "NE,E,SE";
    text-dx: 5;
    text-dy: 5;
    [LONGITUDE>-110] {
      text-placements: "W,NW,SW";
    }
    [NAMEASCII="Prince Rupert"],
    [NAMEASCII="Kitamaat"] {
      text-placements: "SE,E,NE";
    }
    [zoom>=7] {
      text-size: 12;
    }
    [zoom>=8] {
      text-size: 16;
    }
  }
}
