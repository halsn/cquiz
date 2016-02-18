var mongoose = require('mongoose');
if (process.env.NODE_ENV === 'development') {
  mongoose.connect('mongodb://localhost:27017/cquiz');
} else {
  //mongoose.connect('mongodb://73847614-46f3-4261-8551-eb686625b3e2:OLAYYtoN0gFSmCPz9ZkLsw@10.9.58.169:27017/cf23d9d4-8a49-479f-a88b-e1a269143c0c');
  mongoose.connect('mongodb://31ab9491-1055-4f19-91de-251d12b1096a:25bb3a43-8b1c-436e-93eb-93d3118051a4@192.155.243.15:10146/db');
}

module.exports.model = function (name, schema) {
  return mongoose.model(name, schema);
};
module.exports.Schema = mongoose.Schema;
