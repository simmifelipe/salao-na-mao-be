const mongoose = require("mongoose");

const URI = `mongodb+srv://salao-na-mao:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const env = process.env.NODE_ENV || "dev";
let options = {};

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose
  .connect(URI, options)
  .then(() => console.log("DB is Up!"))
  .catch((err) => console.log(err));
