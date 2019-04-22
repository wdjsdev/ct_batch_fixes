function GroupByColor()
{
	var valid = true;
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");

	var digResult = {};
	var tmpLay,tmpGroup;

	var overflowLayer;
	var overflowItems = [];

	var prodResult = [];
	var artResult = [];

	var docRef;
	var layers;
	var aB;
	var swatches;
	var filledAndStrokedObjects;
	var rasterObjects;

	function executor()
	{
		
		docRef = app.activeDocument;
		layers = docRef.layers;
		aB = docRef.artboards;
		swatches = docRef.swatches;
		filledAndStrokedObjects = [];
		rasterObjects = [];


		tmpLay = layers.add();
		tmpLay.name = "Temp Layer";
		
		var mockLay = findSpecificLayer(layers[1],"Mockup");
		mockLay.visible = false;

		var infoLay = findSpecificLayer(layers[1],"Information");
		infoLay.locked = true;

		var ppLay = getPPLay(layers[1]);
		ppLay.visible = true;
		ppLay.locked = false;

		overflowLayer = layers.add();
		overflowLayer.name = "Overflow";

		updateItemStatus(ppLay.layers,false,false);

		var curSize,curLay,curPieces,curPiece,groupedPiece;
		for(var x=0,len=ppLay.layers.length;x<len;x++)
		{
			curLay = ppLay.layers[x];
			curLay.visible = true;
			curSize = curLay.name;
			curPieces = curLay.pageItems;
			
			//hide all the child elements of the current prepress layer
			updateItemStatus(curPieces,false,false);
			app.redraw();
			
			//loop elements of current prepress layer to separate them 
			//into their component parts according to fill color
			for(var y=0,ylen = curPieces.length;y<ylen;y++)
			{
				curPiece = curPieces[y];
				curPiece.hidden = false;
				curPiece.selected = true;
				groupedPiece = processPiece(curPiece);
				// for(var z = tmpLay.pageItems.length-1;z>=0;z--)
				// {
				// 	tmpLay.pageItems[z].moveToBeginning(groupedPiece);
				// }
				groupedPiece.hidden = true;
			}

			curPieces = curLay.pageItems;
			updateItemStatus(curPieces,false,true);
			curLay.visible = false;
		}

		updateItemStatus(ppLay.layers,false,true);

		if(tmpLay.pageItems.length)
		{
			errorList.push("There was some artwork still on temp layer");
		}
		else
		{
			tmpLay.remove();
		}

		if(overflowLayer.pageItems.length)
		{
			errorList.push("There are " + overflowLayer.pageItems.length + " items on the overflow layer.");
		}
		else
		{
			overflowLayer.remove();
		}

		ppLay.visible = false;
		mockLay.visible = true;
		
	}

	function updateItemStatus(items,lockPref,visPref)
	{
		for(var x=0,len=items.length;x<len;x++)
		{
			items[x].locked = lockPref;
			items[x].hidden = !visPref;
			items[x].visible = visPref;
		}
	}

	function processPiece(curPiece)
	{
		prodResult = [];
		artResult = [];
		var parentPieceName = curPiece.name;
		var parentLay = curPiece.layer;

		while(curPiece.pageItems.length)
		{
			var curSwatch = dig(curPiece);

			if(!curSwatch || !curSwatch.swatchName)
			{
				overflowItems.push(curPiece);
				curPiece.moveToBeginning(overflowLayer);
				alert("failed to determine curSwatch");
				continue;
			}
			docRef.selection = null;
			if(curSwatch.swatchType === "stroke")
			{
				docRef.defaultStrokeColor = swatches[curSwatch.swatchName].color;
				app.executeMenuCommand("Find Stroke Color menu item");
			}
			else if(curSwatch.swatchType === "fill")
			{
				docRef.defaultFillColor = swatches[curSwatch.swatchName].color;
				app.executeMenuCommand("Find Fill Color menu item");
			}
			else
			{
				$.writeln("swatchType was undefined.");
				break;
			}

			if(!docRef.selection.length)
			{
				$.writeln("no selection matching the color: " + curSwatch.swatchName);
				break;
			}

			// app.cut();
			// docRef.activeLayer = tmpLay;
			// app.executeMenuCommand("pasteInPlace");
			// app.executeMenuCommand("group");
			// app.redraw();
			// tmpGroup = docRef.selection[0];
			// tmpGroup.name = curSwatch.swatchName;


			moveSelectionToTempLayer(curSwatch.swatchName);
			
			
			// app.redraw();
		}


		//sort the result array by total area then stack them in descending order 
		//when putting them back into their parent group.
		var prodGroup = sortItemsBySize(prodResult,"Prod Info");
		var artGroup = sortItemsBySize(artResult,"Artwork");

		var newPieceGroup = parentLay.groupItems.add();
		newPieceGroup.name = parentPieceName;
		
		// for(var x=0,len=sortedResult.length;x<len;x++)
		// {
		// 	$.writeln("moving " + sortedResult[x] + " to newPieceGroup");
		// 	sortedResult[x].moveToBeginning(newPieceGroup);
		// }

		artGroup.moveToBeginning(newPieceGroup);
		prodGroup.moveToBeginning(newPieceGroup);

		newPieceGroup.moveToBeginning(parentLay);
		docRef.selection = null;
		return newPieceGroup;

	}


	//sort the items of an array by their total area
	//then put them into a named group
	//then return that groupItem
	function sortItemsBySize(arr,groupName)
	{
		var result = [];
		var group = tmpLay.groupItems.add();
		group.name = groupName;

		while(arr.length)
		{
			var largest = arr[0];
			var largestBounds = getArea(largest);
			var spliceIndex = 0;

			for(var x=1,len=arr.length;x<len;x++)
			{
				if(getArea(arr[x]) > largestBounds)
				{
					largest = arr[x];
					largestBounds = getArea(largest);
					spliceIndex = x;
				}
			}

			result.push(largest);
			arr.splice(spliceIndex,1);
		}

		for(var x=result.length-1;x>=0;x--)
		{
			// result[x].moveToBeginning(group);
			result[x].moveToEnd(group);
		}
		return group;
	}

	function moveSelectionToTempLayer(swatchName)
	{
		// try
		// {
		// 	tmpGroup = tmpLay.groupItems[swatchName];
		// }
		// catch(e)
		// {
		// 	tmpGroup = tmpLay.groupItems.add();
		// 	tmpGroup.name = swatchName;
		// }

		// tmpGroup = tmpLay.groupItems.add();
		// tmpGroup.name = swatchName;

		app.executeMenuCommand("group");
		tmpGroup = docRef.selection[0];
		tmpGroup.name = swatchName;
		tmpGroup.moveToBeginning(tmpLay);

		// for(var x=0,len=docRef.selection.length;x<len;x++)
		// {
		// 	docRef.selection[x].moveToEnd(tmpGroup);
		// }

		if(tmpGroup.typename === "PathItem")
		{
			var newGroup = tmpLay.groupItems.add();
			newGroup.name = tmpGroup.name;
			tmpGroup.moveToBeginning(newGroup);
			tmpGroup = newGroup;
		}
		if(tmpGroup.pageItems.length)
		{
			if(BOOMBAH_PRODUCTION_COLORS.indexOf(swatchName)>-1)
			{
				prodResult.push(tmpGroup);
			}
			else
			{
				artResult.push(tmpGroup);
			}
		}
	}

	function getArea(item)
	{
		return item.height * item.width;
	}

	function groupSelection(parent)
	{
		var doc = app.activeDocument;
		var sel = doc.selection;
		parent.locked = false;
		parent.visible = true;
		var result = parent.groupItems.add();

		for(var x = sel.length-1;x>=0;x--)
		{
			sel[x].moveToBeginning(result);
		}
		return result;
	}

	function dig(item)
	{
		if(item.typename === "PathItem" || item.typename === "CompoundPathItem")
		{
			if(item.typename === "CompoundPathItem" && item.pathItems.length)
			{
				item = item.pathItems[0];
			}
			else if(item.typename === "CompoundPathItem" && !item.pathItems.length)
			{
				$.writeln("NO PATH ITEMS!NO PATH ITEMS!NO PATH ITEMS!NO PATH ITEMS!NO PATH ITEMS!NO PATH ITEMS!NO PATH ITEMS!NO PATH ITEMS!NO PATH ITEMS!")
				return null;
			}
			if(item.filled)
			{
				digResult.swatchType = "fill";
				if(item.fillColor.spot)
				{
					try
					{
						digResult.swatchName = item.fillColor.spot.name;
					}
					catch(e)
					{
						$.writeln("failed to read the name of the spot color...");
					}
				}
				else if(item.fillColor.typename === "CMYKColor")
				{
					digResult.swatchName = "{C:" +  item.fillColor.cyan + 
					",M:" + item.fillColor.magenta + 
					",Y:" + item.fillColor.yellow +
					",K:" + item.fillColor.black + "}";
				}
				else if(item.fillColor.typename === "RGBColor")
				{
					digResult.swatchName = "{R:" + item.fillColor.red +
					",G:" + item.fillColor.green + 
					",B:" + item.fillColor.blue + "}";
				}
			}
			else if(item.stroked)
			{
				digResult.swatchType = "stroke"
				if(item.strokeColor.spot)
				{
					digResult.swatchName = item.strokeColor.spot.name;
				}
				else if(item.strokeColor.typename === "CMYKColor")
				{
					digResult.swatchName = "{C:" +  item.strokeColor.cyan + 
					",M:" + item.strokeColor.magenta + 
					",Y:" + item.strokeColor.yellow +
					",K:" + item.strokeColor.black + "}";
				}
				else if(item.strokeColor.typename === "RGBColor")
				{
					digResult.swatchName = "{R:" + item.strokeColor.red +
					",G:" + item.strokeColor.green + 
					",B:" + item.strokeColor.blue + "}";
				}
			}
			if(item.filled && item.stroked)
			{
				filledAndStrokedObjects.push(item);
			}
		}
		else if(item.typename === "RasterItem" || item.typename === "PlacedItem")
		{
			digResult = null;
			return digResult;
		}
		else if(item.typename === "GroupItem" || item.typename === "Layer")
		{
			for(var d=0,len=item.pageItems.length;d<len;d++)
			{
				if(dig(item.pageItems[d]))break;
			}
		}
		return digResult;

	}




	executor();
}
GroupByColor();