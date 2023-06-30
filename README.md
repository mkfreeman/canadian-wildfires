# canadian-wildfires
Canadian wildfire data analysis

## Data 
Data was downloaded from [Natural Resources Canada](https://cwfis.cfs.nrcan.gc.ca/datamart/download/nbac). While they provide a single "combined" file from 1986 - 2021, that file was too large (1.5G) to process using command line tools, and obviously too large to host and work with on Observable.

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


To make [this map](https://observablehq.com/@mkfreeman/canadian-wildfires)