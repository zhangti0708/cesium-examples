require.config({
	baseUrl : './js',
	paths: {
		jquery:"jquery.min",
		calc: 'calc'
	},
    shim:{
		calc:{
			deps: [],
			exports: 'calc'
    	}
    }
});

require(["jquery","calc"], function ($,calculation) {
	var nTotal = calculation.add(3857 , 4326);
	$( "#required_jquery" ).html( "Hello Cesium!" + nTotal );
});