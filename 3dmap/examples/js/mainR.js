require.config({
	  waitSeconds : 600,
	  baseUrl : './js',
	  paths: {
			jquery:"jquery.min"
	  }
});

require(["jquery"], function ($) {
	$( "#required_jquery" ).html( "Hello Cesium!" );
});
