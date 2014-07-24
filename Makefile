DATADIR := data
SHELL := /bin/bash

# To install the tilemill project
install:
	mkdir -p ${HOME}/Documents/MapBox/project
	ln -sf "`pwd`" ${HOME}/Documents/MapBox/project/moore

clean:
	rm -rf $(DATADIR)/*

datadir:
	test -d $(DATADIR) || mkdir $(DATADIR)

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

# This would only work if all zip files had the same internal directory structure
#$(DATADIR)/%.shp: $(DATADIR)/%.zip
#	unzip $< -d $(DATADIR) && \
#	touch $@