
/**   
 * get imageCol in spring, summer, autumn, winter
 * */

var minCloudImgSelect = {}

// fitler image depending on region and date
// season: spring  summer, autumn, winter
    minCloudImgSelect.seasonFilter =  function(imgCol,season){
      season = season || "allyear"
      if (season =="allyear"){
        imgCol = imgCol;
      }      
      else {
        imgCol = imgCol.filterMetadata("season","equals",season);
      }
      return imgCol;
    }
    
    minCloudImgSelect.pathRowList=function(imgCol){
      // get the unique path and row list in the research 
      var list = imgCol.reduceColumns(ee.Reducer.toList(2),["WRS_PATH","WRS_ROW"])
      list = ee.Dictionary(list).values().get(0)
      list = ee.List(list).distinct();
      return list;
    }
    
    minCloudImgSelect.minCloudImage=function(imgCol){
      // get the unique path and row list in the research 
      var list = minCloudImgSelect.pathRowList(imgCol);
      // get the img list with min cloud coverage for each scene
      var minCloudImage_list = list.map(function(index){
        var path = ee.List(index).get(0);
        var row = ee.List(index).get(1);
        var _imgCol = imgCol.filter(
                      ee.Filter.and(ee.Filter.equals("WRS_PATH",path),ee.Filter.equals("WRS_ROW",row)))
        var min = _imgCol.aggregate_min("CLOUD_COVER");
        var minImg = _imgCol.filterMetadata("CLOUD_COVER",'equals', min).first();
        return minImg;
      })
      var _col = ee.ImageCollection.fromImages(minCloudImage_list)
      return _col;
    }
    
    // get the path, row, and date list with min cloud coverage for each scene
    minCloudImgSelect.mindateList = function(minCloudImage_list){
      // get the list path, row, and date
      var minCloudImgList = minCloudImage_list.map(function(img){
        img = ee.Image(img);
        var cloud  = ee.Number(img.get("CLOUD_COVER")).format('%.1f')
        cloud = ee.Number.parse(cloud)
        var _path = ee.String(img.get("WRS_PATH"));
        var _row = ee.String(img.get("WRS_ROW"));
        var _date = ee.String(img.get("DATE_ACQUIRED"));
        var _list = ee.List([_path,_row,_date,cloud]);
        return _list;
      });
      return ee.List(minCloudImgList);
    }
    
    minCloudImgSelect.main_imgCol = function(col,season){
      // 根据季节筛选影像
      col = minCloudImgSelect.seasonFilter(col,season);
      // 根据条带号云量对影像分组
      var ImageList = minCloudImgSelect.minCloudImage(col);
      // 获取每个条带号云量最少的一张影像
      var minCol = minCloudImgSelect.mindateList(ImageList);
      return minCol;
    }

exports = minCloudImgSelect;

