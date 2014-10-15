@non_eez_water: lighten(#e6eeee,5%);
@eez_water: white;
@background: white;

Map {
  background-color: @background;
  [zoom > 5] {
    // By this point, nobody should pan over to the edge of the globe
    background-color: @non_eez_water;
  }
}

@non_na_land: #e4e4e4;
@na_land: lighten(#e4e4e4, 5%);
@na_borders: darken(#e4e4e4, 15%);

#ne10mgraticules10 {
  line-width:0.1;
  line-color:#168;
}

#land {
  ::outline {
    line-color: @na_borders;
    line-width: 2;
    [zoom<=6] {
      line-width: 1.5;
    }
    [zoom<=4] {
      line-width: 1;
    }
    line-join: round;
  }
  line-color: @non_na_land;
  line-width: 0.5;
  polygon-fill: @non_na_land;
}

#lakes {
  line-width:0;
  polygon-opacity:1;
  polygon-fill: @non_eez_water;
  [name_alt="Great Lakes"] {
    polygon-fill: @eez_water;
  }
}

/*
 *  Draw States and provinces for Canada and US only
 */
#states_provinces[iso_a2="US"],
#states_provinces[iso_a2="CA"]{
  polygon-fill: @na_land;
  ::outline {
    line-color: @na_borders;
    line-width: 2;
    [zoom<=6] {
      line-width: 1.5;
    }
    [zoom<=4] {
      line-width: 1;
    }
    line-join: round;
  }
}

/*
 *  Draw EEZs for Canada and US only
 */
#world_eez[Sovereign='Canada'],
#world_eez[Sovereign='United States'] {
  ::glow_wide {
    line-width:20;
    line-color:#168;
    line-opacity:0.05;
    line-join: round;
    line-cap: round;
  }
  ::glow_middle {
    line-width:10;
    line-color:#168;
    line-opacity:0.1;
    line-join: round;
    line-cap: round;
  }
  ::glow {
    line-width:4;
    line-color:lighten(#168,10%);
    line-opacity:0.2;
    line-join: round;
    line-cap: round;
  }
  line-width:0;
  line-color:#168;
  line-opacity:0.8;
  line-join: round;
  line-cap: round;
  polygon-fill: @eez_water;
}

/*
 *  City labels
 */
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
#populated_places[NAME="St. John's"][ISO_A2="CA"],
#populated_places[NAME="Vancouver"][ISO_A2="CA"],
#populated_places[NAME="Charleston"][ISO_A2="US"],
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
#populated_places[NAME="Washington"][ISO_A2="US"] {
  [SCALERANK<3][zoom>=4],
  [zoom>=5] {
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
    text-allow-overlap: true;
    text-placement-type: simple;
    text-placements: "NE,E,SE,W,NW,SW";
    text-dx: 5;
    text-dy: 5;
    [LONGITUDE>-110] {
      text-placements: "W,NW,SW,NE,E,SE";
    }
  }
}

/*
 *  Labels for marine features (currenly ocean only)
 *  (This needs a lot of help)
 */
#ne10mgeographymarine[featurecla="ocean"] {
  text-name:"";
  [name="NORTH PACIFIC OCEAN"] {
    text-name:"PACIFIC\nOCEAN" + [namealt]; // we know namealt is empty
  }
  [name="NORTH ATLANTIC OCEAN"] {
    text-name:"ATLANTIC\nOCEAN" + [namealt];  // we know namealt is empty
  }
  [name="ARCTIC OCEAN"] {
    text-name:"ARCTIC\nOCEAN" + [namealt];  // we know namealt is empty
  }
  text-face-name: 'Arial Bold';
  text-size: 20;
  text-fill: #666;
  text-halo-radius: 2;
  text-halo-fill: #fff;
  text-placement-type: simple;
  text-avoid-edges: false;
  text-allow-overlap: true;
  [zoom<=3] {
    text-size: 12;
  }
  [zoom<=2] {
    text-size: 8;
  }
}

/*
 *  Actually, use this point+radius to draw the disc of the earth
 *  (There's got to be a better way)
 */
#centerpoint[zoom<=5] {
  // Guessed theses through trial-and-error
  marker-width: 650;
  [zoom=3] { marker-width: 1300; }
  [zoom=4] { marker-width: 2600; }
  [zoom=5] { marker-width: 5200; }
  marker-fill: @non_eez_water;
  marker-line-color:#813;
  marker-line-width:0;
  marker-allow-overlap: true;
}
