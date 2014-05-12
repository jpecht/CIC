d3.select(window).on("resize", throttle);

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", move);

var width = document.getElementById('container').offsetWidth-60;
var height = width / 2;

var topo,stateMesh,projection,path,svg,g;

var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");

var selectedData,
	selectedDataText = "GDP Growth, 2013",
	primeInd = {},
	dataYear,
	data,
	legend;
	
var quantById = []; 
var nameById = [];

var max,
	min,
	median,
	quantOneThird,
	quantTwoThird,
	range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
	
var color = d3.scale.quantile();

d3.tsv("CountyData.tsv", function (error, countyData) {
	data = countyData;
	
	countyData.forEach(function(d) { 
	  	quantById[d.id] = +d.RGDPGrowth13; 
	  	nameById[d.id] = d.geography;
	});
	/*
	max = Math.ceil(d3.max(quantById)*100)/100;
	min = Math.floor(d3.min(quantById)*100)/100;
	median = Math.round(d3.median(quantById)*100)/100;
	*/
	color
		.domain(quantById)
		.range(range);
	
	console.log(color.quantiles());
	
	d3.select(".legend").append("div").attr("id", "legendTitle").text(selectedDataText);
	legend = colorlegend("#quantileLegend", color, "quantile", {title: "legend", boxHeight: 15, boxWidth: 30});
});


setup(width,height);

function setup(width,height){
  projection = d3.geo.albersUsa()
    .translate([0, 0])
    .scale(width *1.1);

  path = d3.geo.path()
      .projection(projection);

  svg = d3.select("#map").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .call(zoom);

  g = svg.append("g")
  		.attr("class", "counties");

}
	

d3.json("us.json", function(error, us) {

  var counties = topojson.feature(us, us.objects.counties).features;
  var states = topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; });

  topo = counties;
  stateMesh = states;
  
  draw(topo, stateMesh);
  

});

function draw(topo, stateMesh) {

  var county = g.selectAll(".county").data(topo);
  
  county.enter().insert("path")
      .attr("class", "county")
      .attr("d", path)
      .attr("id", function(d){ return d.id;})
      .style("fill", function(d) { if(!isNaN(quantById[d.id])){return color(quantById[d.id]);} else{return "#ccc";} });

  g.append("path")
		      .datum(stateMesh)
		      .attr("id", "state-borders")
		      .attr("d", path);
  
  
  //ofsets plus width/height of transform, plsu 20 px of padding, plus 20 extra for tooltip offset off mouse
  var offsetL = document.getElementById('container').offsetLeft+(width/2)+40;
  var offsetT = document.getElementById('container').offsetTop+(height/2)+20;

  //tooltips
  county
    .on("mousemove", function(d,i) {
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        tooltip
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
          .html(d.properties.name);
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      }); 
      
	selectedData = "PILT Amount";
	selectedDataset = "Payment in Lieu of Taxes (PILT)";
  	getData(selectedData, selectedDataset);
   
}

function update(primeInd, primeIndYear){
	//Will first break the JSON object into component parts here:
	primeIndText = primeInd.name;
	primeIndUnits = primeInd.units;
	dataType = primeInd.dataType;
	
	//will need to redefine "data" variable to be our returned data from the GET call	
	data.forEach(function(d){
		quantById[d.id] = +d[primeIndText]; 
  		//nameById[d.id] = d.geography;
	});
	
	
	//chooseCat(value);
	//	legendMaker(domain, range, units, legendTitleText, notes, sourceText);
	switch(dataType){
		case "percent":
			primeIndUnits = "percent";
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			color
				.domain(quantById)
				.range(range);
			d3.selectAll(".legend svg").remove();  d3.select("#legendTitle").remove();
			d3.select(".legend").append("div").attr("id", "legendTitle").text(primeIndYear + " " + primeIndText + " in " + primeIndUnits);
			legend = colorlegend("#quantileLegend", color, "quantile", {title: "legend", boxHeight: 15, boxWidth: 40});
			break;
		case "divergent":
			range = ['rgb(215,25,28)','rgb(253,174,97)','rgb(255,255,191)','rgb(171,217,233)','rgb(44,123,182)'];
			//get the center-point from somewhere
			break;
		case "binary":
			range = ['rgb(255,204,102)', 'rgb(201,228,242)'];
			break;
		case "categorical":
			range = ['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)','rgb(255,127,0)'];
			//figure out categories
			break;
		default:
			range = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'];
			//continous, so we don't have to have this property in the JSON
			//figure out rounding/formatting
			
			break;
	}
	
	g.selectAll(".counties .county")
	  .transition()
      .duration(750)
	  .style("fill", function(d) { if(!isNaN(quantById[d.id])){return color(quantById[d.id]);} else{return "rgb(155,155,155)";} });
}


