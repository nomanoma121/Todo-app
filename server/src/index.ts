import { Hono } from "hono";

const app = new Hono();

//test用
app.get("/", async (c: any) => {
  try {
    return c.json("Hello, World!");
  } catch (err) {
    return c.json({ message: err });
  }
});

// タスクを取得
app.get("/api/get", async (c: any) => {
  const table = await c.req.query("table");
  try {
    const result = await c.env.DB.prepare("SELECT * FROM ?").bind(table).all();
    return c.json(result);
  } catch (err) {
    return c.json({ error: "データ取得エラー" });
  }
});

// タスクを追加
app.post("/api/post", async (c: any) => {
  const param = await c.req.json();
  try {
    await c.env.DB.prepare(`INSERT INTO users (name) VALUES (?)`)
      .bind(param.name)
      .run();
    return c.json({ message: "Successfully created." });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return c.json({ error: "ユーザー名が既に存在します。" }, 400);
    }
    return c.json({ error: "データ挿入エラー" }, 500);
  }
});

//ユーザー登録
app.post("/api/register", async (c: any) => {
  const { registername } = await c.req.json();
  console.log(registername);
  try {
    await c.env.DB.prepare("INSERT INTO users (name) VALUES (?)")
      .bind(registername)
      .run();
    return c.json({ message: "Successfully created." }, 200);
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      console.log("このユーザー名はすでに存在します");
      return c.json({ message: "このユーザー名はすでに存在します" }, 400);
    }
    return c.json({ message: "An error occurred." }, 500);
  }
});

//ユーザー検索
app.post("/api/search", async (c: any) => {
  const { searchname } = await c.req.json();
  try {
    const result = await c.env.DB.prepare("SELECT * FROM users WHERE name = ?")
      .bind(searchname)
      .first();
    if (result) {
      return c.json(result, 200);
    } else {
      return c.json({ message: "ユーザーが見つかりません" }, 404);
    }
  } catch (err) {
    return c.json({ message: "検索中にエラーが発生しました" }, 500);
  }
});

//usernameからuseridを取得し、taskを取得する
app.get("/api/tasks", async (c: any) => {
  const username: string = await c.req.query("name");

  try {
    // ユーザーidを取得
    const userResult = await c.env.DB.prepare(
      "SELECT id FROM users WHERE name = ?"
    )
      .bind(username)
      .first();
    const userid = userResult.id;
    // ユーザーidをもとにタスクを取得
    const result = await c.env.DB.prepare(
      "SELECT * FROM tasks WHERE userid = ?"
    )
      .bind(userid)
      .all();
    //タスクが一つもない場合はuseridを渡す
    if (result.results.length == 0) {
      return c.json({ id: 0, userid: userid });
    }

    return c.json(result.results);
  } catch {
    console.log("Internal Server Error.");
    return c.json({ message: "Internal Server Error." }, 500);
  }
});

//タスクを追加
app.post("/api/add", async (c: any) => {
  const param = await c.req.json();
  try {
    await c.env.DB.prepare(
      "INSERT INTO tasks (userid, task, completed) VALUES (?, ?, ?)"
    )
      .bind(param.userid, param.task, param.completed)
      .run();

    return c.json({ message: "Successfully added" });
  } catch (error) {
    return c.json({ message: "Internal Server Error." });
  }
});

//completedを変更
app.put("/api/edit/:id", async (c: any) => {
  const id = c.req.param("id");

  const param = await c.req.json();
  //completedの値を反転させる
  const completed = param.completed ? 1 : 0;
  console.log(param);

  try {
    await c.env.DB.prepare("UPDATE tasks SET completed = ? WHERE id = ?")
      .bind(completed, id)
      .run();

    return c.json({ message: "Successfully edited" });
  } catch (err) {
    console.log(err);
    return c.json({ message: "Internal Server Error." });
  }
});

//タスクを削除
app.delete("/api/delete/:id", async (c: any) => {
  const id = c.req.param("id");

  try {
    await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
    return c.json({ message: "Successfully deleted" });
  } catch (err) {
    return c.json({ message: "Internal Server Error" });
  }
});

export default app;
