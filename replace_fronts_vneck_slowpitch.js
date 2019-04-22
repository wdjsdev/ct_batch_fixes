function ReplaceFronts()
{
	var valid = true;
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	var docRef;
	var layers;
	var aB;
	var swatches;
	var ppLay;

	var sourceFile = File(desktopPath + "/andy_project/source.ai");
	
	function execute()
	{
		docRef = app.activeDocument;
		layers = docRef.layers;
		aB = docRef.artboards;
		swatches = docRef.swatches;
		ppLay = getPPLay(layers[0]);
		ppLay.locked = false;
		ppLay.visible = true;
		var sourceFile = getSourceFile();

		var sourceFileContents = sourceFile.layers[0].pageItems;


		var curSize;
		var existingPiece, duplicateItem;
		for(var x = sourceFileContents.length-1; x>=0;x--)
		{
			duplicateItem = sourceFileContents[x].duplicate(docRef);
			curSize = duplicateItem.name.substring(0,duplicateItem.name.indexOf(" "));
			existingPiece = findExistingPiece(curSize,duplicateItem.name);
			if(!existingPiece)
			{
				continue;
			}
			duplicateItem.moveToBeginning(existingPiece.parent);
			duplicateItem.left = existingPiece.left;
			duplicateItem.top = existingPiece.top;
			existingPiece.remove();
			docRef.selection = null;
		}

		ppLay.visible = false;

		if(errorList.length)
		{
			sendErrors(errorList);
		}
	}

	function findExistingPiece(size,name)
	{
		var lay = ppLay.layers[size];
		for(var x=0,len=lay.pageItems.length;x<len;x++)
		{
			if(lay.pageItems[x].name === name)
			{
				return lay.pageItems[x];
			}
		}
		errorList.push("Failed to find any piece matching \"" + name + "\" on layer: " + size + ".");
		return false;
	}

	function getSourceFile()
	{
		var result;

		for(var x=0,len=app.documents.length;x<len && !result;x++)
		{
			if(app.documents[x].name === "source.ai")
			{
				result = app.documents[x];
			}
		}

		if(!result)
		{
			result = app.open(sourceFile);
			docRef.activate();
		}
		return result;

	}

	execute();

	
}
ReplaceFronts();