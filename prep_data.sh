#!/bin/bash

# Make sure these are installed 
# npm install -g shapefile
# npm install -g ndjson-cli
# npm install -g @mapbox/geojson-merge

# Track number of fires per year
num_fires=()

# Folders to use
mkdir -p data
mkdir -p raw_data
# A quick variable to switch in case you need to download the data
download=true
# Iterate through available years
for i in {1986..2021}
do
   # Variation in file name for 2021
   version='20210810'
   if [ $i -eq 2021 ]; then
      version='20220624'
   fi   
   STUB='nbac_'$i'_r9_'$version

   # Download files
   if [ $download = true ]; then      
      curl 'https://cwfis.cfs.nrcan.gc.ca/downloads/nbac/'$STUB'.zip' --output $STUB''.zip
      unzip -o $STUB.zip
      for extension in .CPG .prj .sbx .sbn .shp.xml .shx .zip
         do
            rm $STUB''$extension
         done      
   fi
   
   # Couldn't figure out how to structure these steps with pipes....
   
   # Convert shapefile to geojson
   shp2json $STUB'.shp' -o nbac_geo.json
   
   # Quite redundant, but convert to ndjson to count the number of fires
   shp2json -n $STUB'.shp' -o nbac_ndgeo.json

   # Count the number of fires (stored separately in metadata)
   num_fires+=($(ndjson-reduce < nbac_ndgeo.json "p + 1" "0"))

   # Convert geojson to topojson
   geo2topo fires=nbac_geo.json > nbac_topo.json

   # Quantize values (remove unnecessary decimals in coordinates)
   topoquantize 1e5 < nbac_topo.json > nbac_quantized.json

   # Simplify
   toposimplify -s 10 -f < nbac_quantized.json > nbac_topo_simple.json

   # Merge all years into a single feature
   topomerge fires=fires < nbac_topo_simple.json -k $i -o nbac_merged.json

   # Convert back to geojson for Plotting
   topo2geo fires=- < nbac_merged.json > 'nbac_geo_'$i'.json'

done
# Clean up
rm nbac_geo.json
rm nbac_topo.json
rm nbac_topo_simple.json
rm nbac_quantized.json
rm nbac_merged.json
rm nbac_ndgeo.json

# Keeping .shp and .dbf in a sub-directory for later analysis
mv *.shp ./raw_data/
mv *.dbf ./raw_data/

# Merge into a single geojson file
geojson-merge ./nbac_geo*.json > fires_merged.json

# Now remove these .json files
for i in {1986..2021} 
   do
      rm nbac_geo_$i.json
   done

# Quantize the merged file to make it smaller (surprised this makes it smaller)
geo2topo fires=fires_merged.json > nbac_topo_TMP.json
topoquantize 1e5 < nbac_topo_TMP.json > nbac_quantized_TMP.json
topo2geo fires=- < nbac_quantized_TMP.json > data/fires.json

# Remove these "TMP" files: is this bad....?
ls | grep TMP | xargs rm 
rm fires_merged.json

# Save the metadata as a .csv file
file="data/metadata.csv"
echo '"year", "numFires"' > $file
for i in "${!num_fires[@]}"; do
  year=$((1986 + $i))
  printf '"%s","%s"\n' "${year}" "${num_fires[i]}"
done >> "$file"