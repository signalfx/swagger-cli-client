#!/usr/bin/env node

var swaggerCli = require('../'),
  schema = require('./schema.json');

swaggerCli(schema);