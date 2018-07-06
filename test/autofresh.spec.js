'use strict';


/* dependencies */
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const faker = require('faker');
const expect = require('chai').expect;


/* test model */
const PersonSchema = new Schema({
  name: {
    type: String
  },
  father: {
    type: ObjectId,
    ref: 'Person',
    autorefresh: true
  },
  mother: {
    type: ObjectId,
    ref: 'Person',
    autorefresh: true
  },
  relatives: {
    type: [ObjectId],
    ref: 'Person',
    default: undefined,
    autorefresh: true
  }
});
PersonSchema.plugin(require(path.join(__dirname, '..')));
const Person = mongoose.model('Person', PersonSchema);


describe('mongoose-autorefresh', function () {

  let father = {
    name: faker.name.findName()
  };

  let mother = {
    name: faker.name.findName()
  };

  let relatives = [{
    name: faker.name.findName()
  }, {
    name: faker.name.findName()
  }];


  before(function (done) {
    Person.insertMany([father, mother], function (error, created) {
      father = created[0];
      mother = created[1];
      done(error, created);
    });
  });


  before(function (done) {
    Person.insertMany(relatives, function (error, created) {
      relatives = created;
      done(error, created);
    });
  });


  it('should add autorefresh schema method', function () {

    const person = new Person();

    expect(person.autorefresh).to.exist;
    expect(person.autorefresh).to.be.a('function');
    expect(person.autorefresh.name).to.be.eql('autorefresh');
    expect(person.autorefresh).to.have.length(1);

  });


  it('should be able to autorefresh instance', function (done) {

    const person = new Person({
      name: faker.name.findName(),
      father: father,
      mother: mother._id,
      relatives: _.map(relatives, '_id')
    });

    person.autorefresh(function (error, instance) {

      expect(error).to.not.exist;

      expect(instance.father).to.exist;
      expect(instance.father.name).to.exist;
      expect(instance.father.name).to.be.eql(father.name);

      expect(instance.mother.name).to.exist;
      expect(instance.mother.name).to.be.eql(mother.name);

      expect(instance.relatives[0].name).to.exist;
      expect(instance.relatives[0].name).to.be.eql(relatives[0].name);

      expect(instance.relatives[1].name).to.exist;
      expect(instance.relatives[1].name).to.be.eql(relatives[1].name);

      done(error, instance);

    });

  });


  it('should ensure fresh ref before validations', function (done) {

    const person = new Person({
      name: faker.name.findName(),
      father: father,
      mother: mother._id,
      relatives: _.map(relatives, '_id')
    });

    person.validate(function (error) {

      expect(error).to.not.exist;

      expect(person.father).to.exist;
      expect(person.father.name).to.exist;
      expect(person.father.name).to.be.eql(father.name);

      expect(person.mother.name).to.exist;
      expect(person.mother.name).to.be.eql(mother.name);

      expect(person.relatives[0].name).to.exist;
      expect(person.relatives[0].name).to.be.eql(relatives[0].name);

      expect(person.relatives[1].name).to.exist;
      expect(person.relatives[1].name).to.be.eql(relatives[1].name);

      done(error, person);

    });

  });

  it('should save after autorefresh', function (done) {

    const person = new Person({
      name: faker.name.findName(),
      father: father,
      mother: mother._id,
      relatives: _.map(relatives, '_id')
    });

    person.save(function (error, saved) {

      expect(error).to.not.exist;

      expect(saved.father).to.exist;
      expect(saved.father.name).to.exist;
      expect(saved.father.name).to.be.eql(father.name);

      expect(saved.mother.name).to.exist;
      expect(saved.mother.name).to.be.eql(mother.name);

      expect(saved.relatives[0].name).to.exist;
      expect(saved.relatives[0].name).to.be.eql(relatives[0].name);

      expect(saved.relatives[1].name).to.exist;
      expect(saved.relatives[1].name).to.be.eql(relatives[1].name);

      done(error, saved);

    });

  });


  after(function (done) {
    Person.remove(done);
  });


});