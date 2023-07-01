// Description: This file is used to read the shapefiles and convert it to csv file
import * as shapefile from "shapefile";
import * as fs from "fs";
import * as d3 from "d3";
import { stringify } from "csv-stringify/sync";

const allData = [];

// Recursively load shapefiles until all have been loaded 
// (avoids JavaScript heap out of memory error)
function loadShapefile(year) {
  const version = year === 2021 ? "20220624" : "20210810";
  const filename = `raw_data/nbac_${year}_r9_${version}`;
  shapefile.read(`${filename}.shp`, `${filename}.dbf`).then((result) => {
    const data = result.features.map((feature) => {
      const [x, y] = d3.geoCentroid(feature);
      return {
        ...feature.properties,
        x,
        y,
      };
    });
    allData.push(data);
    if (year < 2021) {
      loadShapefile(year + 1);
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

loadShapefile(1986);