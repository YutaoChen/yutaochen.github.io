function loadCircularHeatMap (dataset, dom_element_to_append_to,radial_labels,segment_labels) {

    var margin = {top: 50, right: 100, bottom: 50, left: 20};
    var width = 800 - margin.left - margin.right;

    var height = width + 100;
    var innerRadius = width/2 + 5;
    var segmentHeight = (width - margin.top - margin.bottom - 2*innerRadius )/(2*radial_labels.length)

    var chart = circularHeatChart()
    .innerRadius(innerRadius)
    .segmentHeight(segmentHeight)
    .range(["#fee0d2", "#a50f15"])
    .radialLabels(radial_labels)
    .segmentLabels(segment_labels);

    chart.accessor(function(d) {return d.value;})

    var svg = d3.select(dom_element_to_append_to)
    .selectAll('svg')
    .data([dataset])
    .enter()
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
        "translate(" + ( (width )/2 - (radial_labels.length*segmentHeight + innerRadius)  ) + "," + margin.top + ")")
    .call(chart);


              svg.append("text")
            .attr("x", (width / 2 - margin.left / 5 + 30))
            .attr("y", 0 - (margin.top /3))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("padding", "100px")
            .style("font-family", "'Roboto', sans-serif")
            .text("Mining Accidents Reported by Mine Operators and Contractors since 2000");


                      svg.append("text")
                      .attr("x", width - 100)
                      .attr("y", height - margin.left)
                      .attr("text-anchor", "middle")
                      .style("font-family", "'Roboto', sans-serif")
                      .style("font-size", "12px")
                      .text("Source: Mine Safety and Health Administration");





    var tooltip = d3.select(dom_element_to_append_to)
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'month');
    tooltip.append('div')
    .attr('class', 'value');
    tooltip.append('div')
    .attr('class', 'year');
    tooltip.append('div')
    .attr('class', 'fatalities');
    tooltip.append('div')
    .attr('class', 'disabilities');

    svg.selectAll("path")
    .on('mouseover', function(d) {
        tooltip.select('.month').html("<strong style='color:#0570b0; font-size:17px;'>" + d.month_tx + "</stong>" + " " + d.year);
        tooltip.select('.value').html("<strong style='color:firebrick; font-size:13px;'>" + d.value + "</stong>" + " <strong style='color:black;'>accidents</strong>");
        tooltip.select('.fatalities').html("<strong style='color:firebrick; font-size:13px;'>" + d.fatalities + "</stong>" + " fatal <strong style='color:black;'>ones</strong>");
        tooltip.select('.disabilities').html("<strong style='color:firebrick; font-size:13px;'>" + d.disabilities + "</stong>" + " <strong style='color:black;'>led to </strong>permanent disability");


        tooltip.style('display', 'block');
        tooltip.style('opacity',2);
    })
    .on('mousemove', function(d) {

        tooltip.style('top', (height/2 - 5) + 'px')
               .style('left', (width/2 + 42) + 'px');
    })
    .on('mouseout', function(d) {
        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });
}

function circularHeatChart() {
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    innerRadius = 20,
    numSegments = 12,
    segmentHeight = 20,
    domain = null,
    range = ["white", "red"],
    accessor = function(d) {return d;},
    radialLabels = segmentLabels = [];

    function chart(selection) {
        selection.each(function(data) {
            var svg = d3.select(this);

            var offset = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight + 250;
            g = svg.append("g")
                .classed("circular-heat", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            var autoDomain = false;
            if (domain === null) {
                domain = d3.extent(data, accessor);
                autoDomain = true;
            }
            var color = d3.scale.linear().domain(domain).range(range);
            if(autoDomain)
                domain = null;

            g.selectAll("path").data(data)
                .enter().append("path")
                .attr("d", d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
                .attr("stroke", function(d) {return "#f7f7f7";})
                .attr("fill", function(d) {return color(accessor(d));});

            // Unique id so that the text path defs are unique - is there a better way to do this?
            var id = d3.selectAll(".circular-heat")[0].length;

            //Radial labels
            var lsa = 0.01; //Label start angle
            var labels = svg.append("g")
                .classed("labels", true)
                .classed("radial", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            labels.selectAll("def")
                .data(radialLabels).enter()
                .append("def")
                .append("path")
                .attr("id", function(d, i) {return "radial-label-path-"+id+"-"+i;})
                .attr("d", function(d, i) {
                    var r = innerRadius + ((i + 0.8) * segmentHeight);
                    return "m" + r * Math.sin(lsa) + " -" + r * Math.cos(lsa) +
                            " a" + r + " " + r + " 0 1 1 -1 0";
                });

            labels.selectAll("text")
                .data(radialLabels).enter()
                .append("text")
                .append("textPath")
                .attr("xlink:href", function(d, i) {return "#radial-label-path-"+id+"-"+i;})
                .style("font-size", "10px")
                .style("fill", "white")
                .style("font-family", "'Roboto', sans-serif")
                .text(function(d) {return d;});

            //Segment labels
            var segmentLabelOffset = 5;
            var r = 247 + innerRadius + Math.ceil(data.length / numSegments) * segmentHeight + segmentLabelOffset;
            labels = svg.append("g")
                .classed("labels", true)
                .classed("segment", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            labels.append("def")
                .append("path")
                .attr("id", "segment-label-path-"+id)
                .attr("d", "m0 -" + r + " a" + r + " " + r + " 0 1 1 -1 0");

            labels.selectAll("text")
                .data(segmentLabels).enter()
                .append("text")
                .append("textPath")
                .attr("xlink:href", "#segment-label-path-"+id)
                .style("font-family", "'Roboto', sans-serif")
                .style("font-size", "14px")
                .attr("startOffset", function(d, i) {return i * 100 / numSegments + "%";})
                .text(function(d) {return d;});
        });

    }



    /* Arc functions */
    ir = function(d, i) {
        return innerRadius + Math.floor(i/numSegments) * segmentHeight;
    }
    or = function(d, i) {
        return innerRadius + segmentHeight + Math.floor(i/numSegments) * segmentHeight;
    }
    sa = function(d, i) {
        return (i * 2 * Math.PI) / numSegments;
    }
    ea = function(d, i) {
        return ((i + 1) * 2 * Math.PI) / numSegments;
    }

    /* Configuration getters/setters */
    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.innerRadius = function(_) {
        if (!arguments.length) return innerRadius;
        innerRadius = _;
        return chart;
    };

    chart.numSegments = function(_) {
        if (!arguments.length) return numSegments;
        numSegments = _;
        return chart;
    };

    chart.segmentHeight = function(_) {
        if (!arguments.length) return segmentHeight;
        segmentHeight = _;
        return chart;
    };

    chart.domain = function(_) {
        if (!arguments.length) return domain;
        domain = _;
        return chart;
    };

    chart.range = function(_) {
        if (!arguments.length) return range;
        range = _;
        return chart;
    };

    chart.radialLabels = function(_) {
        if (!arguments.length) return radialLabels;
        if (_ == null) _ = [];
        radialLabels = _;
        return chart;
    };

    chart.segmentLabels = function(_) {
        if (!arguments.length) return segmentLabels;
        if (_ == null) _ = [];
        segmentLabels = _;
        return chart;
    };

    chart.accessor = function(_) {
        if (!arguments.length) return accessor;
        accessor = _;
        return chart;
    };

    return chart;
}
