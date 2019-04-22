//this is a batch script for replacing elements
//in converted template files, provided they all
//share the same fill color. For example,
//jock tags and collar info. the script loops through
//each prepress layer and selects everything of a given
//fill color, then replaces the selection with a matching
//named group from the "source file", then matches the position
//and removes the existing item.

//requirements:
	//a source document that contains items that are named
		//with the corresponding size and then a label
		//i.e. "XL Jock Tag"


function updateCTElements()
{
	var valid = true;
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	function fixElements(sourceDoc,swatchName,elementName)
	{
		var docRef = app.activeDocument;
		var layers = docRef.layers;
		var aB = docRef.artboards;
		var swatches = docRef.swatches;


		var mockLay = findSpecificLayer(layers[0],"Mockup");
		mockLay.visible = false;
		var infoLay = findSpecificLayer(layers[0],"Information");
		infoLay.visible = false;
		var ppLay = getPPLay(layers);
		ppLay.visible = true;

		docRef.selection = null;


		for(var x=0,len=ppLay.layers.length;x<len;x++)
		{
			ppLay.layers[x].visible = false;
		}


		var curSel,curSize,newElement;
		for(var x=0,len = ppLay.layers.length;x<len;x++)
		{
			ppLay.layers[x].visible = true;
			curSize = ppLay.layers[x].name;
			docRef.defaultFillColor = swatches[swatchName].color;
			app.executeMenuCommand("Find Fill Color menu item");
			app.executeMenuCommand("group");
			curSel = docRef.selection[0];
			newElement = sourceDoc.pageItems[curSize + " " + elementName];
			newElement = newElement.duplicate(docRef);
			newElement.moveToBeginning(curSel.parent);
			newElement.position = curSel.position;
			newElement.name = curSize + " " + elementName;
			curSel.remove();
			docRef.selection = null;
			ppLay.layers[x].visible = false;
		}

		for(var x=0,len=ppLay.layers.length;x<len;x++)
		{
			ppLay.layers[x].visible = true;
		}


		docRef.selection = null;
		mockLay.visible = true;
		ppLay.visible = false;
		
	}

	var tagFile = app.documents["jock_tags.ai"];
	var collarInfoFile = app.documents["collar_info.ai"];

	function execute()
	{
		fixElements(tagFile,"Jock Tag B", "Jock Tag");
		fixElements(collarInfoFile,"Collar Info B", "Collar Info");
	}

	// execute();

	batchInit(execute,"fixed jock tags and collar info")
}
updateCTElements();