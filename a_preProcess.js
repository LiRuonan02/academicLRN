 
var preProcess = {} 

/* Scale 0.0001 */
preProcess.scale = function(img){
  img = img.float()
  var _img = img.multiply(0.0001).float();
  return _img.copyProperties(img);
}

/* add Time Property to image*/
preProcess.addTimeProperty = function(img) {
    var time = img.get('system:time_start');
    return img.set('time', time);
}

preProcess.maskL8sr = function (image) {
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .or(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

/**
 * Add seasonal informarion for every image
 *  spring:3,4,5; summer:6,7,8; autumn:9,10,11;winter:12,1,2
 **/
preProcess.addSeasonProb = function (img){
    var date = ee.String(img.get('DATE_ACQUIRED'));
    var month = ee.Number.parse(date.slice(5, 7));
    var year = date.slice(0, 4);
    var season;

    /**traditional seasons*/
    season = ee.Algorithms.If(month.lte(2), ee.String("winter"), season);
    season = ee.Algorithms.If(month.gte(3).and(month.lte(5)), ee.String("spring"), season);
    season = ee.Algorithms.If(month.gte(6).and(month.lte(8)), ee.String("summer"), season);
    season = ee.Algorithms.If(month.gte(9).and(month.lte(11)),ee.String("autumn"), season);
    season = ee.Algorithms.If(month.gte(12), ee.String("winter"), season);

    return img.set('season', season)
              .set('Year', year)
              .set('Month', month.format("%02d"))
              .set('YearMonth', date.slice(0, 7));
}

preProcess.vegIndices = function(img){
  var ndvi = img.normalizedDifference(["nir","red"]).select([0],['NDVI']);
  var lswi = img.normalizedDifference(["nir","swir1"]).select([0],['LSWI']);
  var nbr2 = img.normalizedDifference(["swir1","swir2"]).select([0],['NBR2']);
  var evi = img.expression(
    '2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))', {
      'nir': img.select('nir'),
      'red': img.select('red'),
      'blue': img.select('blue')
      }).float().select([0],["EVI"]);
  var savi = img.expression(
    '(nir-red) * (1+0.8) / (nir + red +0.8)',{
      'nir': img.select('nir'),
      'red': img.select('red'),
    }).float().select([0],["SAVI"]);
  
  img = img.addBands(ndvi)
           .addBands(evi)
           .addBands(savi)
           .addBands(nbr2)
           .addBands(lswi);
  return img;
}

/* Calculate NIR+SWIR1*/
preProcess.nir_swir1 = function(img){
  var nir_swir = img.expression('nir + swir1', {'nir': img.select('nir'), 'swir1': img.select('swir1')})
                   .float()
                   .select([0],["nir_swir1"]);
  return img.addBands(nir_swir);
}

preProcess.main = function(start,end,region,setName){
  setName = setName || "bands"
  var regionCollection = ee.FeatureCollection(region);
  var regionGeometry = regionCollection.geometry();
  var bandNames = ee.List(["blue","green","red","nir","swir1","swir2"]);
  var sensor_band_dict =ee.Dictionary({
                        L8 : ee.List([1,2,3,4,5,6])
  });
 var col = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
           .filterBounds(regionGeometry)
           .filterDate(start,end)
           .map(preProcess.addTimeProperty)
           .map(preProcess.maskL8sr)
           .select(sensor_band_dict.get('L8'),bandNames)
           .map(preProcess.scale)
           .map(preProcess.nir_swir1)

  if (setName === "index"){
    col = col.map(preProcess.vegIndices)
             .select(["NDVI","EVI","SAVI","NBR2","LSWI"])
  }
  col = col.map(preProcess.addSeasonProb);
  return col;
}

exports = preProcess;
