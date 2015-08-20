@non_eez_water: lighten(#a1c0c8, 15%);
@eez_water: white;
@background: @non_eez_water;

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
//#world_eez[Sovereign='Canada'],
//#world_eez[Sovereign='United States'] {
#world_eez {
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
  line-width:2;
  line-color:lighten(#168,10%);
  line-opacity:0.8;
  line-join: round;
  line-cap: round;
  polygon-fill: @eez_water;
}

.disputed {
  line-width:4.5;
  line-opacity: 0.7;
  line-color: white; // halo
  polygon-opacity:0.2;
  polygon-pattern-file: url("images/whitestripes_18.png");
  [zoom<=5] {
    line-width:3.5;
    polygon-pattern-file: url("images/whitestripes_12.png");
  }
  polygon-fill: lightgray;
  
  ::overlay {
    polygon-fill: transparent;
    polygon-opacity: 0;
    line-width:1.5;
    line-color: darken(#168,10%);
    line-opacity:0.6;
    [zoom<=5] {
      line-width:1;
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
    text-name:"Pacific\nOcean" + [namealt]; // we know namealt is empty
  }
  [name="NORTH ATLANTIC OCEAN"] {
    text-name:"Atlantic\nOcean" + [namealt];  // we know namealt is empty
  }
  [name="ARCTIC OCEAN"] {
    text-name:"Arctic\nOcean" + [namealt];  // we know namealt is empty
  }
  text-face-name: 'Nueva Std Italic';
  text-character-spacing: 4;
  text-size: 24;
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