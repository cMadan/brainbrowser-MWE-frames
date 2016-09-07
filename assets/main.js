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

var modelUrl = inputs.model || './models/vtk/freesurfer_curvature.vtk'
var overlayUrl = inputs.overlay || './models/vertices.csv'
var urlsplit
var ext
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


  // Load a model into the scene.
  viewer.loadModelFromURL(modelUrl, {
    urlsplit = modelUrl.split("."),
    ext = urlsplit.slice(-1).pop(),

    if (ext == "pial" || ext == "white") {
      format: 'freesurferasc',
    }
    else {
      format: ext, // e.g., vtk
    }

    complete: function(){
      viewer.loadIntensityDataFromURL(overlayUrl, {
        if (ext == "thickness" || ext == "curv") {
          format: 'freesurferasc',
        }
        else {
          format: ext; // e.g., csv
        }
        name: "Cortical Thickness"
      });
    }
  });

}

// taken from https://css-tricks.com/snippets/jquery/get-query-params-object/
function queryStringToHash(str){
  return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
}