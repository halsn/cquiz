'use strict';

var url = require('url');

if (typeof process.env.MONGODB_PORT === 'string') {
  var mongoConnection = url.parse(process.env.MONGODB_PORT);
  process.env.ME_CONFIG_MONGODB_SERVER = mongoConnection.hostname;
  process.env.ME_CONFIG_MONGODB_PORT = mongoConnection.port;
}

var authList = [];
var mongo = {};
if (process.env.MONGODB_CONNECTION) {
  authList.push({
    database: process.env.MONGODB_INSTANCE_NAME,
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD
  });
  mongo.host = process.env.MONGODB_PORT_27017_TCP_ADDR;
  mongo.port = process.env.MONGODB_PORT_27017_TCP_PORT;
} else if (!process.env.VCAP_SERVICES) {
  authList.push({
    database: 'cquiz',
    username: '',
    password: ''
  });
} else {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  mongo = env['mongodb'][0]['credentials'];
  authList.push({
    database: mongo.name,
    username: mongo.username,
    password: mongo.password
  });
}

module.exports = {
  mongodb: {
    server: mongo.host || '0.0.0.0',
    port: mongo.port || 27017,

    //autoReconnect: automatically reconnect if connection is lost
    autoReconnect: true,

    //poolSize: size of connection pool (number of connections to use)
    poolSize: 4,

    //set admin to true if you want to turn on admin features
    //if admin is true, the auth list below will be ignored
    //if admin is true, you will need to enter an admin username/password below (if it is needed)
    admin: false,

    // >>>>  If you are using regular accounts, fill out auth details in the section below
    // >>>>  If you have admin auth, leave this section empty and skip to the next section
    auth: authList,

    //  >>>>  If you are using an admin mongodb account, or no admin account exists, fill out section below
    //  >>>>  Using an admin account allows you to view and edit all databases, and view stats

    //leave username and password empty if no admin account exists
    adminUsername: process.env.ME_CONFIG_MONGODB_ADMINUSERNAME || '',
    adminPassword: process.env.ME_CONFIG_MONGODB_ADMINPASSWORD || '',

    //whitelist: hide all databases except the ones in this list  (empty list for no whitelist)
    whitelist: [],

    //blacklist: hide databases listed in the blacklist (empty list for no blacklist)
    blacklist: []
  },

  site: {
    // baseUrl: the URL that mongo express will be located at - Remember to add the forward slash at the stard and end!
    baseUrl: '/',
    host: '0.0.0.0',
    port: 8081,
    cookieSecret: process.env.ME_CONFIG_SITE_COOKIESECRET || 'cookiesecret',
    sessionSecret: process.env.ME_CONFIG_SITE_SESSIONSECRET || 'sessionsecret',
    cookieKeyName: 'mongo-express',
    requestSizeLimit: process.env.ME_CONFIG_REQUEST_SIZE || '100kb',
    sslEnabled: process.env.ME_CONFIG_SITE_SSL_ENABLED || false,
    sslCert: process.env.ME_CONFIG_SITE_SSL_CRT_PATH || '',
    sslKey: process.env.ME_CONFIG_SITE_SSL_KEY_PATH || ''
  },

  //set useBasicAuth to true if you want to authehticate mongo-express loggins
  //if admin is false, the basicAuthInfo list below will be ignored
  //this will be true unless ME_CONFIG_BASICAUTH_USERNAME is set and is the empty string
  useBasicAuth: process.env.ME_CONFIG_BASICAUTH_USERNAME !== '',

  basicAuth: {
    username: process.env.ME_CONFIG_BASICAUTH_USERNAME || 'mongoadmin',
    password: process.env.ME_CONFIG_BASICAUTH_PASSWORD || 'mongo'
  },

  options: {
    //documentsPerPage: how many documents you want to see at once in collection view
    documentsPerPage: 10,

    //editorTheme: Name of the theme you want to use for displaying documents
    //See http://codemirror.net/demo/theme.html for all examples
    editorTheme: process.env.ME_CONFIG_OPTIONS_EDITORTHEME || 'rubyblue',

    //The options below aren't being used yet

    //cmdType: the type of command line you want mongo express to run
    //values: eval, subprocess
    //  eval - uses db.eval. commands block, so only use this if you have to
    //  subprocess - spawns a mongo command line as a subprocess and pipes output to mongo express
    cmdType: 'eval',

    //subprocessTimeout: number of seconds of non-interaction before a subprocess is shut down
    subprocessTimeout: 300,

    //readOnly: if readOnly is true, components of writing are not visible.
    readOnly: false
  },

  // Specify the default keyname that should be picked from a document to display in collections list.
  // Keynames can be specified for every database and collection.
  // If no keyname is specified, it defaults to '_id', which is a mandatory field.
  // For Example :
  // defaultKeyNames{
  //   "world_db":{  //Database Name
  //     "continent":"cont_name", // collection:field
  //     "country":"country_name",
  //     "city":"name"
  //   }
  // }
  defaultKeyNames: {

  }
};
