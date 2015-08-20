/*
 * created by 习木(yelin.yl@alibab-inc.com)
 */
var path = require('path');
var grunt = require('./node_modules/kui/PublicGruntfile.js');
module.exports=grunt({
    basename:path.basename(__dirname)
});