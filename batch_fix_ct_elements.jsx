#target Illustrator
function updateCTElements()
{

	//this is an array of colors to delete from the current batch doc
	//let's say you're replacing Thru-cut and SEW LINE...
	//put both of those colors in this array and they will
	//be deleted from the batch document.
	//the source doc should have all colors removed except
	//for what's being replaced.. so in each piece group,
	//the only stuff left will be what's getting replaced.
	
	var rmColors = ["Thru-cut"];





	var valid = true;
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	var obj = {};

	try
	{
		var sourceDoc = app.documents["ct_fixed.ai"];
	}
	catch(e)
	{
		alert("where's your source doc, fool?");
		return false;
	}

	sourceDoc.activate();
	var sourcePrepressLay = getPPLay(sourceDoc.layers[0]);
	sourcePrepressLay.visible = true;
	sourcePrepressLay.locked = false;

	var tmpLay = sourceDoc.layers.add();
	var tmpGroup = tmpLay.groupItems.add();

	var curLay,curSize,curPiece,curName,curPos;
	for(var s=0,len=sourcePrepressLay.layers.length;s<len;s++)
	{
		curLay = sourcePrepressLay.layers[s];
		curSize = curLay.name;
		// obj[curSize] = {};
		for(var p=0,pLen=curLay.pageItems.length;p<pLen;p++)
		{
			curPiece = curLay.pageItems[p].duplicate(tmpGroup);
			// curName = curPiece.name;
			// obj[curSize][curName] = curPiece;

		}
	}


	function exec()
	{
		var docRef = app.activeDocument;
		var layers = docRef.layers;
		var swatches = docRef.swatches;
		var ppLay = getPPLay(layers);
		ppLay.visible = true;
		ppLay.locked = false;
		docRef.selection = null;

		for(var c=0,len=rmColors.length;c<len;c++)
		{
			docRef.defaultFillColor = swatches[rmColors[c]].color;
			app.executeMenuCommand("Find Fill Color menu item");
			app.cut();
			docRef.defaultStrokeColor = swatches[rmColors[c]].color;
			app.executeMenuCommand("Find Stroke Color menu item"); 
			app.cut();
		}

		//bring in the tmpGroup
		var curTmpGroup = tmpGroup.duplicate(docRef);

		var curLay,curSize,curPiece,curName,curPos;
		for(var s=0,len=ppLay.layers.length;s<len;s++)
		{
			curLay = ppLay.layers[s];
			curSize = curLay.name;
			for(var p=0,pLen=curLay.pageItems.length;p<pLen;p++)
			{
				curPiece = curLay.pageItems[p];
				curName = curPiece.name;
				dupGroup = curTmpGroup.groupItems[curName];
				for(var dg = dupGroup.pageItems.length - 1; dg>=0; dg--)
				{
					dupGroup.pageItems[dg].moveToBeginning(curPiece);
				}
				dupGroup.remove();
				
			}
		}

		ppLay.visible = false;
	}

	batchInit(exec,"update thru cut lines");
	// app.documents[1].activate();
	// exec();

	tmpLay.remove();
	
}
updateCTElements();