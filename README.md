# canadian-wildfires
Canadian wildfire data analysis. Used to generate files for this
[map](https://observablehq.com/@mkfreeman/canadian-wildfires) and [this
analsis](https://observablehq.com/@mkfreeman/canadian-wildfire-stats).

## Data 
Data was downloaded from [Natural Resources Canada](https://cwfis.cfs.nrcan.gc.ca/datamart/download/nbac). While they provide a single "combined" file from 1986 - 2021, that file was too large (1.5G) to process using command line tools, and obviously too large to host and work with on Observable.


### Download and merge shapefiles
Run `sh prep_data.sh` to download and process the data. This may take ~10-15
minutes to complete depending on your internet connection. 

`prep_data.sh` is a schell script that downloads the data from NRCan, and then
processes it into a single geojson file. The steps are:

- Download the shapefiles
- Convert to geojson
- Convert to topojson (for simplification)
- Simplify the shapefiles to reduce their size
- Merge files into a single geojson file

Luckily, this [set of
tutorials](https:#medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c)
helped outline the necessary steps! Though it may have been better to just use a
node script, as I do for the later analysis.

### Extract features
Available features are described in [this
PDF](https://cwfis.cfs.nrcan.gc.ca/downloads/nbac/nbac_2020_r9_20210810.shp.pdf).
I'm assuming the features are the same for all years, but I haven't checked.

First, make sure to install necessary packages:
`npm install`

Then run `node extract_features.js` to extract features from the geojson files. This will create a file called `data/data.csv` that contains the features we want to analyze.

## Province boundaries
The province [shapefile.zip](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/files-fichiers/lpr_000b21a_e.zip) was downloaded from [statistics Canada](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index2021-eng.cfm?year=21). This file was also too large to process using command line tools, so was simplified using the UI tool [mapshaper](https://mapshaper.org/).
