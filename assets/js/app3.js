var svgWidth = 960;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 220
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}
// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis] - 2),
        d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on x-axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup
        .transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
        return circlesGroup;
}

// function used for updating state abbr location with transition to new location
function renderState(stateAbbr, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    stateAbbr
        .transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return stateAbbr;
}




// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty:";
    }
    if (chosenXAxis === "age") {
        var xLabel = "Age (Median):";
    }
    if (chosenXAxis === "income") {
        var xLabel = "Household Income:";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "Healthcare: ";
    }
    if (chosenYAxis === "smokes") {
        var yLabel = "Smokes: ";
    }
    if (chosenYAxis === "obesity") {
        var yLabel = "Obese: ";
    }

    // Tooltip to display info on a dynamic scale when updating x-axis and y-axis
    var toolTip = d3.tip()
        .attr("class", "d3-tip")

        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}
                    <br>${yLabel}${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    // mouseover to activate tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // on mouseout to deactivate
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (data) {
    // Console log the data to determine which fields to grab
    console.log(data);

    // Cast data we need as numbers
    data.forEach(function (data) {
        data.smokes = +data.smokes;
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
    });
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Create yLinearScale function
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis] - 2),
        d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll(".stateCircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "stateCircle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("opacity", ".3");

    var stateAbbr = chartGroup.selectAll(".stateText")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "stateText")
            .attr("text-anchor", "middle")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .text(data => data.abbr)
            .attr("class", "scatterText");

    // Create xLabels options
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var householdLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    

    // Create yLabel options
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -450)
        .attr("x", 300)
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokeLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -470)
        .attr("x", 300)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -490)
        .attr("x", 300)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                // update state abbr location
                stateAbbr = renderState(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // activate class with chosen x-axis option
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                if (chosenXAxis === "age") {
                    povertyLabel.classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    householdLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } if (chosenXAxis === "income") {
                    povertyLabel.classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // Create y-axis labels option event listerner
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                console.log(chosenYAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates x axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                // update the state abbr location
                stateAbbr = renderState(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);




                // changes class on the y-axis on options
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } if (chosenYAxis === "obesity") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});
