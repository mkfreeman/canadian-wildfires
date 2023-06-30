// Description: This file is used to read the shapefile and convert it to json file
import * as shapefile from "shapefile";
import * as fs from "fs";
import * as d3 from "d3";
import { stringify } from "csv-stringify/sync";

// Iterate from 1986 to 2021
const years = d3.range(1986, 1988);
const promises = [];
years.map((year) => {
  // Variation in file name for 2021
  const version = year === 2021 ? "20220624" : "20210810";
  const filename = `raw_data/nbac_${year}_r9_${version}`;
  promises.push(shapefile.read(`${filename}.shp`, `${filename}.dbf`));  
});

const dateFormat = d3.utcFormat("%Y-%m-%d");
// Write data array to csv file
Promise.all(promises).then((shapefiles) => {
  const data = shapefiles
    .map((file) =>
      file.features.map((feature) => {        
        const [x, y] = d3.geoCentroid(feature);
        return {        
          ...feature.properties,
          x, y,
        };
      })
    )
    .flat();
  fs.writeFileSync(
    "data/data.csv",
    stringify(data, {
      header: true,
      cast: {
        date: dateFormat,
      },
    })
  );
});
