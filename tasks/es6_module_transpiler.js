/*
 * grunt-es6-module-transpiler
 * https://github.com/joefiorini/grunt-es6-module-transpiler
 *
 * Copyright (c) 2013 Joe Fiorini
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var path = require('path');

  function transpile( formatter, searchPath, modules, destination ) {
    var Transpiler = require("es6-module-transpiler"),
        container, Formatter, formatterInstance;

    switch (formatter) {
      case 'amd':
        Formatter = require('es6-module-transpiler-amd-formatter');
        formatterInstance = new Formatter();
        break;
      default:
        throw new Error("unknown formatter type: " + formatter );
    }

    container = new Transpiler.Container({
      resolvers: [ new Transpiler.FileResolver( searchPath ) ],
      formatter: formatterInstance
    });

    grunt.log.ok( 'loading modules...' );
    modules.forEach(function(module) {
      grunt.log.ok( ' - ' + module );
      container.getModule(module);
    });

    grunt.log.ok( 'transpiling modules to ' + destination );
    container.write( destination );
  }

  grunt.registerMultiTask("transpile", function(){

    var formatter = this.data.formatter; // string for known formatter type (e.g. 'amd')
    var modules = this.data.modules; // array of module names
    var searchPath = this.data.searchPath; // array of directory paths
    var destination = this.data.destination; // directory path

    try {
      transpile( formatter, searchPath, modules, destination );
    } catch (e) {
      grunt.log.warn('Error compiling ' + this.target);
      grunt.fail.fatal( e );
    }

  });

};
