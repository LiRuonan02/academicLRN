# academicLRN

本仓库主要存放 GIS、遥感和 Google Earth Engine（GEE）相关代码。其中
`forstTypeClassification_geeApp` 是一个基于 Landsat 8 多季节特征和随机森林的
森林类型分类应用。

## 文件功能

| 文件 | 功能 |
| --- | --- |
| `forstTypeClassification_geeApp` | GEE 应用主程序。创建研究区、日期、特征、随机森林参数、结果显示和导出界面；负责调用其他功能模块并组织完整分类流程。 |
| `a_dataAccess.js` | 辅助数据读取模块。读取并处理 MODIS 地表温度、SRTM 高程/坡度/坡向和月降水量数据，并按研究区裁剪。 |
| `a_preProcess.js` | Landsat 8 预处理模块。按研究区和日期筛选影像，进行云/云影掩膜、反射率缩放、波段重命名、植被指数计算，并添加春、夏、秋、冬季节属性。 |
| `b_minCloudImgSelect.js` | 最小云量影像筛选模块。按季节、WRS Path 和 Row 分组，从每组中选择云量最低的影像，并可返回影像日期和云量信息。 |
| `c_seasonImg.js` | 季节影像生成模块。分别生成春、夏、秋、冬影像，并使用全年中值影像填补季节影像中的空洞。 |
| `d_seasonImgCol.js` | 多季节合成模块，也是主程序当前使用的合成入口。支持 `median`、`mean`、`min` 和 `max` 合成，并使用全年合成结果填补空洞。 |
| `e_classify.js` | 随机森林分类模块。根据训练样本提取影像特征，训练 `smileRandomForest` 分类器，并输出研究区内的分类结果。 |
| `f_confusionMatrix.js` | 分类精度评价模块。使用测试样本生成混淆矩阵，并计算用户精度（UA）、生产者精度（PA）、Kappa 系数和总体精度（OA）。 |
| `index.html` | 简单的个人主页，与 GEE 森林类型分类流程相互独立。 |

## 主要处理流程

1. `a_preProcess.js` 获取并预处理 Landsat 8 影像。
2. `d_seasonImgCol.js` 生成春、夏、秋、冬四个季节的光谱与植被指数合成影像。
3. `a_dataAccess.js` 按需加入地形、温度和降水特征。
4. `e_classify.js` 使用训练样本执行随机森林分类。
5. `f_confusionMatrix.js` 或主程序中的评价功能使用测试样本计算分类精度。
6. `forstTypeClassification_geeApp` 提供操作界面、地图显示和结果导出功能。

## 在 GEE Code Editor 中使用

GitHub 仓库与 GEE Code Editor 的脚本仓库相互独立，GitHub 上的修改不会自动同步到
`users/liruonan02/forestTypeClassification`。运行前需要把文件复制到对应的 GEE 脚本并保存：

| GitHub 文件 | GEE 脚本位置 |
| --- | --- |
| `a_dataAccess.js` | `function/a_dataAccess.js` |
| `a_preProcess.js` | `function/a_preProcess.js` |
| `b_minCloudImgSelect.js` | `function/b_minCloudImgSelect.js` |
| `c_seasonImg.js` | `function/c_seasonImg.js` |
| `d_seasonImgCol.js` | `function/d_seasonImgCol.js` |
| `e_classify.js` | `function/e_classify.js` |
| `f_confusionMatrix.js` | `function/f_confusionMatrix.js` |
| `forstTypeClassification_geeApp` | GEE 主程序脚本 |

同步后请在 GEE 中保存所有模块，刷新 Code Editor，再运行主程序。运行账户还需要拥有
脚本顶部所列研究区、样本、掩膜和其他森林产品资产的读取权限。
