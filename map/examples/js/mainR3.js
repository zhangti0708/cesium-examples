var developMode = false;

if(developMode){
	require.config({
		baseUrl : '../Source'
	});
} else{
	require.config({
		baseUrl : './',
		paths: {
			'Cesium': '../Build/Cesium/Cesium'
		},
		shim: {
			Cesium: {
				exports: 'Cesium'
			}
		}
	});
}

require(["Cesium"], onload);
