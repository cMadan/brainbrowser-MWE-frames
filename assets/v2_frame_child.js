// load all of the workers
BrainBrowser.config.set("model_types.json.worker", "json.worker.js");
BrainBrowser.config.set("model_types.mniobj.worker", "mniobj.worker.js");
BrainBrowser.config.set("model_types.wavefrontobj.worker", "wavefrontobj.worker.js");
BrainBrowser.config.set("model_types.freesurferbin.worker", "freesurferbin.worker.js");
BrainBrowser.config.set("model_types.freesurferbin.binary", true);
BrainBrowser.config.set("model_types.freesurferasc.worker", "freesurferasc.worker.js");
BrainBrowser.config.set("intensity_data_types.text.worker", "text.intensity.worker.js");
BrainBrowser.config.set("intensity_data_types.freesurferbin.worker", "freesurferbin.intensity.worker.js");
BrainBrowser.config.set("intensity_data_types.freesurferbin.binary", true);
BrainBrowser.config.set("intensity_data_types.freesurferasc.worker", "freesurferasc.intensity.worker.js");
// keep the vtk and csv ones too
BrainBrowser.config.set("model_types.vtk.worker", "vtk.worker.js");
BrainBrowser.config.set("intensity_data_types.csv.worker", "csv.intensity.worker.js");
//
BrainBrowser.config.set('worker_dir', './brainbrowser-2.5.0/workers/');
BrainBrowser.config.set("color_maps", [
  {
    name: "Spectral",
    url: "color-maps/spectral.txt",
  },
  {
    name: "Thermal",
    url: "color-maps/thermal.txt",
  },
  {
    name: "Gray",
    url: "color-maps/gray-scale.txt",
  },
  {
    name: "Blue",
    url: "color-maps/blue.txt",
  },
  {
    name: "Green",
    url: "color-maps/green.txt",
  }
]);

BrainBrowser.SurfaceViewer.start('brainbrowser', handleBrainz);

var gui = new dat.GUI();
var inputs = queryStringToHash();

//if multiple input models, need to split then
var modelUrl = inputs.model
var overlayUrl = inputs.overlay
modelUrl = modelUrl.split(';');
overlayUrl = overlayUrl.split(';');

// determine model/overlay file formats
urlsplit = modelUrl[0].split('.');
ext = urlsplit.slice(-1).pop();
if (ext == 'pial' || ext == 'white') {
  format = 'freesurferbin';
}
else {
  format = ext; // e.g., vtk
}
modelFormat = format;
urlsplit = overlayUrl[0].split('.');
ext = urlsplit.slice(-1).pop();
if (ext == 'thickness' || ext == 'curv') {
  format = 'freesurferbin';
}
else if (ext == 'asc') {
  format = 'freesurferasc';
}
else {
  format = ext; // e.g., csv
}
overlayFormat = format;


//
var colormaps = {}
BrainBrowser.config.get("color_maps").forEach(function(val, idx, arr){colormaps[val.name] = val.url})

// Pulled out this function from the start call so that it's not so nested.
function handleBrainz(viewer) {
  var meshgui;
  window.viewer = viewer;
  window.gui = gui;

  //Add an event listener.
  viewer.addEventListener('displaymodel', function(brainBrowserModel) {
    window.brainBrowserModel = brainBrowserModel;

    meshgui = gui.addFolder(brainBrowserModel.model_data.name);
    meshgui.open();

  });

  viewer.addEventListener("loadintensitydata", function(event) {
    var model_data = event.model_data;
    var intensity_data = event.intensity_data;
    intensity_data.transparency = 1
    intensity_data.colormap_name = "Spectral"
    window.intensityData = intensity_data;
    overlayGui = meshgui.addFolder(intensity_data.name);
    overlayGui.open();
    var vmin = overlayGui.add(intensity_data, 'min');
    var vmax = overlayGui.add(intensity_data, 'max');
    var transparency = overlayGui.add(intensity_data, 'transparency',0,1);
    var cmap = overlayGui.add(intensity_data, "colormap_name", Object.keys(colormaps))
    vmin.onChange(function(newMin){
      viewer.setIntensityRange(newMin, intensity_data.max)
    })
    vmax.onChange(function(newMax){
      viewer.setIntensityRange(intensity_data.min, newMax)
    })
    transparency.onChange(function(newT){
        viewer.setTransparency(newT, {shape_name: model_data.name})
    })
    cmap.onChange(function(newC){
        viewer.loadColorMapFromURL(colormaps[newC])
    })
  });

  viewer.addEventListener("loadcolormap", function(event) {
    viewer.color_map.clamp = false; 
  });

  // Start rendering the scene.
  viewer.render();
  viewer.setClearColor(0XFFFFFF);
  viewer.loadColorMapFromURL(BrainBrowser.config.get("color_maps")[0].url);


// load multi models
var f;
f=0;
//for (f=0; f<modelUrl.length; f++) {
  console.log(f);
  // Load a model into the scene.
    viewer.loadModelFromURL(modelUrl[f], {
    format: modelFormat,

    complete: function(){
      viewer.loadIntensityDataFromURL(overlayUrl[f], {
        format: overlayFormat,
        name: "thick1"
      });
    }
  });
//};
f=1;
//for (f=0; f<modelUrl.length; f++) {
  console.log(f);
  // Load a model into the scene.
  viewer.loadModelFromURL(modelUrl[f], {
    format: modelFormat,

    complete: function(){
      viewer.loadIntensityDataFromURL(overlayUrl[f], {
        format: overlayFormat,
        name: "thick2"
      });
    }
  });

  // CRM re-adding pick functionality
  function pick(x,y,paint) {
    if (viewer.model.children.length === 0) return;

    var pick_info = viewer.pick(x,y);
    var value, label, text;

    if (pick_info) {
      $("#pick-x").html(pick_info.point.x.toPrecision(4));
      $("#pick-y").html(pick_info.point.y.toPrecision(4));
      $("#pick-z").html(pick_info.point.z.toPrecision(4));
      $("#pick-index").html(pick_info.index);
      $("#pick-value").html(intensityData.values[pick_info.index].toPrecision(4));

    } else {
      picked_object = null;
      $("#pick-x").html("");
      $("#pick-y").html("");
      $("#pick-z").html("");
      $("#pick-index").html("");
      $("#pick-value").val("");
      $("#pick-color").css("background-color", "#000000");
    }

    viewer.updated = true;
  }


  $("#brainbrowser").click(function(event) {
    if (!event.shiftKey && !event.ctrlKey) return;
      pick(viewer.mouse.x, viewer.mouse.y, event.ctrlKey);
  });
  document.getElementById("brainbrowser").addEventListener("touchend", function(event) {
    var touch = event.changedTouches[0];
    var offset = BrainBrowser.utils.getOffset(this);
    var x, y;

    if (touch.pageX !== undefined) {
      x = touch.pageX;
      y = touch.pageY;
    } else {
      x = touch.clientX + window.pageXOffset;
      y = touch.clientY + window.pageYOffset;
    }

    x = x - offset.left;
    y = y - offset.top;

    pick(x, y, true);
  }, false);
}

// taken from https://css-tricks.com/snippets/jquery/get-query-params-object/
function queryStringToHash(str){
  return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
}
