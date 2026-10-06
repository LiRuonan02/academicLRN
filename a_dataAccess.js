
var dataAccess = {}  
// var startDate ='2014-01-01';
// var endDate = '2019-12-31';
// var startYear = ee.Date(startDate).get('year')
// var endYear = ee.Date(endDate).get('year')

/* Temperature data*/
  // data filter
dataAccess.monthTemperatureMean = function (startDate,endDate,region){
var regionCollection = ee.FeatureCollection(region);
var regionGeometry = regionCollection.geometry();
var lxCol = ee.ImageCollection('MODIS/006/MYD11A2')
                .select('LST_Day_1km')
                .filter(ee.Filter.date(startDate,endDate))
                .filterBounds(regionGeometry);
/* caculate monthly average temperature*/
var monthList = ee.List.sequence(1, 12);
var monthMean = ee.ImageCollection.fromImages(monthList.map(function(month){
  var tempCol = lxCol.filter(ee.Filter.calendarRange(month, ee.Number(month).add(1), 'month'));
    var img = tempCol.mean();
    img = img.set("month",month);
    return img;
})).map(function(img){
  img = img.clipToCollection(regionCollection)
 return img.multiply(0.02).subtract(273.15).float().copyProperties(img);
}).sort("month")

var mean = monthMean.toBands()

// rename the bandnames
var names = mean.bandNames();
var newNames = names.map(function(name){
  var ind = names.indexOf(name);
  var month = ee.String(ind.add(1))
  var newname = ee.String(names.get(ind)).slice(-11,-7);
  newname = newname.cat(month)
  return newname;
});
  mean= mean.rename(newNames).clipToBoundsAndScale({geometry:regionGeometry,scale:1000});
  return mean;
}

/* DEM data*/
 dataAccess.DEM = function(region){
   var srtm = ee.Image("USGS/SRTMGL1_003")//.clip(region.geometry());
   var slope = ee.Terrain.slope(srtm);
   var aspect = ee.Terrain.aspect(srtm);
   var DEM = srtm.addBands(slope).addBands(aspect).clipToBoundsAndScale({geometry:ee.FeatureCollection(region).geometry(),scale:30});
   return DEM;
 }
 
 /*Precipitation data*/
 dataAccess.monthPrecip = function(region){
   var precip = ee.Image("OpenLandMap/CLM/CLM_PRECIPITATION_SM2RAIN_M/v01")
                // .clip(region.geometry())
                .float()
                .clipToBoundsAndScale({geometry:ee.FeatureCollection(region).geometry(),scale:1000});
  return precip;
 }
 
exports = dataAccess;
