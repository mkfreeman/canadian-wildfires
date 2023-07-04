// Description: This file is used to read the shapefiles and convert it to csv file
import * as shapefile from "shapefile";
import * as fs from "fs";
// import * as proj4 from "proj4";
import proj4 from "proj4";
import * as d3 from "d3";
import { stringify } from "csv-stringify/sync";

const allData = [];

// Recursively load shapefiles until all have been loaded
// (avoids JavaScript heap out of memory error)
function loadShapefiles(startYear, endYear) {
  const version = startYear === 2021 ? "20220624" : "20210810";
  const filename = `raw_data/nbac_${startYear}_r9_${version}`;
  shapefile.read(`${filename}.shp`, `${filename}.dbf`).then((result) => {
    const data = result.features.map((feature) => {
      const projectedCoords = recurseProject(feature.geometry.coordinates);
      const [x, y] = d3.geoCentroid({
        type: feature.type,
        geometry: {
          type: feature.geometry.type,
          coordinates: recurseProject(feature.geometry.coordinates),
        },
      });
      return {
        ...feature.properties,
        x: +x.toFixed(1),
        y: +y.toFixed(1),
      };
    });
    allData.push(data);
    if (startYear < endYear) {
      loadShapefiles(startYear + 1, endYear);
    } else {
      fs.writeFileSync(
        "data/data.csv",
        stringify(allData.flat(), {
          header: true,
          cast: {
            date: d3.utcFormat("%Y-%m-%d"),
          },
        })
      );
    }
  });
}

const projString =
  "+proj=lcc +lat_0=49 +lon_0=-95 +lat_1=49 +lat_2=77 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs";
const wgs84 =
  "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";

// A function to recursively project coordinates in a geoJSON object
function recurseProject(coordsArr) {
  if (Array.isArray(coordsArr[0])) return coordsArr.map(recurseProject);
  return proj4(projString, wgs84, coordsArr); // project the coordinates from one projection to the other
}

loadShapefiles(1986, 2021);
