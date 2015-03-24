var rightBranchingBracketIt = function(pieces) {
  if (pieces.length < 2) {
    return pieces.join(" ");
  }

  // console.log(pieces);

  // This is it! Recursion!!
  var piece1 = pieces.pop();
  var piece2 = pieces.pop();
  pieces.push("[" + piece2 + " " + piece1 + "]");
  return rightBranchingBracketIt(pieces);

};

var leftBranchingBracketIt = function(pieces) {
  if (pieces.length < 2) {
    return pieces.join(" ");
  }

  // console.log(pieces);

  // This is it! Recursion!!
  var piece1 = pieces.shift();
  var piece2 = pieces.shift();
  pieces.unshift("[" + piece1 + " " + piece2 + "]");
  return leftBranchingBracketIt(pieces);
};

var mixedBranchingBracketIt = function(pieces) {

  window.count++;
  if (pieces.length < 2) {
    return pieces.join(" ");

  }

  // console.log(pieces);

  // This is it! Recursion!!

  var piece1, piece2;

  if (window.count % 2 === 1) {
    piece1 = pieces.shift();
    piece2 = pieces.shift();
    pieces.unshift("[" + piece1 + " " + piece2 + "]");
  } else {
    piece1 = pieces.pop();
    piece2 = pieces.pop();
    pieces.push("[" + piece2 + " " + piece1 + "]");
  }

  return mixedBranchingBracketIt(pieces);

};

var bracketIt = function(morphemesLine) {

  var trees = {};
  trees.left = leftBranchingBracketIt(morphemesLine.split(" ")).replace(/\[/g, " [ ").replace(/\]/g, " ] ");
  trees.right = rightBranchingBracketIt(morphemesLine.split(" ")).replace(/\[/g, " [ ").replace(/\]/g, " ] ");
  trees.mixed = mixedBranchingBracketIt(morphemesLine.split(" ")).replace(/\[/g, " [ ").replace(/\]/g, " ] ");
  return trees;
};


var Tree = {
  "mixedBranching": mixedBranchingBracketIt,
  "rightBranching": rightBranchingBracketIt,
  "leftBranching": leftBranchingBracketIt,
  "generate": bracketIt

};
