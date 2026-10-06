
var preProcess = require("users/liruonan02/forestTypeClassification:function/a_preProcess.js"); 
var seasonImgCol = {}; 

/* Seasonal image composition*/
seasonImgCol.msImgCol = function(imgCol,way){
    // print(imgcol)
    var img_spring = [];
    var img_summer = [];
    var img_autumn = [];
    var img_winter = [];
    if (way==="median") {
      img_spring = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'spring'))).median().set("season",'spring');
      img_summer = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'summer'))).median().set("season",'summer');
      img_autumn = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'autumn'))).median().set("season",'autumn');
      img_winter = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'winter'))).median().set("season",'winter');
    }
    else if (way==="min") {
      img_spring = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'spring'))).min().set("season",'spring');
      img_summer = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'summer'))).min().set("season",'summer');
      img_autumn = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'autumn'))).min().set("season",'autumn');
      img_winter = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'winter'))).min().set("season",'winter');
    }
    else if (way==="mean") {
      img_spring = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'spring'))).mean().set("season",'spring');
      img_summer = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'summer'))).mean().set("season",'summer');
      img_autumn = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'autumn'))).mean().set("season",'autumn');
      img_winter = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'winter'))).mean().set("season",'winter');
    }
    else if (way==="max") {
      img_spring = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'spring'))).max().set("season",'spring');
      img_summer = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'summer'))).max().set("season",'summer');
      img_autumn = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'autumn'))).max().set("season",'autumn');
      img_winter = ee.ImageCollection(imgCol.filter(ee.Filter.stringContains('season', 'winter'))).max().set("season",'winter');
    }
    
    var res = ee.ImageCollection([img_spring, img_summer, img_autumn, img_winter]);
    return res;
}


/* fill pixel with hole*/
seasonImgCol.fillHole = function(imgCol,region,way){
  var regionCollection = ee.FeatureCollection(region);
  var value = [];
  if (way==="median") {value = imgCol.median()}
  else if (way==="min") {value = imgCol.min()}
  else if (way==="mean") {value = imgCol.mean()}
  else if (way==="max") {value = imgCol.max()}
  
  imgCol = imgCol.map(function(img){
      var season = img.getString("season");
      var mask = ee.Image(img.unmask());
      var output = ee.Image(value).where(mask,img)
                           .clipToCollection(regionCollection);
      return output.set("season",season);
  })
  return imgCol;
}


/**
 * fill hole img median using annual img median coposite
 * */
seasonImgCol.main = function(region,start,end,setName,way){
  var imgCol = preProcess.main(start,end,region,setName);
  imgCol = seasonImgCol.msImgCol(imgCol,way);
  var _imgCol = seasonImgCol.fillHole(imgCol,region,way);
  _imgCol = _imgCol.map(function(img){
    img = ee.Image(img).set("setName",setName)
    return img;
  })
  return _imgCol;
}

exports = seasonImgCol;
