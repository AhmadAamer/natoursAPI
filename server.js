const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParserf: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    // console.log(con.connections);
    console.log("successfully connected🎉🎉");
  });

// const testTour = new Tours({
//   name: "the park camper",
//   price: 994,
// });
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log("Error:", err));
// console.log(app.get("env"));
// console.log(process.env.PASSWORD);
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
