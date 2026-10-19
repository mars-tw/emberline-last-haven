# 熹身份 R5

原始表：`../masters/r5/original/xi.png`。清理後RGBA與遮罩：`../masters/r5/rgba/xi.png`、`../masters/r5/masks/xi.png`；opaque檢視母版在`../masters/r5/opaque/xi.png`。

上列依序為正、側、背、肖像；下列為聽電台、看冷窗、指車頂、伏低四個真姿勢。生成表原生1536×1024，以y=528切分，四欄各384px；沒有用位移／旋轉生成肢體幀。

身份：成人東亞女性、角形顴骨、短棕髮、琥珀圍巾、鏽橙工作外套、橄欖長褲、黑手套。R4成人肖像是參考。runtime正側背分別在`public/art/r5/xi-front.png`、`xi-side.png`、`xi-back.png`，夜車四姿態在`xi-night.png`。砲手／射擊沿用符合身份的R4真幀，保留原命中時序。

64px無標籤身份表由`art-r5-verify.py`產出。真人參與人數0，不能宣稱辨識率>=80%；模型亦未回傳實際slug，記錄內建工具image_gen__imagegen。
