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
#populated_places[SCALERANK<2][zoom>=4],
#populated_places[SCALERANK<4][zoom>=6] {
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

/*
 *  Labels for marine features (currenly ocean only)
 */
#ne10mgeographymarine[featurecla="ocean"] {
  text-name:[name];
  text-face-name: 'Arial Bold';
  text-size: 20;
  text-fill: #666;
  text-halo-radius: 2;
  text-halo-fill: #fff;
  text-placement-type: simple;
  text-avoid-edges: true;
  text-allow-overlap: true;
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
