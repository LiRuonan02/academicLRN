 // var classify = require('users/liruonan02/forestTypeClassification:function/e_classify.js')
var classify = {} 
  // traingSample
  function trainRegion(trainSample,_trainImg){
    _trainImg = ee.Image(_trainImg)
    var training = _trainImg.sampleRegions({
      collection: trainSample,   
      properties: ['class'], 
      scale: 30,
      tileScale :16
    });
    return training;
  }

//  too  large code==3
 classify.RF = function(_trainImg,trainSample,region,nTrees,minLeaf){
  _trainImg = ee.Image(_trainImg);
  var bandsName = _trainImg.bandNames();
  
  nTrees = nTrees || 200;
  minLeaf = minLeaf || 3;
  nTrees = ee.Number(nTrees).int();
  minLeaf = ee.Number(minLeaf).int();

      var training = _trainImg.sampleRegions({
      collection: trainSample,   
      properties: ['class'], 
      scale: 30,
      tileScale :16
    });

  var season = _trainImg.getString("season").getInfo();
  
  var classifier = ee.Classifier.smileRandomForest({numberOfTrees:nTrees,minLeafPopulation:minLeaf})
                     .train({features: training,classProperty: 'class',inputProperties:bandsName});
    
  var classified = _trainImg.clipToCollection(region)
                            .classify(classifier)
                            .rename(season)
  return classified;
}


exports = classify;
