const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const port = 3000;
var MAX_ITEMS_PER_PAGE = 1;

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
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const targetThreadsRes = "SELECT * from threadinfo WHERE threadId = 1;";
  const targetThread = "SELECT * from createdThreads WHERE id = 1;";
  // 最新4件のレス取得
  const targetThreadsResLatest4 =
    "select T.* from (select * from threadinfo WHERE threadId = 1 order by resId desc limit 4) as T order by T.resId;";
  const targetThreadsResLatest4s =
    "select T.* from (select * from threadinfo WHERE threadId = 1 order by resId desc limit 1,4) as T order by T.resId;";
  const favoThreads = "SELECT * from favo order by threadId asc;";
  const resCount =
    "select threadId, count(threadId) from threadInfo group by threadId order by threadId asc;";
  const favoCount =
    "select threadId, count(threadId) from favo group by threadId order by threadId asc;";
  var query = req.query.q;
  var page = req.query.pg ? parseInt(req.query.pg) : 1;

  con.query(
    threads +
      users +
      rog +
      createdThreads +
      targetThreadsRes +
      targetThread +
      targetThreadsResLatest4 +
      targetThreadsResLatest4s +
      favoThreads +
      resCount +
      favoCount,
    function (err, result, fields) {
      if (err) throw err;
      res.render("index", {
        threads: result[0],
        users: result[1],
        rog: result[2],
        createdThreads: result[3],
        targetThreadsRes: result[4],
        targetThread: result[5],
        targetThreadsResLatest4: result[6],
        targetThreadsResLatest4s: result[7],
        favoThreads: result[8],
        resCount: result[9],
        favoCount: result[10],
        pagination: {
          max: Math.ceil(result[3].length / MAX_ITEMS_PER_PAGE),
          current: page,
          isFirst: page === 1,
          isLast: page === Math.ceil(result[3].length / MAX_ITEMS_PER_PAGE),
        },
        query: query,
      });
    }
  );
});

// ページネーション
app.get("/pagination/:i", (req, res) => {
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const targetThreadsRes = "SELECT * from threadinfo WHERE threadId = ?;";
  const targetThread = "SELECT * from createdThreads WHERE id = ?;";
  // 最新4件のレス取得
  const targetThreadsResLatest4 =
    "select T.* from (select * from threadinfo WHERE threadId = ? order by resId desc limit 4) as T order by T.resId;";
  const targetThreadsResLatest4s =
    "select T.* from (select * from threadinfo WHERE threadId = ? order by resId asc limit 1,4) as T order by T.resId;";
  const favoThreads = "SELECT * from favo order by threadId asc;";
  const resCount =
    "select threadId, count(threadId) from threadInfo group by threadId order by threadId asc;";
  const favoCount =
    "select threadId, count(threadId) from favo group by threadId order by threadId asc;";
  var page = req.params.i;

  con.query(
    threads +
      users +
      rog +
      createdThreads +
      targetThreadsRes +
      targetThread +
      targetThreadsResLatest4 +
      targetThreadsResLatest4s +
      favoThreads +
      resCount +
      favoCount,
    [req.params.i, req.params.i, req.params.i, req.params.i],
    function (err, result, fields) {
      if (err) throw err;
      res.render("pagination", {
        threads: result[0],
        users: result[1],
        rog: result[2],
        createdThreads: result[3],
        targetThreadsRes: result[4],
        targetThread: result[5],
        targetThreadsResLatest4: result[6],
        targetThreadsResLatest4s: result[7],
        favoThreads: result[8],
        resCount: result[9],
        favoCount: result[10],
        pagination: {
          max: Math.ceil(result[3].length / MAX_ITEMS_PER_PAGE),
          current: parseInt(page),
          isFirst: page === 1,
          isLast: page === Math.ceil(result[3].length / MAX_ITEMS_PER_PAGE),
        },
      });
    }
  );
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
app.post("/comment/:title", (req, res) => {
  const sql = "INSERT INTO threadinfo SET ?";

  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/readAll/" + req.params.title);
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
    res.redirect("/");
  });
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
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const favoThreads = "SELECT * from favo order by threadId asc;";

  con.query(
    userInfo + users + rog + createdThreads + favoThreads,
    function (err, result, fields) {
      if (err) throw err;
      res.render("registerUserForm", {
        userInfo: result[0],
        users: result[1],
        rog: result[2],
        createdThreads: result[3],
        favoThreads: result[4],
      });
    }
  );
});

app.get("/registerUserResult", (req, res) => {
  const userInfo = "SELECT * from userInfo ORDER BY id DESC;";
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const favoThreads = "SELECT * from favo order by threadId asc;";

  con.query(
    userInfo + rog + createdThreads + favoThreads,
    function (err, result, fields) {
      if (err) throw err;
      res.render("registerUserResult", {
        userInfo: result[0],
        rog: result[1],
        createdThreads: result[2],
        favoThreads: result[3],
      });
    }
  );
});

