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
  var Transpiler = require("es6-module-transpiler")

  function transpile( formatter, modules, destination, options ) {
    var container, Formatter, formatterInstance;

    switch (formatter) {
      case 'amd':
        Formatter = require('es6-module-transpiler-amd-formatter');
        formatterInstance = new Formatter();
        break;
      default:
        throw new Error("unknown formatter type: " + formatter );
    }

    container = new Transpiler.Container({
      resolvers: options.resolvers,
      formatter: formatterInstance
    });

    grunt.log.ok( 'loading modules...' );
    modules.forEach(function(moduleName) {
      grunt.log.ok( ' - ' + moduleName );
      container.getModule(moduleName);
    });

    if (options.transitiveResolution) {
      grunt.log.ok( 'looking for transitively imported modules...');
      container.findImportedModules();
      container.getModules().forEach(function( module ) {
        if (!arrayContains( modules, module.relativePath )) {
          grunt.log.ok(' - ' + module.relativePath);
        }
      });
    }

    grunt.log.ok( 'transpiling modules to ' + destination );
    container.write( destination );

    // return list of compiled modules
    var result = {};
    container.getModules().forEach(function( module ) {
      result[module.name] = module.relativePath;
    });
    return result;
  }

  function arrayContains( array, value ) {
    return !array.every(function( arrayValue ) {
      return arrayValue != value;
    });
  }

  grunt.registerMultiTask("transpile", function(){

    var options = this.options({
      transitiveResolution: false,
      resolvers: [ new Transpiler.FileResolver( [ process.cwd() ] ) ],
      configureGrunt: false
    });

    var formatter = this.data.formatter; // string for known formatter type (e.g. 'amd')
    var modules = this.data.modules; // array of module names
    var destination = this.data.destination; // directory path

    try {
      var compiledModules = transpile( formatter, modules, destination, options );

      // merge the list of compiled modules back to the configuration
      var config = { transpile: {} };
      config.transpile[this.target] = {
        compiledModules: compiledModules
      }
      grunt.config.merge(config);
    } catch (e) {
      grunt.log.warn('Error compiling ' + this.target);
      grunt.fail.fatal( e );
    }
  });

};
