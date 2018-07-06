'use strict';


/**
 * @name autorefresh
 * @description mongoose plugin to ensure fresh refs
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 *
 * const PersonSchema = new Schema({
 *   
 *   parent: {
 *     type: ObjectId,
 *     ref: 'Person',
 *     autorefresh: true
 *   }
 *   
 * });
 * 
 */


/* dependencies */
const _ = require('lodash');


module.exports = exports = function autofreshPlugin(schema /*, options*/ ) {


  /* collect refs for autorefresh */
  const refs = {};


  /**
   * @name autorefresh
   * @description iterate though each schema path, check for ObjectId(ref) 
   * schema fields and apply fresh plugin to a schema type(s) with 
   * `autorefresh:true` options
   *              
   * @param {String} schemaPath schema path
   * @param {SchemaType} schemaType valid mongoose schema type
   * @private
   */
  function autorefreshPaths(schemaPath, schemaType) {

    //ensure schema type has options
    const hasOptions = _.has(schemaType, 'options');

    //ensure schema type is objectid `ref`
    const hasRef = _.has(schemaType, 'options.ref');

    //check for autorefresh schema options
    const autorefreshable = _.has(schemaType, 'options.autorefresh');

    //check if is allowed autorefresh schema type
    const refreshable = hasOptions && hasRef && autorefreshable;

    //handle `autorefresh:true` schema options
    if (refreshable) {

      //obtain schema type ref & autorefresh options
      const { ref, autorefresh } = schemaType.options;

      //add model exists async validation
      refs[schemaPath] =
        ({ path: schemaPath, ref: ref, autorefresh: autorefresh });

    }

  }


  //collect refreshable paths
  schema.eachPath(autorefreshPaths);


  /**
   * @name autorefresh
   * @function autorefresh
   * @description refresh reference path
   * @param {Function} done callback invoke on success or failure
   * @instance
   */
  schema.methods.autorefresh = function autorefresh(done) {

    let $refs = [];

    //prepare population options
    _.forEach(_.merge({}, refs), function (ref) {
      if (_.isPlainObject(ref.fresh)) {
        ref = _.merge({}, ref, ref.fresh);
      }
      delete ref.fresh;
      $refs = [].concat($refs).concat(ref);
    });

    //populate refs
    this.populate($refs, done); //TODO improve query(reduce number of queries)

  };


  /* add pre validate hook to ensure fresh refs */
  schema.pre('validate', function (next) {
    this.autorefresh(next);
  });


};