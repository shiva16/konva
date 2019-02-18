 <script type="text/javascript" crossorigin="anonymous">
            var wid = 272;
            var hei = 272;
            var currentscale = 2;
            var currentcoloridx = 1;
            var colorlist = ['#ff0000', '#00ff00', '#ff00ff','#ffff00','#414141','#00ffff','#8f8f8f','#ffe86b','#ffffff'];
            var indicesWithSaidColor = [];
            var positionForColor = {}
            var stage = new Konva.Stage({
                container: 'container',
                width: 1100, //window.innerWidth,
                height: 1100, //window.innerHeight - 45,
                scale: { x: currentscale, y: currentscale },
                draggable: false // if this is changed, then stage offset should be considered while recording points
            });
            var layer = new Konva.Layer(); // layer for pixel painting
            // var layer_vector = new Konva.Layer(); // layer for vector drawings

            var isPaint = false;
            // referring this https://konvajs.github.io/docs/sandbox/Zooming_Relative_To_Pointer.html
            var slider = document.getElementById("myRange");
            slider.oninput = function () {
                var oldScale = stage.scaleX();
                var newscale = slider.value;
                // default scale 5 is set by you. Assuming I want the scale to
                // be from 1 to 10
                // var maxScaleStage = 10, minScaleStage = 1;
                var change = Math.pow(2,newscale); // (slider.value * (maxScaleStage - minScaleStage) / 100) + minScaleStage;
                // var change = newscale;
                // console.log(newscale,change);
                stage.scale({ x: change, y: change })
                stage.batchDraw();
                currentscale = change;
            }
            var idxarray = [];  // for lookup
            var flagarray = []; // erased or not
            var undostep = 0;
            var xyarray = []; // painted locations in image coordinates
            var colorarray = [];
            var idxsequence = []; // sequence of idxs operated on
            var typeOfOperations = [];

            function makeNewLine(isPolygon) {
                return new Konva.Line({
                    points:[],
                    closed:isPolygon,
                    stroke:'blue',
                    strokeWidth: 0.2, //TODO: smooth lines?
                    visible:true,
                    opacity:1,
                    tension: 0
                });
            }
            function makeNewRect(clickX,clickY)
            {
                return new Konva.Rect({
                            x: clickX + 0.1,
                            y: clickY + 0.1,
                            width: 0.8,
                            height: 0.8,
                            fill: colorlist[currentcoloridx-1], //'#4b26df',
                            draggable: false
                        });
            }
            function checkEraseRect(evt) {
                obj = evt.target;
                if ($('#erase_check').is(':checked')) {
                    pos = obj.getPosition();
                    clickX_d = Math.floor(pos.x); //currentscale;
                    clickY_d = Math.floor(pos.y); //currentscale;
                    linidx_d = (clickY_d-1) * wid + clickX_d;
                    idxloc_d = idxarray.indexOf(linidx_d);
                    if(idxloc_d!=-1)
                    {
                        console.log(clickX_d, clickY_d);
                        idxsequence.push(idxloc_d);
                        undostep = 0;
                        flagarray[idxloc_d]=0;
                        obj.destroy();
                        layer.draw();
                    }
                }
            }
            function paintRect(clickpos) {
                clickX = Math.floor((clickpos.x) / currentscale)+stage.offsetX();
                clickY = Math.floor((clickpos.y) / currentscale)+stage.offsetY();
                
                linearindex = (clickY-1)*wid + clickX;
                idxloc = idxarray.indexOf(linearindex);
                var existingrect = stage.getIntersection(clickpos, 'Rect');
                if (existingrect.className == 'Image') {
                    if(idxloc!=-1 && flagarray[idxloc]==1) //already exists
                    {
                    }
                    else
                    {
                        idxarray.push(linearindex);
                        flagarray.push(1);
                        xyarray.push([clickX,clickY]);
                        idxsequence.push(idxarray.length-1);
                        undostep = 0;
                        newrect = makeNewRect(clickX, clickY);
                        colorarray.push(currentcoloridx);
                        newrect.on('click tap', checkEraseRect);
                        console.log(positionForColor[currentcoloridx]);
                        if(!positionForColor[currentcoloridx]){
                        positionForColor[currentcoloridx] = [];}
                        console.log(positionForColor[currentcoloridx]);
                        positionForColor[currentcoloridx].push([clickX,clickY])
                        layer.add(newrect);
                        layer.draw();
                    }
                }
                else {
                    //console.log(clickpos);
                }
            }
            var currentvector = undefined;

            function mouseevt() {
                clickpos = stage.getPointerPosition();
                clickX = Math.floor((clickpos.x) / currentscale)+stage.offsetX();
                clickY = Math.floor((clickpos.y) / currentscale)+stage.offsetY();
                //console.log(clickpos)
                if ($('#erase_check').is(':checked')) {
                }
                else if (isPaint) {
                    var selection = $('input[name=drawingtype]:checked').val();
                    if(selection =='vector_linestring' || selection =='vector_polygon') {
                        typeOfOperations.push("vec")
                        if(currentvector == undefined) {
                            currentvector = makeNewLine(false);
                            layer.add(currentvector);
                        }
                        currentvector.points(currentvector.points().concat([clickX,clickY]));
                        currentvector.draw();
                    }
                    else if(selection=="raster_pixel") {
                        typeOfOperations.push("pixel")
                        paintRect(clickpos);
                    }
                }
                
            }
            $('#leftbutton').click(function(){
                currentoffset = stage.getOffset();
                stage.setOffset({x:currentoffset.x-10,y:currentoffset.y+0});
                stage.draw();
            });
            $('#rightbutton').click(function(){
                currentoffset = stage.getOffset();
                stage.setOffset({x:currentoffset.x+10,y:currentoffset.y+0});
                stage.draw();
            });
            $('#upbutton').click(function(){
                currentoffset = stage.getOffset();
                stage.setOffset({x:currentoffset.x+0,y:currentoffset.y-10});
                stage.draw();
            });
            $('#downbutton').click(function(){
                currentoffset = stage.getOffset();
                stage.setOffset({x:currentoffset.x+0,y:currentoffset.y+10});
                stage.draw();
            });
            $('#centerbutton').click(function(){
                stage.setOffset({x:0,y:0});
                stage.draw();
            });
            stage.on('touchstart mousedown', function () { isPaint = true; mouseevt(); });
            stage.on('mousemove', mouseevt);
            stage.on('mouseup', function () {
                 isPaint = false;
                 console.log(positionForColor);
                 
                 var selection = $('input[name=drawingtype]:checked').val();
                 if(selection=='vector_polygon' && currentvector!=undefined) {
                    currentvector.closed(true);
                    layer.draw();
                 }
                 //TODO: push to array of drawn objects (for erase/undo), before undefining
                 // erase/undo will require a filter array (0/1)
                 // separate array for polygon and linestring required
                 // in save, iterate through these two object arrays and add to geojson msg
                 currentvector=undefined;
            });

            function undoPixel() {
                len = idxsequence.length;
                if(undostep > len-1)
                {
                    return;
                }
                undoidx = idxsequence[len-undostep-1];
                lastaction = flagarray[undoidx]; //flagarray[len-undostep-1];
                flagarray[undoidx]=lastaction==0?1:0;
                if(!lastaction) {
                    pos = xyarray[undoidx];
                    clickX = pos[0];
                    clickY = pos[1];
                    newrect = makeNewRect(clickX, clickY);
                    newrect.on('click tap', checkEraseRect);
                    linidx_r = (clickY-1)*wid + clickX;
                    idxloc_r = idxarray.indexOf(linidx_r);
                    // idxsequence.push(idxloc_r); //redrawn
                    layer.add(newrect);
                    layer.draw();
                }
                else {
                    clickpix = xyarray[undoidx];
                    clickpos = {x:(clickpix[0]-stage.offsetX())*currentscale+currentscale/2, y:(clickpix[1]-stage.offsetY())*currentscale+currentscale/2};
                    var existingrect = stage.getIntersection(clickpos, 'Rect');
                    if (existingrect.className == 'Rect') {
                        existingrect.destroy();
                        layer.draw();
                    }
                }
                undostep = undostep + 1;
            }
            $('#picker').change(function(){
                currentcoloridx=this.value;
            }); 
            $('#undobutton').click(function() {
                if (typeOfOperations[typeOfOperations.length - 1] === 'pixel'){
                    undoPixel();
                } else if (typeOfOperations[typeOfOperations.length - 1] === 'vec'){
                    undovec();
                }
                
            });
            
            $('#savebutton').click(function() {
                xyarray_filt = [];
                for(ii=0;ii<xyarray.length;++ii)
                {
                    if(flagarray[ii]==1)
                        xyarray_filt.push(xyarray[ii]);
                }
                msg = '{"type":"MultiPoint", "coordinates":'+JSON.stringify(xyarray_filt)+'}';
                alert(msg);
            });
            
            $('#clearbutton').click(function() {
                var shapes = stage.find('Rect');
                for (var i = 0; i < shapes.length; i++) {
                    shapes[i].destroy();
                    layer.draw();
                }
            })
            $(document).ready(function () {
                // $('[name="picker"]').paletteColorPicker({
                //     colors: ['#D50000','#304FFE','#00B8D4','#69F0AE','#FFFF00','#F8BBD0'],
                //     clear_btn: null
                // });
                stage.add(layer);
                // stage.add(layer_vector);

                const nativeCtx = layer.getContext()._context;
                nativeCtx.webkitImageSmoothingEnabled = false;
                nativeCtx.mozImageSmoothingEnabled = false;
                nativeCtx.imageSmoothingEnabled = false;
                nativeCtx.msImageSmoothingEnabled = false;
                bgImage = new Image();
                xpix = 16280.0 + 700;
                ypix = 11950.0 + 400;
                xpc = xpix / 24000.0;
                ypc = ypix / 18000.0;
                wpc = wid / 24000.0;
                hpc = hei / 18000.0;
                rgnstring = xpc + ',' + ypc + ',' + wpc + ',' + hpc;
                //bgImage.src = "images/resolver_1020701_12800,16640,544,544.jpg";
                bgImage.src = 'http://mitradevel.cshl.org/cgi-bin/iipsrv.fcgi?FIF=PMD2140/PMD2140%262139-F30-2015.04.06-23.29.57_PMD2140_0_0087.jp2&wid=' + wid + '&RGN=' + rgnstring + '&MINMAX=1:0,255&MINMAX=2:0,255&MINMAX=3:0,255&GAM=1&CVT=jpeg';
                bgImage.onload = function () {
                    outimg = new Konva.Image({
                        x: 0,
                        y: 0,
                        width: wid,
                        height: hei,
                        image: bgImage,
                        draggable: false
                    });
                    layer.add(outimg);
                    layer.draw();
                    // layer_vector.draw();
                }
            });
        </script>
