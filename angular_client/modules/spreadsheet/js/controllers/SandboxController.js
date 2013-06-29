console.log("Loading the SandboxController.");

'use strict';
define(
    [ "angular" ],
    function(angular) {
      var SandboxController = function($scope, $rootScope, $resource,
          Data) {

        $scope.data = getData();
        $scope.data.sort(function(a, b) {
          var dateA = new Date(a.date), dateB = new Date(b.date);
          return dateA - dateB;
        });

        var availableMonths = [];
        availableMonths.push($scope.data[0].date.substring(0,
            $scope.data[0].date.lastIndexOf("-")));
        var monthDay = "";
        var previousMonthDay = "";
        for (i in $scope.data) {
          monthDay = $scope.data[i].date.substring(0, $scope.data[i].date
              .lastIndexOf("-"));
          if ($scope.data[i - 1]) {
            previousMonthDay = $scope.data[i - 1].date.substring(0,
                $scope.data[i - 1].date.lastIndexOf("-"));
            if (monthDay != previousMonthDay) {
              availableMonths.push(monthDay);
            }
          }
        }
        $scope.availableMonths = availableMonths;

        // d3 BAR GRAPH
        $scope.makeGraph = function(yearMonth) {

          var allData = getData();

          var data = [];
          var yearMonthInAllData = "";
          if (yearMonth && yearMonth != 'all') {
            for ( var i = 0; i < allData.length; i++) {
              (function(index) {
                yearMonthInAllData = allData[i].date.substring(0,
                    allData[i].date.lastIndexOf("-"));
                if (yearMonthInAllData == yearMonth) {
                  data.push(allData[i]);
                }
              })(i)
            }

          } else {
            data = allData.slice();
          }

          // Sort data by date ascending
          data.sort(function(a, b) {
            var dateA = new Date(a.date), dateB = new Date(b.date);
            return dateA - dateB;
          });

          // Find the size of the largest column
          var maxEntries = data[0].entries;
          var maxValuesObj = {};
          var currentDate = "";

          maxValuesObj[data[0].date] = data[0].entries;

          for ( var i = 0; i < data.length; i++) {
            (function(index) {
              currentDate = data[i].date;
              // Test for multiple dates and add together
              if (data[i - 1] && data[i].date == data[i - 1].date) {
                maxValuesObj[currentDate] = maxValuesObj[currentDate]
                    + data[i].entries;
              } else {
                maxValuesObj[currentDate] = data[i].entries
              }
            })(i)
          }

          for ( var prop in maxValuesObj) {
            if (maxValuesObj.hasOwnProperty(prop)) {
              var value = maxValuesObj[prop];
              if (value > maxEntries) {
                maxEntries = value;
              }
            }
          }

          // Set random user colors
          for (i in data) {
            data[i].color = '#'
                + Math.floor(Math.random() * 16777215).toString(16);
            if (data[i].user == "") {
              data[i].user = "N/A";
            }
          }

          // Create array with unique users/color codes for legend
          var uniqueUsers = data.slice();
          uniqueUsers.sort(function(a, b) {
            var nameA = a.user.toLowerCase(), nameB = b.user.toLowerCase();
            if (nameA < nameB) { // sort string ascending
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0; // default return value (no sorting)
          });

          for ( var j = 0; j < uniqueUsers.length; j++) {
            if (uniqueUsers[j].user == "") {
              uniqueUsers[j].user = "N/A";
            }
            if (uniqueUsers[j] && uniqueUsers[j - 1]) {
              if (uniqueUsers[j].user == uniqueUsers[j - 1].user) {
                uniqueUsers[j - 1].user = "";
              }
            }
          }

          var uniqueUsersArray = [];
          for (k in uniqueUsers) {
            if (uniqueUsers[k].user != "") {
              uniqueUsersArray.push(uniqueUsers[k]);
            }
          }

          // Render chart

          var barWidth = 40;
          var width = (barWidth + 40) * data.length;

          // Set minimum width
          if (width < 200) {
            width = 200;
          }

          var height = 200;
          var padding = 40;

          var x = d3.scale.linear().domain([ 0, data.length ]).range(
              [ 0, width ]);
          var y = d3.scale.linear().domain([ 0, d3.max(data, function(datum) {
            return maxEntries;
          }) ]).rangeRound([ 0, height ]);

          // Create array of y axis tick intervals
          var yAxisTickIntervals = [];
          for ( var i = 0; i <= height; i++) {
            if (i == Math.round(i / 20) * 20) {
              yAxisTickIntervals.push(i);
            }
          }

          // Remove current contents of div
          d3.select("svg").remove();

          // Add the canvas to the DOM
          var mainArea = d3.select("#svg-graph").append("svg:svg").attr(
              "width", width + padding * 2).attr("height",
              (height * 2) + padding * 2);

          // Add group object to canvas, which will contain graph
          var barGraph = mainArea.append("svg:g").attr("transform",
              "translate(" + padding + "," + padding + ")");

          var indexOffset = 0;
          var duplicatesInARow = 0;

          // Draw bars, checking for identical dates; if dates are
          // identical, bars are stacked
          barGraph.selectAll("rect").data(data).enter().append("svg:rect")
              .attr("x", function(datum, index) {
                if (index > 0 && datum.date == data[index - 1].date) {
                  var xvalue = x((index - 1 - indexOffset)) + 20;
                  indexOffset++;
                  return xvalue;
                } else {
                  return x((index - indexOffset)) + 20;
                }
              }).attr(
                  "y",
                  function(datum, index) {
                    if (index > 0 && datum.date == data[index - 1].date) {
                      duplicatesInARow++;
                      var decreasedyvalue = 0;
                      for ( var i = 0; i < duplicatesInARow; i++) {
                        decreasedyvalue = decreasedyvalue
                            + y(data[index - i - 1].entries);
                      }
                      return height - y(datum.entries) - decreasedyvalue;
                    } else {
                      duplicatesInARow = 0;
                      return height - y(datum.entries);
                    }
                  }).attr("height", function(datum) {
                return y(datum.entries);
              }).attr("width", barWidth).attr("fill", function(datum) {
                return datum.color;
              });

          // Label x axis
          var xaxisindexOffset = 0;

          barGraph.selectAll("text.yAxis").data(data).enter()
              .append("svg:text").attr("x", function(datum, index) {
                if (index > 0 && datum.date == data[index - 1].date) {
                  var xvalue = x((index - 1 - xaxisindexOffset));
                  xaxisindexOffset++;

                  return xvalue + barWidth;
                } else {
                  return x((index - xaxisindexOffset)) + barWidth;
                }

              }).attr("y", height).attr("dx", -barWidth / 2).attr(
                  "text-anchor", "middle").attr("style",
                  "font-size: 12; font-family: Arial").text(
                  function(datum, index) {
                    if (index > 0 && datum.date == data[index - 1].date) {
                      return null;
                    } else {
                      return datum.date;
                    }

                  }).attr("class", "yAxis").attr("transform",
                  "translate(20, 20)");

          // Add y ticks
          barGraph.selectAll(".yTicks").data(yAxisTickIntervals).enter()
              .append("svg:line").attr("x1", -5).attr("y1", function(d) {
                return d;
              }).attr("x2", function(d) {
                if (d == height) {
                  return width + 5 - (barWidth * indexOffset * 2);
                } else {
                  return 5;
                }
              }).attr("y2", function(d) {
                return d;
              }).attr("stroke", function(d) {
                if (d == height) {
                  return "#000000";
                } else {
                  return "lightgray";
                }
              }).attr("class", "yTicks");

          // Add labels to y ticks
          barGraph.selectAll("text.yAxisLeft").data(yAxisTickIntervals).enter()
              .append("svg:text").text(function(d) {
                if (d == 0) {
                  return maxEntries;
                } else {
                  return Math.round((height - d) / height * maxEntries);
                }
              }).attr("x", -7).attr("y", function(d) {
                return d;
              }).attr("dy", "3").attr("class", "yAxisLeft").attr("text-anchor",
                  "end");

          barGraph.append("text").attr("class", "y label").attr("text-anchor",
              "end").attr("y", -40).attr("dy", ".75em").attr("transform",
              "rotate(-90)").text("Number of modifications");

          // Append color/user legend
          var legend = mainArea.append("svg:g").attr("transform",
              "translate(" + padding + "," + (padding + height) + ")");

          legend.selectAll("text").data(uniqueUsersArray).enter().append(
              "svg:text").attr("x", 50).attr("y", function(datum, index) {
            return (index * 40) + padding;
          }).attr("dx", -barWidth / 2).attr("style",
              "font-size: 12; font-family: Arial").text(function(datum) {
            return datum.user;
          }).attr("class", "yAxis").attr("text-anchor", "start");

          legend.selectAll("rect").data(uniqueUsersArray).enter().append(
              "svg:rect").attr("x", 0).attr("y", function(datum, index) {
            return (index * 40) + padding - 15;
          }).attr("height", 20).attr("width", 20).attr("fill", function(datum) {
            return datum.color;
          });

        };

        // FOCUS CONTEXT GRAPH

        $scope.makeFocusContextGraph = function() {

          // Remove current contents of div
          d3.select("svg").remove();

          var margin = {
            top : 10,
            right : 10,
            bottom : 100,
            left : 40
          }, margin2 = {
            top : 430,
            right : 10,
            bottom : 20,
            left : 40
          }, width = 960 - margin.left - margin.right, height = 500
              - margin.top - margin.bottom, height2 = 500 - margin2.top
              - margin2.bottom;

          // var parseDate = d3.time.format("%b %Y").parse;

          var x = d3.time.scale().range([ 0, width ]), x2 = d3.time.scale()
              .range([ 0, width ]), y = d3.scale.linear().range([ height, 0 ]), y2 = d3.scale
              .linear().range([ height2, 0 ]);

          var xAxis = d3.svg.axis().scale(x).orient("bottom"), xAxis2 = d3.svg
              .axis().scale(x2).orient("bottom"), yAxis = d3.svg.axis()
              .scale(y).orient("left");

          var brush = d3.svg.brush().x(x2).on("brush", brushed);

          var area = d3.svg.area().interpolate("monotone").x(function(d) {
            return x(d.date);
          }).y0(height).y1(function(d) {
            return y(d.entries);
          });

          var area2 = d3.svg.area().interpolate("monotone").x(function(d) {
            return x2(d.date);
          }).y0(height2).y1(function(d) {
            return y2(d.entries);
          });

          var svg = d3.select("#svg-graph").append("svg").attr("width",
              width + margin.left + margin.right).attr("height",
              height + margin.top + margin.bottom).attr("class", "focus-context");

          svg.append("defs").append("clipPath").attr("id", "clip").append(
              "rect").attr("width", width).attr("height", height);

          var focus = svg.append("g").attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

          var context = svg.append("g").attr("transform",
              "translate(" + margin2.left + "," + margin2.top + ")");

          // Get unique dates and sum entries for each date
          var dataToReduce = {};
          for (i in $scope.data) {
            if (dataToReduce[$scope.data[i].date]) {
              dataToReduce[$scope.data[i].date] = dataToReduce[$scope.data[i].date]
                  + $scope.data[i].entries;
            } else {
              dataToReduce[$scope.data[i].date] = $scope.data[i].entries;
            }
          }

          var newData = [];
          for (key in dataToReduce) {
            var newDatum = {
              "date" : key,
              "entries" : dataToReduce[key]
            };
            newData.push(newDatum);
          }

          data = newData;

          data.forEach(function(d) {
            d.date = new Date(d.date);
            d.entries = +d.entries;
          });

          x.domain(d3.extent(data.map(function(d) {
            return d.date;
          })));
          y.domain([ 0, d3.max(data.map(function(d) {
            return d.entries;
          })) ]);
          x2.domain(x.domain());
          y2.domain(y.domain());

          focus.append("path").datum(data).attr("clip-path", "url(#clip)")
              .attr("d", area);

          focus.append("g").attr("class", "x axis").attr("transform",
              "translate(0," + height + ")").call(xAxis);

          focus.append("g").attr("class", "y axis").call(yAxis);

          context.append("path").datum(data).attr("d", area2);

          context.append("g").attr("class", "x axis").attr("transform",
              "translate(0," + height2 + ")").call(xAxis2);

          context.append("g").attr("class", "x brush").call(brush).selectAll(
              "rect").attr("y", -6).attr("height", height2 + 7);
          // });

          function brushed() {
            x.domain(brush.empty() ? x2.domain() : brush.extent());
            focus.select("path").attr("d", area);
            focus.select(".x.axis").call(xAxis);
          }
        };

        // BASIC LINE CHART
        $scope.makeLineChart = function() {

          // Remove current contents of div
          d3.select("svg").remove();

          var margin = {
            top : 20,
            right : 20,
            bottom : 30,
            left : 50
          }, width = 960 - margin.left - margin.right, height = 500
              - margin.top - margin.bottom;

          var x = d3.time.scale().range([ 0, width ]);

          var y = d3.scale.linear().range([ height, 0 ]);

          var xAxis = d3.svg.axis().scale(x).orient("bottom");

          var yAxis = d3.svg.axis().scale(y).orient("left");

          var line = d3.svg.line().x(function(d) {
            return x(d.date);
          }).y(function(d) {
            return y(d.entries);
          });

          var svg = d3.select("#svg-graph").append("svg").attr("width",
              width + margin.left + margin.right).attr("height",
              height + margin.top + margin.bottom).attr("class", "line-chart").append("g").attr(
              "transform", "translate(" + margin.left + "," + margin.top + ")");

          // d3.tsv("data.tsv", function(error, data) {

          // Get unique dates and sum entries for each date
          var dataToReduce = {};
          for (i in $scope.data) {
            if (dataToReduce[$scope.data[i].date]) {
              dataToReduce[$scope.data[i].date] = dataToReduce[$scope.data[i].date]
                  + $scope.data[i].entries;
            } else {
              dataToReduce[$scope.data[i].date] = $scope.data[i].entries;
            }
          }

          var newData = [];
          for (key in dataToReduce) {
            var newDatum = {
              "date" : key,
              "entries" : dataToReduce[key]
            };
            newData.push(newDatum);
          }

          data = newData;

          data.forEach(function(d) {
            d.date = new Date(d.date);
            d.entries = +d.entries;
          });

          x.domain(d3.extent(data, function(d) {
            return d.date;
          }));
          y.domain(d3.extent(data, function(d) {
            return d.entries;
          }));

          svg.append("g").attr("class", "x axis").attr("transform",
              "translate(0," + height + ")").call(xAxis);

          svg.append("g").attr("class", "y axis").call(yAxis).append("text")
              .attr("transform", "rotate(-90)").attr("y", 6)
              .attr("dy", ".71em").style("text-anchor", "end")
              .text("Entries");

          svg.append("path").datum(data).attr("class", "line").attr("d", line);
          // });

        };

        // Return fake data
        function getData() {
          // TODO GET REAL DATA, WRITE MAP-REDUCE FUNCTIONS
          Data.async($rootScope.DB).then(function(dataFromServer) {
            console.log("TODO get real data.");
          });

          return [ {
            "user" : "migmaqresearchpartnership",
            "date" : "2012-12-06",
            "entries" : 50
          }, {
            "user" : "elise",
            "date" : "2013-01-18",
            "entries" : 18
          }, {
            "user" : "",
            "date" : "2013-01-11",
            "entries" : 10
          }, {
            "user" : "elise",
            "date" : "2013-01-11",
            "entries" : 26
          }, {
            "user" : "janinemetallic",
            "date" : "2013-01-18",
            "entries" : 13
          }, {
            "user" : "migmaqresearchpartnership",
            "date" : "2013-01-18",
            "entries" : 8
          }, {
            "user" : "migmaqresearchpartnership",
            "date" : "2013-02-06",
            "entries" : 24
          }, {
            "user" : "migmaqresearchpartnership",
            "date" : "2013-02-07",
            "entries" : 27
          }, {
            "user" : "elise",
            "date" : "2013-02-07",
            "entries" : 6
          }, {
            "user" : "",
            "date" : "2013-02-09",
            "entries" : 29
          }, {
            "user" : "elise",
            "date" : "2013-02-10",
            "entries" : 31
          }, {
            "user" : "migmaqresearchpartnership",
            "date" : "2013-02-11",
            "entries" : 12
          } ];
        }
        ;

      };
      SandboxController.$inject = [ '$scope', '$rootScope', '$resource',
          'Data' ];
      return SandboxController;
    });