app.get("/createThreadForm", (req, res) => {
  const userInfo = "SELECT * from userInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const favoThreads = "SELECT * from favo order by threadId asc;";

  con.query(
    userInfo + users + rog + createdThreads + favoThreads,
    function (err, result, fields) {
      if (err) throw err;
      res.render("createThreadForm", {
        userInfo: result[0],
        users: result[1],
        rog: result[2],
        createdThreads: result[3],
        favoThreads: result[4],
      });
    }
  );
});

app.get("/favoriteList/:name/:threadId", (req, res) => {
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const favoThreads =
    "SELECT * from favo WHERE name = ? order by threadId asc;";
  const targetThreadsRes = "SELECT * from threadinfo WHERE threadId = ?;";
  // 最新4件のレス取得
  const targetThreadsResLatest4 =
    "select T.* from (select * from threadinfo WHERE threadId = ? order by resId desc limit 4) as T order by T.resId;";
  const targetThreadsResLatest4s =
    "select T.* from (select * from threadinfo WHERE threadId = ? order by resId asc limit 1,4) as T order by T.resId;";
  const targetThread = "SELECT * from createdThreads WHERE id = ?;";
  const resCount =
    "select threadId, count(threadId) from threadInfo group by threadId order by threadId asc;";
  var query = req.query.q;
  var page = req.query.pg ? parseInt(req.query.pg) : 1;

  con.query(
    threads +
      users +
      rog +
      createdThreads +
      favoThreads +
      targetThreadsRes +
      targetThreadsResLatest4 +
      targetThreadsResLatest4s +
      targetThread +
      resCount,
    [
      req.params.name,
      req.params.threadId,
      req.params.threadId,
      req.params.threadId,
      req.params.threadId,
    ],
    function (err, result, fields) {
      if (err) throw err;
      res.render("favoriteList", {
        threads: result[0],
        users: result[1],
        rog: result[2],
        createdThreads: result[3],
        favoThreads: result[4],
        targetThreadsRes: result[5],
        targetThreadsResLatest4: result[6],
        targetThreadsResLatest4s: result[7],
        targetThread: result[8],
        resCount: result[9],
        pagination: {
          max: Math.ceil(result[4].length / MAX_ITEMS_PER_PAGE),
          current: page,
          isFirst: page === 1,
          isLast: page === Math.ceil(result[4].length / MAX_ITEMS_PER_PAGE),
        },
      });
    }
  );
});

app.get("/favoriteList/:name/:threadId/:i", (req, res) => {
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const favoThreads =
    "SELECT * from favo WHERE name = ? order by threadId asc;";
  const targetThreadsRes = "SELECT * from threadinfo WHERE threadId = ?;";
  // 最新4件のレス取得
  const targetThreadsResLatest4 =
    "select T.* from (select * from threadinfo WHERE threadId = ? order by resId desc limit 4) as T order by T.resId;";
  const targetThreadsResLatest4s =
    "select T.* from (select * from threadinfo WHERE threadId = ? order by resId asc limit 1,4) as T order by T.resId;";
  const targetThread = "SELECT * from createdThreads WHERE id = ?;";
  const resCount =
    "select threadId, count(threadId) from threadInfo group by threadId order by threadId asc;";
  var page = req.params.i;

  con.query(
    threads +
      users +
      rog +
      createdThreads +
      favoThreads +
      targetThreadsRes +
      targetThreadsResLatest4 +
      targetThreadsResLatest4s +
      targetThread +
      resCount,
    [
      req.params.name,
      req.params.threadId,
      req.params.threadId,
      req.params.threadId,
      req.params.threadId,
    ],
    function (err, result, fields) {
      if (err) throw err;
      res.render("favoriteList", {
        threads: result[0],
        users: result[1],
        rog: result[2],
        createdThreads: result[3],
        favoThreads: result[4],
        targetThreadsRes: result[5],
        targetThreadsResLatest4: result[6],
        targetThreadsResLatest4s: result[7],
        targetThread: result[8],
        resCount: result[9],
        pagination: {
          max: Math.ceil(result[4].length / MAX_ITEMS_PER_PAGE),
          current: parseInt(page),
          isFirst: page === 1,
          isLast: page === Math.ceil(result[4].length / MAX_ITEMS_PER_PAGE),
        },
      });
    }
  );
});

