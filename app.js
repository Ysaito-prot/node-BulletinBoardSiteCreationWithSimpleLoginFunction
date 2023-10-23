const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const port = 3000;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");

const mysql = require("mysql2");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rootroot",
  database: "thread_db",
  multipleStatements: true,
});

// cssファイルの取得
app.use(express.static("assets"));

// mysqlからデータを持ってくる
app.get("/", (req, res) => {
  // 初期データ
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin;";
  const createdThreads = "SELECT * from createdThreads;";

  con.query(threads + users + rog + createdThreads, function (err, result, fields) {
    if (err) throw err;
    res.render("index", {
      threads: result[0],
      users: result[1],
      rog: result[2],
      createdThreads: result[3],
    });
  });
});

// 新規ユーザー登録
app.post("/", (req, res) => {
  const sql = "INSERT INTO userInfo SET ?";

  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/registerUserResult");
  });
});

// ログイン情報登録
app.post("/rogin", (req, res) => {
  const sql = "INSERT INTO rogin SET ?";

  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    // トップページへ遷移
    res.redirect("/");
  });
});

// コメント登録
app.post("/comment", (req, res) => {
  const sql = "INSERT INTO threadinfo SET ?";

  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/");
  });
});

// 新規スレッド登録
app.post("/createThread", (req, res) => {
  const sql = "INSERT INTO createdthreads SET ?";

  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/");
  });
});

// お気に入り登録
app.post("/addFavo", (req, res) => {
  const sql = "INSERT INTO favo SET ?";

  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/favoriteList");
  });
});

app.get("/createNewThread", (req, res) => {
  res.sendFile(path.join(__dirname, "html/createThreadForm.html"));
});

app.get("/roginForm", (req, res) => {
  const userInfo = "SELECT * from userInfo;";
  const createdThreads = "SELECT * from createdThreads;";

  con.query(userInfo + createdThreads, function (err, result, fields) {
    if (err) throw err;
    res.render("roginForm", {
      userInfo: result[0],
      createdThreads: result[1],
    });
  });
});

app.get("/rogoutPage", (req, res) => {
  const userInfo = "SELECT * from userInfo;";
  const createdThreads = "SELECT * from createdThreads;";

  con.query(userInfo + createdThreads, function (err, result, fields) {
    if (err) throw err;
    res.render("rogoutPage", {
      userInfo: result[0],
      createdThreads: result[1],
    });
  });
});

app.get("/registerUserForm", (req, res) => {
  const userInfo = "SELECT * from userInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin;";
  const createdThreads = "SELECT * from createdThreads;";

  con.query(userInfo + users + rog + createdThreads, function (err, result, fields) {
    if (err) throw err;
    res.render("registerUserForm", {
      userInfo: result[0],
      users: result[1],
      rog: result[2],
      createdThreads: result[3],
    });
  });
});

app.get("/registerUserResult", (req, res) => {
  const userInfo = "SELECT * from userInfo ORDER BY id DESC;";
  const createdThreads = "SELECT * from createdThreads;";

  con.query(userInfo + createdThreads, function (err, result, fields) {
    if (err) throw err;
    res.render("registerUserResult", {
      userInfo: result[0],
      createdThreads: result[1],
    });
  });
});

app.get("/createThreadForm", (req, res) => {
  const userInfo = "SELECT * from userInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin;";
  const createdThreads = "SELECT * from createdThreads;";

  con.query(userInfo + users + rog + createdThreads, function (err, result, fields) {
    if (err) throw err;
    res.render("createThreadForm", {
      userInfo: result[0],
      users: result[1],
      rog: result[2],
      createdThreads: result[3],
    });
  });
});

app.get("/favoriteList", (req, res) => {
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin;";
  const createdThreads = "SELECT * from createdThreads;";
  const favoThreads = "SELECT * from favo;";

  con.query(threads + users + rog + createdThreads + favoThreads, function (err, result, fields) {
    if (err) throw err;
    res.render("favoriteList", {
      threads: result[0],
      users: result[1],
      rog: result[2],
      createdThreads: result[3],
      favoThreads: result[4],
    });
  });
});

app.get("/readAll/:title", (req, res) => {
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin;";
  const createdThreads = "SELECT * from createdThreads;";
  const target = "SELECT * FROM threadinfo WHERE title = ?;";
  // 2番目~5番目までのデータ取得
  const targets = "SELECT * FROM threadinfo WHERE title = ? limit 1,4;";
  // 対象のスレッドを取得
  const targetTitle = "SELECT * FROM createdThreads WHERE title = ?;";
  // お気に入り登録データ取得
  const favoThreads = "SELECT * from favo;";

  con.query(threads + users + rog + createdThreads + target + targets + targetTitle + favoThreads, [req.params.title,req.params.title,req.params.title], function (err, result, fields) {
    if (err) throw err;
    res.render("readAll", {
      threads: result[0],
      users: result[1],
      rog: result[2],
      createdThreads: result[3],
      target: result[4],
      targets: result[5],
      targetTitle: result[6],
      favoThreads: result[7],
    });
  });
});

app.get("/edit/:id", (req, res) => {
  const sql = "SELECT * FROM threadInfo WHERE id = ?;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin;";
  const threads = "SELECT * from threadInfo;";
  const createdThreads = "SELECT * from createdThreads;";

  con.query(sql + users + rog + threads + createdThreads, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    res.render("edit", {
      user: result[0],
      users: result[1],
      rog: result[2],
      threads: result[3],
      createdThreads: result[4],
    });
  });
});

app.post("/update/:id", (req, res) => {
  console.log(req.params.id);
  const sql = "UPDATE threadInfo SET ? WHERE id = " + req.params.id;
  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/");
  });
});

app.get("/rogout", (req, res) => {
  const sql = "DELETE FROM rogin order by id desc limit 1";
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/rogoutPage");
  });
});

// 投稿を削除する
app.get("/deleteComment/:id", (req, res) => {
  const sql = "DELETE FROM threadInfo WHERE id = ?";
  con.query(sql, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/");
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
