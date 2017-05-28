/**
 * D3 code courtesey of Jason Davies http://www.jasondavies.com/wordcloud/
 */

angular.module('LingSyncWebsite')
  .directive('wordCloud', function() {
    return {
      link: function(scope, element, attr) {

        var fill = d3.scale.category20();
        var w = 660,
            h = 500;

        var words = [],
          max,
          scale = 1,
          complete = 0,
          keyword = '',
          tags,
          fontSize,
          maxLength = 30,
          fetcher = "Speakers, linguists, and learners can contribute remotely to one centralized database, distributing the responsibility of documentation. The database is shared between researchers and the community. Everyone with permission has access to the data, ensuring that language information is not just on the computers of a few people. While it is easy to share data, the database is secure and encrypted. Permission settings control who can see what. LingSync is customizable. You decide what is important and how much detail goes into your database. Data is easy to tag, search, and sort by factors you can create (i.e., speaker, date, morpheme or construction type). It is very easy to import and export data in a variety of formats. Learners can participate in recording and transcribing their language. Users can easily search the database for specific words or phrases, and discover patterns on their own. Material can be easily converted from LingSync to language lessons on a complementary language learning app (still under development). LingSync is a Chrome app, which means it works on Windows, Mac, Linux, Android, iPad, and also offline. LingSync is free and open source. You maintain control of your data. LingSync learns from your data to streamline morpheme glossing. LingSync automatically backs up your database. Previous versions are accessible, making it easy to undo any mistakes. A Free Tool for Creating and Maintaining a Shared Database For Communities, Linguists and Language Learners An App for Field Linguistics We designed LingSync from the ground up to be user-friendly, but also to conform to EMELD and DataOne best practices on formatting, archiving, open access, and security. LingSync uses Unicode and XML, which are open standards, and follows Leipzig glossing conventions For more information, see the data management sections of our white paper. We vow never to use your private data -- you can find out more in our privacy policy. LingSync uses machine learning and computational linguistics to adapt to your existing organization of the data you import, and predict how to gloss it. Add custom fields for extra transcription styles, additional languages of translation, semantic representations, audio timestamps, etc. LingSync already supports import and export of many common formats, including ELAN, Praat, Toolbox, FLEx, Filemaker Pro, LaTeX, xml, csv and more, but if you have another format you'd like to import or export, Contact Us. All our code is available on our Github. We use CouchDB and Javascript. Power users can write and share scripts to clean up, visualize, or mass-edit lots of data. Mi’gmaq Language Revitalization Partnership has been implementing LingSync to store and share their data since fall 2012. A field linguistics course at the University of Ottawa has been using LingSync to store and share their data.",
          statusText = '';

        var layout = d3.layout.cloud()
          .timeInterval(10)
          .size([w, h])
          .fontSize(function(d) { return fontSize(+d.value); })
          .text(function(d) { return d.key; })
          .on('word', progress)
          .on('end', draw);

        var svg = d3.select(element[0]).append('svg')
          .attr('width', w)
          .attr('height', h);

        var background = svg.append('g'),
          vis = svg.append('g')
            .attr('transform', 'translate(' + [w >> 1, h >> 1] + ')');

        d3.select(window).on('hashchange', hashchange);
        d3.select(window).on('load', hashchange);

        // From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
        var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
          punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
          wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
          discard = /^(@|https?:)/,
          htmlTags = /(<[^>]*?>|<script.*?<\/script>|<style.*?<\/style>|<head.*?><\/head>)/g,
          matchTwitter = /^https?:\/\/([^\.]*\.)?twitter\.com/;

        function parseHTML(d) {
          parseText(d.replace(htmlTags, ' ').replace(/&#(x?)([\dA-Fa-f]{1,4});/g, function(d, hex, m) {
            return String.fromCharCode(+((hex ? '0x' : '') + m));
          }).replace(/&\w+;/g, ' '));
        }

        function flatten(o, k) {
          if (typeof o === 'string') return o;
          var text = [];
          for (k in o) {
            var v = flatten(o[k], k);
            if (v) text.push(v);
          }
          return text.join(' ');
        }

        function parseText(text) {
          tags = {};
          var cases = {};
          text.split(wordSeparators).forEach(function(word) {
            if (discard.test(word)) return;
            word = word.replace(punctuation, '');
            if (stopWords.test(word.toLowerCase())) return;
            word = word.substr(0, maxLength);
            cases[word.toLowerCase()] = word;
            tags[word = word.toLowerCase()] = (tags[word] || 0) + 1;
          });
          tags = d3.entries(tags).sort(function(a, b) {
            return b.value - a.value;
          });
          tags.forEach(function(d) {
            d.key = cases[d.key];
          });
          generate();
        }

        function generate() {
          layout
            .font('Impact')
            .spiral('archimedean');
          fontSize = d3.scale.linear().range([10, 60]);
          if (tags.length) fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
          complete = 0;
          words = [];
          layout.stop().words(tags.slice(0, max = Math.min(tags.length, +150))).start();
        }

        function progress(d) {}

        function draw(data, bounds) {
          scale = bounds ? Math.min(
            w / Math.abs(bounds[1].x - w / 2),
            w / Math.abs(bounds[0].x - w / 2),
            h / Math.abs(bounds[1].y - h / 2),
            h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
          words = data;
          var text = vis.selectAll('text')
            .data(words, function(d) {
              return d.text.toLowerCase();
            });
          text.transition()
            .duration(1000)
            .attr('transform', function(d) {
              return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
            })
            .style('font-size', function(d) {
              return d.size + 'px';
            });
          text.enter().append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', function(d) {
              return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
            })
            .style('font-size', function(d) {
              return d.size + 'px';
            })
            .on('click', function(d) {
              $('#gsc-i-id1').val(d.text);
              $('input.gsc-search-button').click();
            })
            .style('opacity', 1e-6)
            .transition()
            .duration(1000)
            .style('opacity', 1);
          text.style('font-family', function(d) {
            return d.font;
          })
            .style('fill', function(d) {
              return fill(d.text.toLowerCase());
            })
            .text(function(d) {
              return d.text;
            });
          var exitGroup = background.append('g')
            .attr('transform', vis.attr('transform'));
          var exitGroupNode = exitGroup.node();
          text.exit().each(function() {
            exitGroupNode.appendChild(this);
          });
          exitGroup.transition()
            .duration(1000)
            .style('opacity', 1e-6)
            .remove();
          vis.transition()
            .delay(1000)
            .duration(750)
            .attr('transform', 'translate(' + [w >> 1, h >> 1] + ')scale(' + scale + ')');
        }

        function hashchange() {
          load(fetcher);
        }

        function load(f) {
          parseText(fetcher);
        }

          var r = 40.5,
             px = 35,
             py = 20;

          var angles = d3.select('#angles').append('svg')
            .attr('width', 2 * (r + px))
            .attr('height', r + 1.5 * py)
            .append('g')
            .attr('transform', 'translate(' + [r + px, r + py] + ')');

          angles.append('path')
            .style('fill', 'none')
            .attr('d', ['M', -r, 0, 'A', r, r, 0, 0, 1, r, 0].join(' '));

          angles.append('line')
            .attr('x1', -r - 7)
            .attr('x2', r + 7);

          angles.append('line')
            .attr('y2', -r - 7);

          angles.selectAll('text')
            .data([-90, 0, 90])
            .enter().append('text')
            .attr('dy', function(d, i) {
              return i === 1 ? null : '.3em';
            })
            .attr('text-anchor', function(d, i) {
              return ['end', 'middle', 'start'][i];
            })
            .attr('transform', function(d) {
              d += 90;
              return 'rotate(' + d + ')translate(' + -(r + 10) + ')rotate(' + -d + ')translate(2)';
            })
            .text(function(d) {
              return d + '°';
            });

          var radians = Math.PI / 180,
            from,
            to,
            count,
            scale = d3.scale.linear(),
            arc = d3.svg.arc()
              .innerRadius(0)
              .outerRadius(r);

          d3.selectAll('#angle-count, #angle-from, #angle-to')
            .on('change', getAngles)
            .on('mouseup', getAngles);

          getAngles();

          function getAngles() {
            count = +2;
            from = Math.max(-90, Math.min(90, +0));
            to = Math.max(-90, Math.min(90, +90));
            update();
          }

          function update() {
            scale.domain([0, count - 1]).range([from, to]);
            var step = (to - from) / count;

            var path = angles.selectAll('path.angle')
              .data([{
                startAngle: from * radians,
                endAngle: to * radians
              }]);
            path.enter().insert('path', 'circle')
              .attr('class', 'angle')
              .style('fill', '#fc0');
            path.attr('d', arc);

            var line = angles.selectAll('line.angle')
              .data(d3.range(count).map(scale));
            line.enter().append('line')
              .attr('class', 'angle');
            line.exit().remove();
            line.attr('transform', function(d) {
              return 'rotate(' + (90 + d) + ')';
            })
              .attr('x2', function(d, i) {
                return !i || i === count - 1 ? -r - 5 : -r;
              });

            var drag = angles.selectAll('path.drag')
              .data([from, to]);
            drag.enter().append('path')
              .attr('class', 'drag')
              .attr('d', 'M-9.5,0L-3,3.5L-3,-3.5Z')
              .call(d3.behavior.drag()
                .on('drag', function(d, i) {
                  d = (i ? to : from) + 90;
                  var start = [-r * Math.cos(d * radians), -r * Math.sin(d * radians)],
                    m = [d3.event.x, d3.event.y],
                    delta = ~~ (Math.atan2(cross(start, m), dot(start, m)) / radians);
                  d = Math.max(-90, Math.min(90, d + delta - 90)); // remove this for 360°
                  delta = to - from;
                  if (i) {
                    to = d;
                    if (delta > 360) from += delta - 360;
                    else if (delta < 0) from = to;
                  } else {
                    from = d;
                    if (delta > 360) to += 360 - delta;
                    else if (delta < 0) to = from;
                  }
                  update();
                })
                .on('dragend', generate));
            drag.attr('transform', function(d) {
              return 'rotate(' + (d + 90) + ')translate(-' + r + ')';
            });
            layout.rotate(function() {
              try{
                return scale(~~(Math.random() * count));
              }catch(e){
                console.log(e, scale);
                // return scale(~~(Math.random() * count));
              }
            });
          }

          function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }
          function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

          // hashchange();
      }
    };
  });
