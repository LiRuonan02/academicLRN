 
var kappa = {}

 kappa.confustionMatrix = function(classified,testSample){
   // confusion matrix 
    var validData = classified.sampleRegions({
    collection: testSample, 
    properties: ['class'],
    scale: 30});
    var id = classified.getString('id');
  var errorMatrix = validData.errorMatrix('class', 'classification');
  
  print(
  "errorMatrix",errorMatrix.array(),
  "UA",errorMatrix.consumersAccuracy(),
  "PA", errorMatrix.producersAccuracy(),
  "KAP", errorMatrix.kappa(),
  "OA", errorMatrix.accuracy())
  
  var accuracyTable =ee.FeatureCollection([
    ee.Feature(null,{
  "errorMatrix":errorMatrix.array(),
  "UA": errorMatrix.consumersAccuracy().project([1]),
  "PA": errorMatrix.producersAccuracy().project([0]),
  "KAP": errorMatrix.kappa(),
  "OA": errorMatrix.accuracy(),
    }).set("id",id)]);
  return accuracyTable;
}

exports = kappa;
