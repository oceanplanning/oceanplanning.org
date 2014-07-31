@non_eez_water: lighten(#e6eeee,5%);
@eez_water: white;

Map {
  background-color: @non_eez_water;
}

@non_na_land: #e4e4e4;
@na_land: lighten(#e4e4e4, 5%);
@na_borders: darken(#e4e4e4, 15%);

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

#worldeezv82014[Sovereign='Canada'],
#worldeezv82014[Sovereign='United States'] {
  ::glow_wide {
    line-width:20;
    line-color:#168;
    line-opacity:0.05;
  }
  ::glow_middle {
    line-width:10;
    line-color:#168;
    line-opacity:0.1;
  }
  ::glow {
    line-width:4;
    line-color:lighten(#168,10%);
    line-opacity:0.2;
  }
  line-width:0;
  line-color:#168;
  line-opacity:0.8;
  polygon-fill: @eez_water;
}

#populated_places[SCALERANK<2][zoom>=4],
#populated_places[SCALERANK<4][zoom>=6] {
  marker-width:6;
  marker-fill:gray;
  marker-line-color:#333;
  marker-allow-overlap:false;
  marker-ignore-placement:true;
  
  text-name:[NAMEASCII];
  text-face-name: 'Arial Bold';
  text-size: 10;
  text-fill: #666;
  text-halo-radius: 2;
  text-halo-fill: #fff;
  text-placement-type: simple;
  text-placements: "NE,E,SE,W,NW,SW";
  text-dx: 5;
  text-dy: 5;
  [LONGITUDE>-110] {
    text-placements: "W,NW,SW,NE,E,SE";
  }
}


