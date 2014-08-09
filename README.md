# Swagger CLI Client

Generates a command-line interface for any 
[Swagger Specification](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md) so you can do things like:

![Example usage](https://i.imgur.com/IVhxFlE.png)

## Usage
This intended to be embedded within a wrapper application which can provide it the schema object (which is generated using [fetch-swagger-schema](https://github.com/signalfuse/fetch-swagger-schema)). For example, here's the petstore-cli file:

```javascript
#!/usr/bin/env node

var swaggerCli = require('../'),
  schema = require('./petstore-schema.json');

swaggerCli(schema);
```

To create a cli app for your schema, just require your schema instead of the petstore schema.

## Auth lookup strategy
By default the cli will first use the `--auth` param (if defined), then it'll use the `<appname>_AUTH` (e.g., PETSTORECLI_AUTH) env variable (if defined), and finally a yaml/json file called `.<app-name>` (e.g. ~/.petstore-cli which may contain `{ "auth" : "my-token" }`.