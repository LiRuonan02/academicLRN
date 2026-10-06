
var minCloudImgSelect = require("users/liruonan02/forestTypeClassification:function/b_minCloudImgSelect.js")
var preProcess = require("users/liruonan02/forestTypeClassification:function/a_preProcess.js");
var seasonImg = {}; 


/* single season image  */
/**initial single img median**/
seasonImg.ssImg = function(region,start,end,season,setName){
    /** spectral reflectance in spring**/
  var bands = preProcess.main(start,end,region,setName);
  bands = minCloudImgSelect.seasonFilter(bands,season);
  var minImg = minCloudImgSelect.minCloudImage(bands).median().set("season",season);
  return minImg;
}
 
/* multi-seasonal image */
seasonImg.msImg = function(region,start,end,setName) {
  var list = ee.List(["spring","summer",'autumn','winter']);
  list = list.map(function(season){
    season = ee.String(season);
    var img = seasonImg.ssImg(region,start,end,season,setName);
    return img;
  })
  return ee.ImageCollection.fromImages(list);
}


/* fill pixel with hole*/
seasonImg.fillHole = function(imgCol,region){
  var median = imgCol.median();
  imgCol = imgCol.map(function(img){
      var season = img.getString("season");
      var mask = ee.Image(img.unmask());
      var output = median.where(mask,img).clip(region);
      return output.set("season",season);
  })
  return imgCol;
}


/**
 * fill hole img median using annual img median coposite
 * */
seasonImg.main = function(region,start,end,setName){
  var imgCol = seasonImg.msImg(region,start,end,setName);
  var _imgCol = seasonImg.fillHole(imgCol,region);
  return _imgCol;
}



// /**
// * fill hole img median using annual img median coposite
// * */
// seasonImg.main = function(region,start,end,season,setName){
//   var all = seasonImg.msImg(region,start,end,setName).mosaic();
//   var img = seasonImg.ssImg(region,start,end,season,setName);
//   var mask = ee.Image(img.unmask());
//   var output = all.where(mask,img).clip(region);
//   return output.set("season",season);
// }

exports = seasonImg;
