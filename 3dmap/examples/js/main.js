var developMode = false;

if(developMode){
	require.config({
	baseUrl : '../Source',

    paths: {
        echarts: '../examples/js/echarts.simple.min',
        CesiumHeatmap : '../examples/js/heatmap.min',
    },
    shim: {
        CesiumHeatmap : {
			exports : "CesiumHeatmap"
		},
        echarts : {
            exports : 'echarts'
        }
    }
	});
} else{
	require.config({
		  paths: {
				'Cesium': '../../Build/Cesium/Cesium',
                'echarts': './echarts.simple.min',
                'CesiumHeatmap' : './heatmap.min',
		  },
		  shim: {
              CesiumHeatmap : {
			  	exports : "CesiumHeatmap"
			  },
			  Cesium: {
				  exports: 'Cesium'
			  },
              echarts : {
                  exports : 'echarts'
              },
		  }
	});
}

if (typeof Cesium !== "undefined" && typeof echarts !== "undefined" && typeof CesiumHeatmap !== "undefined") {
    onload(Cesium,CesiumHeatmap,echarts);
} else if (typeof require === "function") {
    require(["Cesium","CesiumHeatmap","echarts"], onload);
}
