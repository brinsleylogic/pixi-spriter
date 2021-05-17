import express from "express";
import http from "http";
import path from "path";

const loc = path.resolve(__dirname);

const app = express();
app.use(express.static(loc));

app.get("/", (_, res) => {
    res.sendFile(loc + "/index.html");
});

const server = http.createServer(app);

server.listen(3000, () => console.log("Listening on:", server.address()))