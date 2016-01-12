$.getScript("assets/js/bootstrap.min.js", function() {
});
$.getScript("assets/js/bootstrap-slider.js", function() {
});

var year_global = 2000;
	
$(document).ready(function() {

	$("#ex14").slider({
		ticks: [0, 25, 50, 75, 80, 85, 90, 95, 100, 105, 110, 115],
		ticks_labels: ['1900', '1925', '1950', '1975', '1980', '1985', '1990', '1995', '2000', '2005', '2010', '2015'],
		ticks_positions: [0, 5, 10, 15, 22, 30, 37, 45, 55, 70, 85, 100],
		ticks_snap_bounds: 0
	});

	$("#ex14").slider().change(function() {
		var mySlider = $("#ex14").slider();
		var value = mySlider.slider('getValue');
		var yr = value + 1900;
		$("#year").text(yr); 
		year_global = yr;
		update_charts(yr);
	});
    
    var mySlider = $("#ex14").slider();
    //mySlider.setValue(year_global);


	$("#year").html(year_global);

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
		
		update_chart_1_sex();
	});
	
	$("#select_sex_male").on("change", function() {
		
		update_chart_1_sex();
	});
	
	function update_chart_1_sex(){
		
		male = $("#select_sex_male").is(':checked');
		female = $("#select_sex_female").is(':checked');

		render(male, female);
	}

// initial render
	render(true, true);
	
// render function
	function render(male, female){
			
		d3.select("#chart_1 svg").remove();
				
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

/* new year was selected */
	function update_charts( selected_year ){
		
		render_chart_2( selected_year );
		render_chart_3( selected_year );
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

render_chart_2( 2000 );
	
function render_chart_2( selected_year ){
	
	d3.select("#chart_2 svg").remove();
	d3.select("#chart_2").html("");
	
	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
		return "<strong>" + d.data.age + ": " + d.data.population + "</strong>";
	  })
	
	var svg_2 = d3.select("#chart_2").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	svg_2.call(tip);
	
	d3.csv("data/population_dentisy.csv", function(error, udata) {

		var data = udata.filter(function(row) {
			return row["year"] == selected_year
		});

		if( data != "" ){

			data.forEach(function(d) {
				d.population = +d.population;
			});

			var g = svg_2.selectAll(".arc")
				.data(pie(data))
				.enter().append("g")
				.attr("class", "arc")
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

			g.append("path")
				.attr("d", arc)
				.style("fill", function(d) { return color(d.data.age); });

			g.append("text")
				.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
				.attr("dy", ".35em")
				.style("text-anchor", "middle");
			
		} else {
			
			d3.select("#chart_2").html("Keine Daten verfügbar.");
		}
	});
}

/* CHART 3 */

var width = document.getElementById('chart_3').offsetWidth - 100,
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

render_chart_3( 2000 );

// change type
	$("#select_percental").on("change", function() {
		
		render_chart_3(year_global, 2);
	});
	
	$("#select_absolute").on("change", function() {
		
		render_chart_3(year_global, 1);
	});

function render_chart_3( selected_year, type = 2 ){
	
	d3.select("#chart_3 svg").remove();
	d3.select("#chart_3").html("");
	
	if( type == 1 ){
		
		var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
			return "<strong>" + d.data.age + ": " + d.data.population + "</strong>";
		  })
		  
	} else if( type == 2 ){
		
		var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
			return "<strong>" + d.data.age + ": " + (d.data.population).toFixed(2) + " %</strong>";
		  })
	}
	
	
	var svg_3 = d3.select("#chart_3").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	svg_3.call(tip);
	
	d3.csv("data/unemployed_density_ratio.csv", function(error, udata) {

		var data = udata.filter(function(row) {
		return row["year"] == selected_year
		});

		if( data != "" ){
			
			if( type == 1 ){
				
				data.forEach(function(d) {
					d.population = +d.unemployed;
				});
				  
			} else if( type == 2 ){
				
				data.forEach(function(d) {
					d.population = +(d.unemployed / (d.population / 100));
				});
				
			}

			var g = svg_3.selectAll(".arc")
				.data(pie(data))
				.enter().append("g")
				.attr("class", "arc")
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

			g.append("path")
				.attr("d", arc)
				.style("fill", function(d) { return color(d.data.age); });

			g.append("text")
				.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
				.attr("dy", ".35em")
				.style("text-anchor", "middle");
			
		} else {
			
			d3.select("#chart_3").html("Keine Daten verfügbar.");
		}
	});
}