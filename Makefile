DATADIR := data
JSONDIR := assets/geojson
TOPOJSON := /usr/local/bin/topojson
SHELL := /bin/bash
DATED=$(shell date '+%Y-%m-%d')

latest:
	ssh studio.stamen.com "cd /var/www/com.stamen.studio/moore/show/latest && git pull"

dated-latest:
	ssh studio.stamen.com "cd /var/www/com.stamen.studio/moore/show \
	&& mkdir -p $(DATED) \
	&& cp -r latest/* $(DATED)"

# To install the tilemill project
install:
	mkdir -p ${HOME}/Documents/MapBox/project
	cd tilemill_lowzoom && ln -sf "`pwd`" ${HOME}/Documents/MapBox/project/moore_lowzoom && ln -sf ../data
	cd tilemill_highzoom && ln -sf "`pwd`" ${HOME}/Documents/MapBox/project/moore_highzoom && ln -sf ../tilemill_lowzoom/style.mss && ln -sf ../tilemill_lowzoom/images && ln -sf ../data
	cd tilemill_highzoom_labels && ln -sf "`pwd`" ${HOME}/Documents/MapBox/project/moore_highzoom_labels && ln -sf ../tilemill_lowzoom/images && ln -sf ../data

clean:
	rm -rf $(DATADIR)/*

datadir:
	test -d $(DATADIR) || mkdir $(DATADIR)

jsondir:
	test -d $(JSONDIR) || mkdir $(JSONDIR)

# The unchanging base data for context:

basedata: datadir $(DATADIR)/ne_10m_admin_1_states_provinces_lakes.shp $(DATADIR)/ne_10m_land_scale_rank.shp $(DATADIR)/ne_10m_populated_places.shp $(DATADIR)/ne_10m_geography_marine_polys.shp $(DATADIR)/ne_10m_ocean.shp $(DATADIR)/ne_10m_lakes.shp $(DATADIR)/ne_10m_graticules_10.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp

$(DATADIR)/ne_10m_admin_1_states_provinces_lakes.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_1_states_provinces_lakes.zip -o $@

$(DATADIR)/ne_10m_admin_1_states_provinces_lakes.shp: $(DATADIR)/ne_10m_admin_1_states_provinces_lakes.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/ne_10m_land_scale_rank.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_land_scale_rank.zip -o $@

$(DATADIR)/ne_10m_land_scale_rank.shp: $(DATADIR)/ne_10m_land_scale_rank.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/ne_10m_lakes.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_lakes.zip -o $@

$(DATADIR)/ne_10m_lakes.shp: $(DATADIR)/ne_10m_lakes.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/ne_10m_populated_places.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_populated_places.zip -o $@

$(DATADIR)/ne_10m_populated_places.shp: $(DATADIR)/ne_10m_populated_places.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/ne_10m_geography_marine_polys.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_geography_marine_polys.zip -o $@

$(DATADIR)/ne_10m_geography_marine_polys.shp: $(DATADIR)/ne_10m_geography_marine_polys.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/ne_10m_ocean.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_ocean.zip -o $@

$(DATADIR)/ne_10m_ocean.shp: $(DATADIR)/ne_10m_ocean.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/ne_10m_graticules_10.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_graticules_10.zip -o $@

$(DATADIR)/ne_10m_graticules_10.shp: $(DATADIR)/ne_10m_graticules_10.zip
	unzip $< -d $(DATADIR) && \
	touch $@

# Unfortunately I have no source for the disputed areas, so I will create approximations by intersecting some Canadian planning areas with the Alaskan EEZ from the World EEZ file (which shows the US claims). 

disputed: $(DATADIR)/disputed_dixon_entrance.shp $(DATADIR)/disputed_beaufort_sea.shp

$(DATADIR)/disputed_dixon_entrance.shp: $(DATADIR)/PNCIMA/pncimabndy_inlets071031.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp 
	ogr2ogr -t_srs "EPSG:4326" -clipdst $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp -clipdstwhere "Country = 'Alaska'" $@ $(DATADIR)/PNCIMA/pncimabndy_inlets071031.shp

$(DATADIR)/disputed_beaufort_sea.shp: $(DATADIR)/LOMA_Shapefiles/LOMA_Beaufort_Sea.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp 
	ogr2ogr -t_srs "EPSG:4326" -clipdst $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp -clipdstwhere "Country = 'Alaska'" $@ $(DATADIR)/LOMA_Shapefiles/LOMA_Beaufort_Sea.shp

# rule to project any shapefile into Lambert Azimuthal Equal Area
%_laea.shp: %.shp
	ogr2ogr --config SHAPE_ENCODING WINDOWS-1252 --config OGR_ENABLE_PARTIAL_REPROJECTION TRUE -t_srs '+proj=laea +lat_0=40 +lon_0=-105 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs' $@ $<

basedatalaea: basedata $(DATADIR)/ne_10m_admin_1_states_provinces_lakes_laea.shp $(DATADIR)/ne_10m_land_scale_rank_laea.shp $(DATADIR)/ne_10m_populated_places_laea.shp $(DATADIR)/ne_10m_geography_marine_polys_laea.shp $(DATADIR)/ne_10m_ocean_laea.shp $(DATADIR)/ne_10m_lakes_laea.shp $(DATADIR)/ne_10m_graticules_10_laea.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014_laea.shp

# The EEZ and protected area data:

geojson: jsondir \
$(JSONDIR)/ma_coastalzone.geojson \
$(JSONDIR)/ri_coastalzone.geojson \
$(JSONDIR)/bc_mapp_haida_gwaii.geojson \
$(JSONDIR)/bc_mapp_north_coast.geojson \
$(JSONDIR)/bc_mapp_central_coast.geojson \
$(JSONDIR)/bc_mapp_north_vancouver_island.geojson \
$(JSONDIR)/bc_wcvi.geojson \
$(JSONDIR)/bc_pncima.geojson \
$(JSONDIR)/hi_humpback_sanctuary.geojson \
$(JSONDIR)/LOMA_Beaufort_Sea.geojson \
$(JSONDIR)/LOMA_Eastern_Scotian_Shelf.geojson \
$(JSONDIR)/LOMA_Gulf_of_Saint_Lawrence.geojson \
$(JSONDIR)/LOMA_Pacific_North_Coast.geojson \
$(JSONDIR)/LOMA_Placentia_Bay___Grand_Banks.geojson \
$(JSONDIR)/NLUP_Boundary.geojson \
$(JSONDIR)/florida_keys.geojson \
$(JSONDIR)/oregon.geojson \
$(JSONDIR)/great_lakes.geojson \
$(JSONDIR)/pacific_islands.geojson \
$(JSONDIR)/us_caribbean.geojson \
$(JSONDIR)/us_west_coast.geojson \
$(JSONDIR)/washington_state.geojson \
$(JSONDIR)/south_atlantic.geojson \

# Create topojson file. -q is quantization, -p means preserve all properties

topojson:
	$(TOPOJSON) -q 60000 --simplify-proportion 0.7 -p -o $(JSONDIR)/planning_areas.topojson \
$(JSONDIR)/ma_coastalzone.geojson \
$(JSONDIR)/ri_coastalzone.geojson \
$(JSONDIR)/bc_mapp_haida_gwaii.geojson \
$(JSONDIR)/bc_mapp_north_coast.geojson \
$(JSONDIR)/bc_mapp_central_coast.geojson \
$(JSONDIR)/bc_mapp_north_vancouver_island.geojson \
$(JSONDIR)/bc_wcvi.geojson \
$(JSONDIR)/bc_pncima.geojson \
$(JSONDIR)/hi_humpback_sanctuary.geojson \
$(JSONDIR)/LOMA_Beaufort_Sea.geojson \
$(JSONDIR)/LOMA_Eastern_Scotian_Shelf.geojson \
$(JSONDIR)/LOMA_Gulf_of_Saint_Lawrence.geojson \
$(JSONDIR)/LOMA_Pacific_North_Coast.geojson \
$(JSONDIR)/LOMA_Placentia_Bay___Grand_Banks.geojson \
$(JSONDIR)/NLUP_Boundary.geojson \
$(JSONDIR)/florida_keys.geojson \
$(JSONDIR)/oregon.geojson \
$(JSONDIR)/great_lakes.geojson \
$(JSONDIR)/pacific_islands.geojson \
$(JSONDIR)/us_caribbean.geojson \
$(JSONDIR)/us_west_coast.geojson \
$(JSONDIR)/washington_state.geojson \
$(JSONDIR)/south_atlantic.geojson \




data: datadir $(DATADIR)/USMaritimeLimitsNBoundaries.shp $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions.shp $(DATADIR)/MA_Coastal_Zone/MA_Coastal_Zone.shp $(DATADIR)/mbounds_samp.shp

$(JSONDIR)/us_eez.geojson: $(DATADIR)/USMaritimeLimitsNBoundaries.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $<

$(DATADIR)/USMaritimeLimitsAndBoundariesSHP.zip:
	curl -sL http://maritimeboundaries.noaa.gov/downloads/USMaritimeLimitsAndBoundariesSHP.zip -o $@

# The changed spelling of "And" to "N" is not a typo. That's what's in the zip file.
$(DATADIR)/USMaritimeLimitsNBoundaries.shp: $(DATADIR)/USMaritimeLimitsAndBoundariesSHP.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/CoastalZoneManagementActBoundary.zip:
	curl -sL ftp://ftp.csc.noaa.gov/pub/MSP/CoastalZoneManagementActBoundary.zip -o $@

# This one is a gdb
#$(DATADIR)/CoastalZoneManagementActBoundary.shp: $(DATADIR)/CoastalZoneManagementActBoundary.zip
# TODO: continue here

### US fisheries regions

$(DATADIR)/NationalMarineFisheriesServiceRegions.zip:
	curl -sL http://csc.noaa.gov/htdata/CMSP/FederalGeoregulations/NationalMarineFisheriesServiceRegions.zip -o $@

# Respect the unnecessary subdirectories for now
$(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions.shp: $(DATADIR)/NationalMarineFisheriesServiceRegions.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions_4326.shp: $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions.shp
	ogr2ogr -t_srs "EPSG:4326" $@ $< && \


### British Columbia MaPP_subregions

### Haida Gwaii
$(JSONDIR)/bc_mapp_haida_gwaii.geojson: $(DATADIR)/MaPP_subregions/HaidaGwaii_Marine_Area_EstuaryCorrected.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Haida Gwaii - MaPP" as name, * FROM HaidaGwaii_Marine_Area_EstuaryCorrected' $@ $<

### BC North Coast
$(JSONDIR)/bc_mapp_north_coast.geojson: $(DATADIR)/MaPP_subregions/NorthCoast_Marine_Area_EstuaryCorrected.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "North Coast - MaPP" as name, * FROM NorthCoast_Marine_Area_EstuaryCorrected' $@ $<

### BC Central Coast
$(JSONDIR)/bc_mapp_central_coast.geojson: $(DATADIR)/MaPP_subregions/CentralCoast_Marine_Area_EstuaryCorrected.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Central Coast - MaPP" as name, * FROM CentralCoast_Marine_Area_EstuaryCorrected' $@ $<

### BC North Vancouver Island
$(JSONDIR)/bc_mapp_north_vancouver_island.geojson: $(DATADIR)/MaPP_subregions/NorthVancouverIsland_Marine_Area_EstuaryCorrected.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "North Vancouver Island - MaPP" as name, * FROM NorthVancouverIsland_Marine_Area_EstuaryCorrected' $@ $<

### British Columbia West Coast Vancouver Island
$(JSONDIR)/bc_wcvi.geojson: $(DATADIR)/WCVI_AMB_Boundary_Union/AMB_Boundary_Union.shp
	ogr2ogr -t_srs "EPSG:4326" $(DATADIR)/bc_wcvi_4326.shp $< && \
	ogr2ogr -clipsrc $(DATADIR)/ne_10m_ocean.shp $(DATADIR)/bc_wcvi_clipped.shp $(DATADIR)/bc_wcvi_4326.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "British Columbia West Coast Vancouver Island" as name, * FROM bc_wcvi_clipped' $@ $(DATADIR)/bc_wcvi_clipped.shp

### British Columbia PNCIMA
$(JSONDIR)/bc_pncima.geojson: $(DATADIR)/PNCIMA/PNCIMA_with_watersheds_BCalb.shp
	ogr2ogr -t_srs "EPSG:4326" $(DATADIR)/PNCIMA/pncima_4326.shp $< && \
	ogr2ogr -clipsrc $(DATADIR)/ne_10m_ocean.shp $(DATADIR)/PNCIMA/pncima_clipped.shp $(DATADIR)/PNCIMA/pncima_4326.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "British Columbia PNCIMA" as name, * FROM pncima_clipped' $@ $(DATADIR)/PNCIMA/pncima_clipped.shp

### Massachusetts
#$(DATADIR)/ma-coastal-zone-boundary-2012.zip:
	#curl -sL http://www.mass.gov/eea/docs/czm/fcr-regs/ma-coastal-zone-boundary-2012.zip -o $@

# The unzip generates an error, prepend a '-' to ignore it
#$(DATADIR)/MA_Coastal_Zone/MA_Coastal_Zone.shp: $(DATADIR)/ma-coastal-zone-boundary-2012.zip
	#-unzip $< -d $(DATADIR) && \
	#touch $@

$(JSONDIR)/ma_coastalzone.geojson: $(DATADIR)/MA_Coastal_Zone/MA_Coastal_Zone.shp
	ogr2ogr -t_srs "EPSG:4326" $(DATADIR)/ma_coastalzone_4326.shp $< && \
	ogr2ogr -clipsrc $(DATADIR)/ne_10m_ocean.shp $(DATADIR)/ma_coastalzone_clipped.shp $(DATADIR)/ma_coastalzone_4326.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Massachusetts" as name, * FROM ma_coastalzone_clipped' $@ $(DATADIR)/ma_coastalzone_clipped.shp

### Rhode Island
$(DATADIR)/mbounds_samp.zip:
	curl -sL http://www.narrbay.org/d_projects/OceanSAMP/Downloads/mbounds_samp.zip -o $@

$(DATADIR)/mbounds_samp.shp: $(DATADIR)/mbounds_samp.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(JSONDIR)/ri_coastalzone.geojson: $(DATADIR)/mbounds_samp.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Rhode Island" as name, * FROM mbounds_samp' $@ $<

### Hawaii
$(DATADIR)/hihwnms_py2.zip:
	curl -sL http://sanctuaries.noaa.gov/library/imast/hihwnms_py2.zip -o $@

$(DATADIR)/hihwnms_py.shp: $(DATADIR)/hihwnms_py2.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(JSONDIR)/hi_humpback_sanctuary.geojson: $(DATADIR)/hihwnms_py.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Hawaii" as name, * FROM hihwnms_py' $@ $<

### Canada EEZ
$(JSONDIR)/canada_eez.geojson: $(DATADIR)/canada_eez.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $<

# TODO: source for Canadian EEZ. I downloaded from here: http://www.marineregions.org/gazetteer.php?p=details&id=8493

### Beaufort Sea
### Data comes from LOMA_Shapefiles.zip (Canada)
$(JSONDIR)/LOMA_Beaufort_Sea.geojson: $(DATADIR)/LOMA_Shapefiles/LOMA_Beaufort_Sea.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $<

### Eastern Scotian Shelf
### Data comes from LOMA_Shapefiles.zip (Canada)
$(JSONDIR)/LOMA_Eastern_Scotian_Shelf.geojson: $(DATADIR)/LOMA_Shapefiles/LOMA_Eastern_Scotian_Shelf_Updated.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $<

### Gulf of Saint Lawrence
### Data comes from LOMA_Shapefiles.zip (Canada)
$(JSONDIR)/LOMA_Gulf_of_Saint_Lawrence.geojson: $(DATADIR)/LOMA_Shapefiles/LOMA_Gulf_of_Saint_Lawrence.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $<

### Pacific North Coast
### Data comes from LOMA_Shapefiles.zip (Canada)
$(JSONDIR)/LOMA_Pacific_North_Coast.geojson: $(DATADIR)/LOMA_Shapefiles/LOMA_Pacific_North_Coast.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $<

### Placentia Bay / Grand Banks
### Data comes from LOMA_Shapefiles.zip (Canada)
$(JSONDIR)/LOMA_Placentia_Bay___Grand_Banks.geojson: $(DATADIR)/LOMA_Shapefiles/LOMA_Placentia_Bay___Grand_Banks.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $<

### Nunavut
### NOTE, this data does not come from LOMA_Shapefiles.zip. From NLUP_Boundary.zip (Canada)
$(JSONDIR)/NLUP_Boundary.geojson: $(DATADIR)/NLUP_Boundary/NLUP_Boundary.shp $(DATADIR)/ne_10m_lakes.shp
	ogr2ogr -t_srs "EPSG:4326" $(DATADIR)/NLUP_Boundary/NLUP_Boundary_4326.shp $< && \
	ogr2ogr $(DATADIR)/NLUP_Boundary/NLUP_Boundary_4326_dissolved.shp $(DATADIR)/NLUP_Boundary/NLUP_Boundary_4326.shp -dialect sqlite -sql "SELECT ST_union(Geometry),'Nunavut' as name from NLUP_Boundary_4326 group by name" && \
	ogr2ogr -clipsrc $(DATADIR)/ne_10m_ocean.shp $(DATADIR)/NLUP_Boundary/NLUP_Boundary_4326_clipped.shp $(DATADIR)/NLUP_Boundary/NLUP_Boundary_4326_dissolved.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $(DATADIR)/NLUP_Boundary/NLUP_Boundary_4326_clipped.shp

### Florida keys
$(DATADIR)/fknms_py2.zip:
	curl -sL http://sanctuaries.noaa.gov/library/imast/fknms_py2.zip -o $@

$(DATADIR)/fknms_py.shp: $(DATADIR)/fknms_py2.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(JSONDIR)/florida_keys.geojson: $(DATADIR)/fknms_py.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Florida Keys" as name, * FROM fknms_py' $@ $<

### Oregon
$(DATADIR)/BASE_Territorial_Sea_Polygon_ESIshoreline.zip:
	curl -sL 'http://www.oregonocean.info/index.php?option=com_docman&task=doc_download&gid=819&Itemid=19' -o $@

$(DATADIR)/BASE_Territorial_Sea_Polygon_ESIshoreline.shp: $(DATADIR)/BASE_Territorial_Sea_Polygon_ESIshoreline.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(JSONDIR)/oregon.geojson: $(DATADIR)/BASE_Territorial_Sea_Polygon_ESIshoreline.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Oregon" as name, * FROM BASE_Territorial_Sea_Polygon_ESIshoreline' $@ $<

### Great Lakes
$(JSONDIR)/great_lakes.geojson: $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions_4326.shp $(DATADIR)/ne_10m_lakes.shp
	ogr2ogr $(DATADIR)/NationalMarineFisheriesServiceRegions/great_lakes_dissolved.shp $(DATADIR)/ne_10m_lakes.shp -dialect sqlite -sql "SELECT ST_union(Geometry),name_alt from ne_10m_lakes where name_alt = 'Great Lakes' group by name_alt" && \
	ogr2ogr -clipsrc $(DATADIR)/NationalMarineFisheriesServiceRegions/great_lakes_dissolved.shp $(DATADIR)/NationalMarineFisheriesServiceRegions/great_lakes_clipped.shp -clipdstwhere "Region = Northeast" $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions_4326.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $(DATADIR)/NationalMarineFisheriesServiceRegions/great_lakes_clipped.shp

### Pacific Islands
$(JSONDIR)/pacific_islands.geojson: $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions_4326.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp
	ogr2ogr $(DATADIR)/NationalMarineFisheriesServiceRegions/pacific_islands_dissolved.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp -dialect sqlite -sql "SELECT ST_union(Geometry),Sovereign from World_EEZ_v8_2014 where Country = 'Wake Island' or Country = 'Northern Mariana Islands and Guam' or Country = 'Johnston Atoll' or Country = 'Howland Island and Baker Island' or Country = 'Palmyra Atoll' or Country = 'Jarvis Island' or Country = 'American Samoa' or Country = 'Hawaii' group by Sovereign" && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $(DATADIR)/NationalMarineFisheriesServiceRegions/pacific_islands_dissolved.shp

### US Caribbean
$(JSONDIR)/us_caribbean.geojson: $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions_4326.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp
	ogr2ogr $(DATADIR)/NationalMarineFisheriesServiceRegions/us_caribbean_dissolved.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp -dialect sqlite -sql "SELECT ST_union(Geometry),Sovereign from World_EEZ_v8_2014 where Country = 'Puerto Rico' or Country = 'Virgin Islands of the United States' group by Sovereign" && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $(DATADIR)/NationalMarineFisheriesServiceRegions/us_caribbean_dissolved.shp

### US West Coast
$(JSONDIR)/us_west_coast.geojson: $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions_4326.shp $(DATADIR)/ne_10m_ocean.shp
	ogr2ogr -clipsrc -130 25 -115 50 $(DATADIR)/NationalMarineFisheriesServiceRegions/us_west_coast_clipped.shp $(DATADIR)/World_EEZ_v8_20140228_LR/World_EEZ_v8_2014.shp && \
	ogr2ogr -where "EEZ_ID='163'" $(DATADIR)/NationalMarineFisheriesServiceRegions/us_west_coast_extracted.shp $(DATADIR)/NationalMarineFisheriesServiceRegions/us_west_coast_clipped.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" $@ $(DATADIR)/NationalMarineFisheriesServiceRegions/us_west_coast_extracted.shp

### Washington State
$(JSONDIR)/washington_state.geojson: $(DATADIR)/WA_state_MSP/WA_state_MSP.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "Washington State" as name, * FROM WA_state_MSP' $@ $<

### South Atlantic
$(DATADIR)/sa_eez_off_states.zip:
	curl -sL 'http://sero.nmfs.noaa.gov/maps_gis_data/fisheries/s_atlantic/geodata/sa_eez_off_states.zip' -o $@

$(DATADIR)/SA_EEZ_off_states.shp: $(DATADIR)/sa_eez_off_states.zip
	unzip $< -d $(DATADIR) && \
	touch $@

# Note, here we add a buffer of 0.001 degrees so our union doesn't have slivers
$(JSONDIR)/south_atlantic.geojson: $(DATADIR)/SA_EEZ_off_states.shp
	ogr2ogr $(DATADIR)/sa_eez_off_states_dissolved.shp $(DATADIR)/SA_EEZ_off_states.shp -dialect sqlite -sql "SELECT ST_union(ST_buffer(Geometry,0.001)),'South Atlantic' as name from SA_EEZ_off_states group by name" && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT * FROM sa_eez_off_states_dissolved' $@ $(DATADIR)/sa_eez_off_states_dissolved.shp