app.get("/readAll/:title", (req, res) => {
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const target = "SELECT * FROM threadinfo WHERE title = ?;";
  // 1番目~50番目までのデータ取得
  const targets = "SELECT * FROM threadinfo WHERE title = ? limit 0,50;";
  // 対象のスレッドを取得
  const targetTitle = "SELECT * FROM createdThreads WHERE title = ?;";
  // お気に入り登録データ取得
  const favoThreads = "SELECT * from favo order by threadId asc;";
  const targetThreadsRes = "SELECT * from threadinfo WHERE title = ?;";
  const favoCount =
    "select threadId, count(threadId) from favo group by threadId order by threadId asc;";
    
  // ページネーション
  var query = req.query.q;
  var page = req.query.pg ? parseInt(req.query.pg) : 1;

  con.query(
    threads +
      users +
      rog +
      createdThreads +
      target +
      targets +
      targetTitle +
      favoThreads +
      targetThreadsRes +
      favoCount,
    [req.params.title, req.params.title, req.params.title, req.params.title],
    function (err, result, fields) {
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
        targetThreadsRes: result[8],
        favoCount: result[9],
        pagination: {
          max: Math.ceil(result[4].length / 50),
          current: page,
          isFirst: page === 1,
          isLast: page === Math.ceil(result[4].length / 50),
        },
        query: query,
      });
    }
  );
});

app.get("/readAll/:title/:i", (req, res) => {
  const threads = "SELECT * from threadInfo;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin order by id desc;";
  const createdThreads = "SELECT * from createdThreads;";
  const target = "SELECT * FROM threadinfo WHERE title = ?;";
  // 51番目~のデータ取得
  const targets = "SELECT * FROM threadinfo WHERE title = ? limit ?,?;";
  // 対象のスレッドを取得
  const targetTitle = "SELECT * FROM createdThreads WHERE title = ?;";
  // お気に入り登録データ取得
  const favoThreads = "SELECT * from favo order by threadId asc;";
  const favoCount =
    "select threadId, count(threadId) from favo group by threadId order by threadId asc;";
    const targetThreadsRes = "SELECT * from threadinfo WHERE title = ?;";
  // ページネーション
  var page = req.params.i;

  con.query(
    threads +
      users +
      rog +
      createdThreads +
      target +
      targets +
      targetTitle +
    favoThreads +
    favoCount +
    targetThreadsRes,
    [
      req.params.title,
      req.params.title,
      50 * (parseInt(req.params.i) - 1),
      50 * parseInt(req.params.i),
      req.params.title,
      req.params.title,
    ],
    function (err, result, fields) {
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
        favoCount: result[8],
        targetThreadsRes: result[9],
        pagination: {
          max: Math.ceil(result[4].length / 50),
          current: parseInt(page),
          isFirst: page === 1,
          isLast: page === Math.ceil(result[4].length / 50),
        },
      });
    }
  );
});

app.get("/edit/:id", (req, res) => {
  const sql = "SELECT * FROM threadInfo WHERE id = ?;";
  const users = "SELECT * from userInfo;";
  const rog = "SELECT * from rogin order by id desc;";
  const threads = "SELECT * from threadInfo;";
  const createdThreads = "SELECT * from createdThreads;";
  const favoThreads = "SELECT * from favo order by threadId asc;";

  con.query(
    sql + users + rog + threads + createdThreads + favoThreads,
    [req.params.id],
    function (err, result, fields) {
      if (err) throw err;
      res.render("edit", {
        user: result[0],
        users: result[1],
        rog: result[2],
        threads: result[3],
        createdThreads: result[4],
        favoThreads: result[5],
      });
    }
  );
});

app.post("/update/:id/:ref/:ref2", (req, res) => {
  console.log(req.params.id);
  const sql = "UPDATE threadInfo SET ? WHERE id = " + req.params.id;
  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/"+ req.params.ref + "/" + req.params.ref2);
  });
});

app.post("/update/:id/:ref/:ref2/:ref3", (req, res) => {
  console.log(req.params.id);
  const sql = "UPDATE threadInfo SET ? WHERE id = " + req.params.id;
  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/"+ req.params.ref + "/" + req.params.ref2 + "/" + req.params.ref3);
  });
});

app.post("/update/:id/:ref/:ref2/:ref3/:ref4", (req, res) => {
  console.log(req.params.id);
  const sql = "UPDATE threadInfo SET ? WHERE id = " + req.params.id;
  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/"+ req.params.ref + "/" + req.params.ref2 + "/" + req.params.ref3 + "/" + req.params.ref4);
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
app.post("/deleteComment/:id/:ref/:ref2", (req, res) => {
  const sql = "DELETE FROM threadInfo WHERE id = ?";
  con.query(sql, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/"+ req.params.ref + "/" + req.params.ref2);
  });
});

app.post("/deleteComment/:id/:ref/:ref2/:ref3", (req, res) => {
  const sql = "DELETE FROM threadInfo WHERE id = ?";
  con.query(sql, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/"+ req.params.ref + "/" + req.params.ref2 + "/" + req.params.ref3);
  });
});

app.post("/deleteComment/:id/:ref/:ref2/:ref3/:ref4", (req, res) => {
  const sql = "DELETE FROM threadInfo WHERE id = ?";
  con.query(sql, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/"+ req.params.ref + "/" + req.params.ref2 + "/" + req.params.ref3 + "/" + req.params.ref4);
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
