Map {
  background-color: #b8dee6;
}

#states_provinces {
  polygon-fill: #fff;
  ::outline {
    line-color: #85c5d3;
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

#usmaritimelimitsnbou {
  line-width:1;
  line-color:#168;
}

#populated_places[SCALERANK<2][zoom>=4],
#populated_places[SCALERANK<4][zoom>=6] {
  marker-width:6;
  marker-fill:gray;
  marker-line-color:#333;
  marker-allow-overlap:false;
  marker-ignore-placement:true;
  
  text-name:[NAME];
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
