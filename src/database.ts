import { set, connect } from "mongoose";

const URI =
  `mongodb+srv://salao-na-mao:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

set("useNewUrlParser", true);
set("useFindAndModify", false);
set("useCreateIndex", true);
set("useUnifiedTopology", true);

connect(URI)
  .then(() => console.log("DB is Up!"))
  .catch((err) => console.log(err));
