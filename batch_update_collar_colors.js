function test()
{
	var valid = true;
	// //Production Utilities
	// eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	// eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	//Dev Utilities
	eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Utilities_Container.js\"");
	eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Batch_Framework.js\"");

	function execute()	
	{
		var docRef = app.activeDocument;
		var layers = docRef.layers;
		var aB = docRef.artboards;
		var swatches = docRef.swatches;
		var obj = {};
		var arr = [];

		var mockLay = findSpecificLayer(layers[0],"Mockup");
		if(mockLay)
		{
			var paramBlocks = mockLay.layers["paramcolors"];
		}

		var ppLay = getPPLay(layers[0]);

		ppLay.locked = false;
		ppLay.visible = true;


		var updateSwatches = ["Collar B", "Collar 2 B", "Collar_2 B", "Collar 3 B", "Collar_3 B", "Collar 4 B", "Collar_4 B"];

		for(var x=0,len=updateSwatches.length;x<len;x++)
		{
			try
			{
				var changeSwatch = swatches[updateSwatches[x]];
				var newPlaceHolderName = "C" + (paramBlocks.pageItems.length + 1);
				makeNewSpotColor(newPlaceHolderName,"CMYK",BOOMBAH_APPROVED_COLOR_VALUES[newPlaceHolderName]);
				var newSwatch = swatches[newPlaceHolderName];
				docRef.defaultFillColor = changeSwatch.color;
				app.executeMenuCommand("Find Fill Color menu item");
				docRef.defaultFillColor = newSwatch.color;
				var newParam = paramBlocks.pathItems.rectangle(-(5 * paramBlocks.pageItems.length),-5,5,5);
				newParam.fillColor = newSwatch.color;
				newParam.stroked = false;
			}
			catch(e)
			{}
		}

		ppLay.visible = false;
	}

	batchInit(execute,"");

}
test();