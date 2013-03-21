console.log("Loading the SandboxController.");

'use strict';
define(
		[ "angular" ],
		function(angular) {
			var SandboxController = function($scope, $rootScope, $resource,
					LingSyncData) {

				// d3 Graph function
				$scope.makeGraph = function(graphQuantity) {
					function getData() {
						return [ {
							"user" : "migmaqresearchpartnership",
							"date" : "2012-12-06",
							"entries" : 23
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
							"date" : "2013-02-08",
							"entries" : 28
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
							"entries" : 50
						} ];
					}
					;

					var data = getData();

					// Sort data by date ascending
					data.sort(function(a, b) {
						var dateA = new Date(a.date), dateB = new Date(b.date);
						return dateA - dateB;
					});

					if (data.length > graphQuantity) {
						data = data.slice(-graphQuantity);
					}

					console.log(JSON.stringify(data));

					// Find the size of the largest column
					var maxEntries = data[0].entries;
					var cumulativeDateEntries = data[0].entries;
					var currentMaxValue = 0;
					for ( var i = 0; i < data.length; i++) {
						(function(index) {
							if (data[i - 1] && data[i].date == data[i - 1].date) {
								if (cumulativeDateEntries == 0) {
									cumulativeDateEntries = data[i - 1].entries;
								}
								cumulativeDateEntries = cumulativeDateEntries
										+ data[i].entries;
							} else if (data[i].entries < cumulativeDateEntries
									&& cumulativeDateEntries > currentMaxValue) {
								currentMaxValue = cumulativeDateEntries;
								cumulativeDateEntries = 0;
							} else if (data[i].entries > currentMaxValue) {
								cumulativeDateEntries = 0;
								currentMaxValue = data[i].entries;
								maxEntries = data[i].entries;
							}
						})(i);
					}
					maxEntries = currentMaxValue;

					// Set colors TODO Randomize this
					for (i in data) {
						if (data[i].user == "migmaqresearchpartnership") {
							data[i].color = "#CC0000";
						} else if (data[i].user == "elise") {
							data[i].color = "#66FF66";
						} else if (data[i].user == "janinemetallic") {
							data[i].color = "#FFFF00";
						} else {
							data[i].color = "#999999";
						}
						if (data[i].user == "") {
							data[i].user = "N/A";
						}
					}

					// Create array with unique users/color codes for legend
					var uniqueUsers = data.slice();
					uniqueUsers.sort(function(a, b) {
						var nameA = a.user.toLowerCase(), nameB = b.user
								.toLowerCase();
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
					var y = d3.scale.linear().domain(
							[ 0, d3.max(data, function(datum) {
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
					var mainArea = d3.select("#bar-graph").append("svg:svg")
							.attr("width", width + padding * 2).attr("height",
									(height * 2) + padding * 2);

					//Add group object to canvas, which will contain graph
					var barGraph = mainArea.append("svg:g").attr("transform",
							"translate(" + padding + "," + padding + ")");

					var indexOffset = 0;
					var duplicatesInARow = 0;

					//Draw bars, checking for identical dates; if dates are identical, bars are stacked
					barGraph
							.selectAll("rect")
							.data(data)
							.enter()
							.append("svg:rect")
							.attr(
									"x",
									function(datum, index) {
										if (index > 0
												&& datum.date == data[index - 1].date) {
											var xvalue = x((index - 1 - indexOffset)) + 20;
											indexOffset++;
											return xvalue;
										} else {
											return x((index - indexOffset)) + 20;
										}
									})
							.attr(
									"y",
									function(datum, index) {
										if (index > 0
												&& datum.date == data[index - 1].date) {
											duplicatesInARow++;
											var decreasedyvalue = 0;
											for ( var i = 0; i < duplicatesInARow; i++) {
												decreasedyvalue = decreasedyvalue
														+ y(data[index - i - 1].entries);
											}
											return height - y(datum.entries)
													- decreasedyvalue;
										} else {
											duplicatesInARow = 0;
											return height - y(datum.entries);
										}
									}).attr("height", function(datum) {
								return y(datum.entries);
							}).attr("width", barWidth).attr("fill",
									function(datum) {
										return datum.color;
									});
					
					// Label x axis
					var xaxisindexOffset = 0;
					
					barGraph.selectAll("text.yAxis").data(data).enter().append(
							"svg:text").attr("x", function(datum, index) {
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
								if (index > 0
										&& datum.date == data[index - 1].date) {
									return null;
								} else {
									return datum.date;
								}

							}).attr("class", "yAxis").attr("transform",
							"translate(20, 20)");

					// Add y ticks
					barGraph
							.selectAll(".yTicks")
							.data(yAxisTickIntervals)
							.enter()
							.append("svg:line")
							.attr("x1", -5)
							.attr("y1", function(d) {
								return d;
							})
							.attr(
									"x2",
									function(d) {
										if (d == height) {
											return width
													+ 5
													- (barWidth * indexOffset * 2);
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
					barGraph.selectAll("text.yAxisLeft").data(
							yAxisTickIntervals).enter().append("svg:text")
							.text(
									function(d) {
										if (d == 0) {
											return maxEntries;
										} else {
											return Math.round((height - d)
													/ height * maxEntries);
										}
									}).attr("x", -7).attr("y", function(d) {
								return d;
							}).attr("dy", "3").attr("class", "yAxisLeft").attr(
									"text-anchor", "end");

					barGraph.append("text").attr("class", "y label").attr(
							"text-anchor", "end").attr("y", -40).attr("dy",
							".75em").attr("transform", "rotate(-90)").text(
							"Number of modifications");

					// Append color/user legend
					var legend = mainArea.append("svg:g").attr(
							"transform",
							"translate(" + padding + "," + (padding + height)
									+ ")");

					legend.selectAll("text").data(uniqueUsersArray).enter()
							.append("svg:text").attr("x", 50).attr("y",
									function(datum, index) {
										return (index * 40) + padding;
									}).attr("dx", -barWidth / 2).attr("style",
									"font-size: 12; font-family: Arial").text(
									function(datum) {
										return datum.user;
									}).attr("class", "yAxis").attr(
									"text-anchor", "start");

					legend.selectAll("rect").data(uniqueUsersArray).enter()
							.append("svg:rect").attr("x", 0).attr("y",
									function(datum, index) {
										return (index * 40) + padding - 15;
									}).attr("height", 20).attr("width", 20)
							.attr("fill", function(datum) {
								return datum.color;
							});

				};

			};
			SandboxController.$inject = [ '$scope', '$rootScope', '$resource',
					'LingSyncData' ];
			return SandboxController;
		});