$("#primeInd li a").click(function() {
	selectedData = this.title;
	selectedDataset = this.name;
	selectedDataText = this.innerHTML;
	d3.select('#primeIndText').html(selectedDataText);
	
	getData(selectedData, selectedDataset);
});

var structure, extraInd = [], extraIndYears = [];

//Alternative to this big lookup is to list a i,j,h "JSON address" in the HTML anchor properties.  Would still likely require some type of HTML or JSON lookup for companion indicators though
function getData(indName, datasetName){
	d3.json("data/CICstructure.json", function(error, CICStructure){
		var Jcategory;
		structure = CICStructure.children;
		for(i=0; i<structure.length; i++){
			for(j=0; j<structure[i].children.length; j++){
				if(structure[i].children[j].name==datasetName){
					Jcategory = structure[i];
					var Jdataset = structure[i].children[j];
					primeIndYear = d3.max(Jdataset.years);
					//will also want vintage, source, companions, and dataNotes properties from here
					vintage = Jdataset.vintage;
					sourceText = Jdataset.source;
					companions = Jdataset.companions;
					dataNotes = Jdataset.notes;
					for(h=0; h<Jdataset.children.length; h++){
						if(indName==Jdataset.children[h].name){
							primeInd = Jdataset.children[h];
							//primeInd is a JSON object from CIC-structure with the properties: name, units, dataType
						}
					}
				}
			}
		}
		//getCompanionData(Jcategory);
		//temporary switch to override this function while using tsv data
		switch(primeInd.name){
			case "PILT Amount":
				primeInd ={ 
					'name': "RGDPGrowth13",
					'dataType': "percent"
				};
				primeIndYear = '2013';
				break;
			default:
				primeInd = {
					"name": "HHpriceGrowth13",
					"dataType": "percent"
				};
				primeIndYear = '2013';
				break;
		};
		//
		///
		//This is Where GET requests are issued to the server for JSON with fips, county name/state, plus primeIndText, extraInd1Text, extraInd2Text, and extraInd3Text; redefine "data" variable as this JSON
		//"data" should be structured as a JSON with an array of each county.  each county has properties "id"(fips), "geography"(county name, ST), and each of the indicators specified above
		//
		//Will move update(selectedData) down here and replace with update(primeInd, primeIndYear)
		update(primeInd, primeIndYear);
	});	
}
//comnpanion data always has to be run AFTER getData
function getCompanionData(Jcategory){
	for(k=0; k<companions.length; k++){
		for(i=0; i<Jcategory.children.length; i++){
			for(j=0; j<Jcategory.children[i].children.length; j++){
				if(companions[k]==Jcategory.children[i].children[j].name){
					extraInd[k] = Jcategory.children[i].children[j];
					//extraInd is an array of JSON objects from CIC-structure with the properties: name, units
					extraIndYears[k] = d3.max(Jcategory.children[i].years);
				}
			}
		}
	}
	extraInd1Text = extraInd[0].name;
	extraInd1Units = extraInd[0].unit;
	extraInd1Year = extraIndYears[0];
	extraInd2Text = extraInd[1].name;
	extraInd2Units = extraInd[2].unit;
	extraInd2Year = extraIndYears[1];
	extraInd3Text = extraInd[2].name;
	extraInd3Units = extraInd[2].unit;
	extraInd3Year = extraIndYears[2];
}

function redraw() {
  width = document.getElementById('container').offsetWidth-60;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
  draw(topo, stateMesh);
}

function move() {

  var t = d3.event.translate;
  var s = d3.event.scale;  
  var h = height / 3;
  
  t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
  t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

  zoom.translate(t);
  g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

}

var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}
