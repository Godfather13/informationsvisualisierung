$.getScript("assets/js/bootstrap.min.js", function() {
});
$.getScript("assets/js/bootstrap-slider.js", function() {
});

$( document ).ready(function() {
	$("#year").html("1990");
});


/* CHART 1 */

// specific display variables
	var margin_pop_chart = {top: 20, right: 40, bottom: 30, left: 20},
		width_pop_chart = document.getElementById('chart_1').offsetWidth - 50 - margin_pop_chart.left - margin_pop_chart.right,
		height_pop_chart = 500 - margin_pop_chart.top - margin_pop_chart.bottom,
		barWidth_pop_chart = Math.floor(width_pop_chart / 19) - 1;

	var x_pop_chart = d3.scale.linear()
		.range([barWidth_pop_chart / 2, width_pop_chart - barWidth_pop_chart / 2]);

	var y_pop_chart = d3.scale.linear()
		.range([height_pop_chart, 0]);

	var yAxis_pop_chart = d3.svg.axis()
		.scale(y_pop_chart)
		.orient("right")
		.tickSize(-width_pop_chart)
		.tickFormat(function(d) { return Math.round(d / 1e6) + "M"; });

// change sex
	$("#select_sex_female").on("change", function() {
		
		update_char_1_sex();
	});
	
	$("#select_sex_male").on("change", function() {
		
		update_char_1_sex();
	});
	
	function update_char_1_sex(){
		
		male = $("#select_sex_male").is(':checked');
		female = $("#select_sex_female").is(':checked');

		render(male, female);
	}

// initial render
	render(true, true);
	
// render function
	function render(male, female){
			
		d3.select("svg").remove();
				
		// An SVG element with a bottom-right origin.
			var svg_pop_chart = d3.select("#chart_1").append("svg")
				.attr("width", width_pop_chart + margin_pop_chart.left + margin_pop_chart.right)
				.attr("height", height_pop_chart + margin_pop_chart.top + margin_pop_chart.bottom)
				.append("g")
				.attr("transform", "translate(" + margin_pop_chart.left + "," + margin_pop_chart.top + ")");

		// A sliding container to hold the bars by birthyear.
			var birthyears = svg_pop_chart.append("g").attr("class", "birthyears");
					
		// ---
			d3.csv("data/population.csv", function(error, raw_data) {
				
				// Convert strings to numbers.
					raw_data.forEach(function(d) {
						d.people = +d.people;
						d.year = +d.year;
						d.age = +d.age;
					});
					
				// Split in male and female
					var male_data = raw_data.filter(function(row) {
						return row["sex"] == 1});
					
					var female_data = raw_data.filter(function(row) {
						return row["sex"] == 2});
				
				// merge data
					if(male && female) data = $.merge(male_data, female_data);
					if(!male && female) data = female_data;
					if(male && !female) data = male_data;
					if(!male && !female) data = [];

				// initially compute the extent of the data set in age and years.
					var age1, year0, year1, year, birthyear;
						
				// Compute the extent of the data set in age and years.
					age1 = d3.max(data, function(d) { return d.age; }),
					year0 = d3.min(data, function(d) { return d.year; }),
					year1 = d3.max(data, function(d) { return d.year; }),
					year = year1;

				// Update the scale domains.
					x_pop_chart.domain([year1 - age1, year1]);
					y_pop_chart.domain([0, d3.max(data, function(d) { return d.people; })]);

				// Produce a map from year and birthyear to [male, female].
					data = d3.nest()
						.key(function(d) { return d.year; })
						.key(function(d) { return d.year - d.age; })
						.rollup(function(v) { return v.map(function(d) { return d.people; }); })
						.map(data);

				// Add an axis to show the population values.
					svg_pop_chart.append("g")
						.attr("class", "y axis")
						.attr("transform", "translate(" + width_pop_chart + ",0)")
						.call(yAxis_pop_chart)
						.selectAll("g")
						.filter(function(value) { return !value; })
						.classed("zero", true);
				
				// Add labeled rects for each birthyear (so that no enter or exit is required).
					birthyear = birthyears.selectAll(".birthyear")
						.data(d3.range(year0 - age1, year1 + 1, 5))
						.enter().append("g")
						.attr("class", "birthyear")
						.attr("transform", function(birthyear) { return "translate(" + x_pop_chart(birthyear) + ",0)"; });

					birthyear.selectAll("rect")
						.data(function(birthyear) { return data[year][birthyear] || [0, 0]; })
						.enter().append("rect")
						.attr("x", -barWidth_pop_chart / 2)
						.attr("width", barWidth_pop_chart)
						.attr("y", y_pop_chart)
						.attr("class", !male && female ? "only_female" : "" )  
						.attr("height", function(value) { return height_pop_chart - y_pop_chart(value); });

				// Add labels to show birthyear.
					birthyear.append("text")
						.attr("y", height_pop_chart - 4)
						.text(function(birthyear) { return birthyear; });
						
				// Add labels to show age (separate; not animated).
					svg_pop_chart.selectAll(".age")
						.data(d3.range(0, age1 + 1, 5))
						.enter().append("text")
						.attr("class", "age")
						.attr("x", function(age) { return x_pop_chart(year - age); })
						.attr("y", height_pop_chart + 4)
						.attr("dy", ".71em")
					.text(function(age) { return age; });

				// change year
					d3.select("#year").on("DOMSubtreeModified", function(){

						year = $("#year").html();
						update_char_1();
					});
			  
					function update_char_1(){
						  
						if( !(year in data) ) return;

						birthyears.transition()
							.duration(750)
							.attr("transform", "translate(" + (x_pop_chart(year1) - x_pop_chart(year)) + ",0)");

						birthyear.selectAll("rect")
							.data(function(birthyear) { return data[year][birthyear] || [0, 0]; })
							.transition()
							.duration(750)
							.attr("y", y_pop_chart)
							.attr("height", function(value) { return height_pop_chart - y_pop_chart(value); });
					}
			});
	}
	
/* CHART 2 */

var width = document.getElementById('chart_2').offsetWidth - 50,
    height = 300,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.population; });

var svg_2 = d3.select("#chart_2").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("data/pie_data.csv", function(error, udata) {

	var data = udata.filter(function(row) {
	return row["year"] == 1990});

	data.forEach(function(d) {
		d.population = +d.population;
	});

	var g = svg_2.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");

	g.append("path")
		.attr("d", arc)
		.style("fill", function(d) { return color(d.data.age); });

	g.append("text")
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text(function(d) { return d.data.age; });
});

/* CHART 3 */

var width = document.getElementById('chart_3').offsetWidth - 50,
    height = 300,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.population; });

var svg_3 = d3.select("#chart_3").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("data/pie_data.csv", function(error, data) {

  data.forEach(function(d) {
    d.population = +d.population;
  });

  var g = svg_3.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.age); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.age; });

});


/* CHART 4 */

var margin = {top: 30, right: 20, bottom: 30, left: 40},
    width = document.getElementById('chart_4').offsetWidth - 50 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
	
var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  })

var svg_4 = d3.select("#chart_4").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg_4.call(tip);

d3.tsv("data/bar_data.tsv", type, function(error, data) {
  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svg_4.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg_4.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  svg_4.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

});

function type(d) {
  d.frequency = +d.frequency;
  return d;
}