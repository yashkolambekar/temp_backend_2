const express = require("express");
const jsonfile = require("jsonfile");
var morgan = require("morgan");
const app = express();
const db = require("./db.json");
const file = "db.json";
const cors = require("cors")

app.use(cors())


app.use(express.static("dist"))

app.use(express.json());

app.use(morgan("tiny"));

app.get("/persons", (req, res) => {
  res.json(db.persons);
});

app.post("/persons", async (req, res) => {
  try {
    const newObject = await updateRecord(req.body.name, req.body.number);
    res.json(newObject);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.delete("/persons/:id", async (req, res) => {
  try {
    const deleteObject = await deleteRecord(req.params.id);
    res.json(deleteObject);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put("/persons/:id", async (req, res) => {
  try {
    const updatedObject = await updateRecord(
      req.body.name,
      req.body.number,
      req.params.id
    );
    res.json(updatedObject);
  } catch (err) {
    res.status(500).send(err);
  }
});

const updateRecord = (name, number, id = 0) => {
  try {
    let data = jsonfile.readFileSync(file);
    const newObject = {
      name: name,
      number: number,
      id: parseInt(id),
    };
    let newData = [];
    if (id != 0) {
      newData = data["persons"].filter((obj) => obj.id != id);
    } else {
      newData = data["persons"];
      const newId =
        Math.max.apply(
          null,
          data["persons"].map((obj) => obj.id)
        ) + 1;
      newObject.id = newId;
    }
    data["persons"] = newData.concat(newObject);
    jsonfile.writeFileSync(file, data);
    db["persons"] = newData.concat(newObject);
    console.log("written successfully!");
    return newObject;
  } catch (err) {
    console.error(err);
  }
};

const deleteRecord = (id) => {
  return new Promise((resolve, reject) => {
    jsonfile.readFile(file, function (err, data) {
      if (err) reject(err);
      const delObject = data["persons"].find((obj) => obj.id == id);
      let newData = data["persons"].filter((obj) => obj.id != id);
      data["persons"] = newData;
      jsonfile.writeFile(file, data, function (err) {
        if (err) reject(err);
        if (!err) {
          db["persons"] = newData;
          console.log("written successfully!");
          resolve(delObject);
        }
      });
    });
  });
};

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("App is listening at port " + PORT);
});
