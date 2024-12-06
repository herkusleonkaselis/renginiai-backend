import express from "express";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(express.static("web"));

var server = app.listen(8000, "localhost");
