function test()
{
	var valid = true;
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var aB = docRef.artboards;
	var swatches = docRef.swatches;
	var obj = {};
	var swatchNameList = [];

	for(var x=0,len=swatches.length;x<len;x++)
	{
		swatchNameList.push(swatches[x].name);
	}

	var arr = [];

	var w = new Window("dialog");
		var topTxt = UI.static(w,"Select the swatches you want to change");
		var inputGroup = UI.group(w);
			inputGroup.orientation = "column";

		addInputGroups();

		var btnGroup = UI.group(w);
			var cancel = UI.button(btnGroup,"Cancel",function()
			{
				valid = false;
				w.close();
			});
			var submit = UI.button(btnGroup,"Submit",function()
			{
				updateArr(inputGroup);
				// replaceSwatches();
				w.close();
			})



	w.show();




	function addInputGroups()
	{
		for(var x=0,len=swatches.length;x<len;x++)
		{
			createInputGroup(inputGroup,swatches[x],x);
		}
	}

	function createInputGroup(parent,swatch,index)
	{
		var result = UI.group(parent);
			var dd_swatches = UI.dropdown(result,swatchNameList);
				dd_swatches.selection = index;
			UI.vseparator(result,50);
			var input_replacement = UI.edit(result,"New Swatch Name");
		return result;
	}

	function updateArr(parent)
	{
		var result = [];
		var tmpObj = {};

		for(var x=0,len=parent.items;x<len;x++)
		{
			tmpObj = {};
			tmpObj.oldSwatch = parent.children[0].children[0].selection.text;
			tmpObbj.newSwatch = parent.children[0].children[2].text;
			result.push(tmpObj)
		}
		arr = result;
	}


	function updateSwatches()
	{
		var tmpSwatchValues = {"cyan":10,"magenta":10,"yellow":10,"black":10};

		for(var x=0,len=arr.length;x<len;x++)
		{
			
		}
	}
	
}
test();