DATADIR := data
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

# The unchanging base data for context:

basedata: datadir $(DATADIR)/ne_10m_admin_1_states_provinces_lakes.shp $(DATADIR)/ne_10m_land_scale_rank.shp $(DATADIR)/ne_10m_populated_places.shp

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

$(DATADIR)/ne_10m_populated_places.zip:
	curl -sL http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_populated_places.zip -o $@

$(DATADIR)/ne_10m_populated_places.shp: $(DATADIR)/ne_10m_populated_places.zip
	unzip $< -d $(DATADIR) && \
	touch $@

# The EEZ and protected area data:

data: datadir $(DATADIR)/USMaritimeLimitsNBoundaries.shp $(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions.shp $(DATADIR)/MA_Coastal_Zone/MA_Coastal_Zone.shp $(DATADIR)/mbounds_samp.shp

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

$(DATADIR)/NationalMarineFisheriesServiceRegions.zip:
	curl -sL http://csc.noaa.gov/htdata/CMSP/FederalGeoregulations/NationalMarineFisheriesServiceRegions.zip -o $@

# Respect the unnecessary subdirectories for now
$(DATADIR)/NationalMarineFisheriesServiceRegions/NationalMarineFisheriesServiceRegions.shp: $(DATADIR)/NationalMarineFisheriesServiceRegions.zip
	unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/ma-coastal-zone-boundary-2012.zip:
	curl -sL http://www.mass.gov/eea/docs/czm/fcr-regs/ma-coastal-zone-boundary-2012.zip -o $@

# The unzip generates an error, prepend a '-' to ignore it
$(DATADIR)/MA_Coastal_Zone/MA_Coastal_Zone.shp: $(DATADIR)/ma-coastal-zone-boundary-2012.zip
	-unzip $< -d $(DATADIR) && \
	touch $@

$(DATADIR)/mbounds_samp.zip:
	curl -sL http://www.narrbay.org/d_projects/OceanSAMP/Downloads/mbounds_samp.zip -o $@

$(DATADIR)/mbounds_samp.shp: $(DATADIR)/mbounds_samp.zip
	unzip $< -d $(DATADIR) && \
	touch $@

# TODO: source for Canadian EEZ. I downloaded from here: http://www.marineregions.org/gazetteer.php?p=details&id=8493

# This would only work if all zip files had the same internal directory structure
#$(DATADIR)/%.shp: $(DATADIR)/%.zip
#	unzip $< -d $(DATADIR) && \
#	touch $@