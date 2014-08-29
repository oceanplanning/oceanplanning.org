DATADIR := data
JSONDIR := geojson
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
	ln -sf "`pwd`" ${HOME}/Documents/MapBox/project/moore

clean:
	rm -rf $(DATADIR)/*

datadir:
	test -d $(DATADIR) || mkdir $(DATADIR)

jsondir:
	test -d $(JSONDIR) || mkdir $(JSONDIR)

# The unchanging base data for context:

basedata: datadir $(DATADIR)/ne_10m_admin_1_states_provinces_lakes.shp $(DATADIR)/ne_10m_land_scale_rank.shp $(DATADIR)/ne_10m_populated_places.shp $(DATADIR)/ne_10m_geography_marine_polys.shp $(DATADIR)/ne_10m_ocean.shp

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

# The EEZ and protected area data:

geojson: jsondir data $(JSONDIR)/us_eez.geojson $(JSONDIR)/canada_eez.geojson $(JSONDIR)/ma_coastalzone.geojson $(JSONDIR)/ri_coastalzone.geojson $(JSONDIR)/bc_mapp_subregions.geojson $(JSONDIR)/bc_wcvi.geojson $(JSONDIR)/bc_pncima.geojson $(JSONDIR)/hi_humpback_sanctuary.geojson

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

### British Columbia MaPP_subregions
$(JSONDIR)/bc_mapp_subregions.geojson: $(DATADIR)/MaPP_subregions/mapp_subregions_jan2013.shp
	ogr2ogr -t_srs "EPSG:4326" $(DATADIR)/bc_mapp_subregions_4326.shp $< && \
	ogr2ogr -clipsrc $(DATADIR)/ne_10m_ocean.shp $(DATADIR)/bc_mapp_subregions_clipped.shp $(DATADIR)/bc_mapp_subregions_4326.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "British Columbia MaPP Subregions" as name, * FROM bc_mapp_subregions_clipped' $@ $(DATADIR)/bc_mapp_subregions_clipped.shp

### British Columbia West Coast Vancouver Island
$(JSONDIR)/bc_wcvi.geojson: $(DATADIR)/WCVI_AMB_Boundary_Union/AMB_Boundary_Union.shp
	ogr2ogr -t_srs "EPSG:4326" $(DATADIR)/bc_wcvi_4326.shp $< && \
	ogr2ogr -clipsrc $(DATADIR)/ne_10m_ocean.shp $(DATADIR)/bc_wcvi_clipped.shp $(DATADIR)/bc_wcvi_4326.shp && \
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "British Columbia West Coast Vancouver Island" as name, * FROM bc_wcvi_clipped' $@ $(DATADIR)/bc_wcvi_clipped.shp

### British Columbia PNCIMA
$(JSONDIR)/bc_pncima.geojson: $(DATADIR)/PNCIMA/pncimabndy_inlets071031.shp
	ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" -sql 'SELECT "British Columbia PNCIMA" as name, * FROM pncimabndy_inlets071031' $@ $<

### Massachusetts
$(DATADIR)/ma-coastal-zone-boundary-2012.zip:
	curl -sL http://www.mass.gov/eea/docs/czm/fcr-regs/ma-coastal-zone-boundary-2012.zip -o $@

# The unzip generates an error, prepend a '-' to ignore it
$(DATADIR)/MA_Coastal_Zone/MA_Coastal_Zone.shp: $(DATADIR)/ma-coastal-zone-boundary-2012.zip
	-unzip $< -d $(DATADIR) && \
	touch $@

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

# This would only work if all zip files had the same internal directory structure
#$(DATADIR)/%.shp: $(DATADIR)/%.zip
#	unzip $< -d $(DATADIR) && \
#	touch $@