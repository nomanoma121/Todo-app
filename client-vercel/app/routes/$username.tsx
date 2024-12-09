import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useActionData, useLoaderData, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const apiUrl = process.env.API_URL;
  const url = new URL(request.url);
  const username = url.pathname.replace(/^\/+/, "");
  const response = await fetch(`${apiUrl}/api/tasks?name=${username}`);
  const data = await response.json();
  return json({ data });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const apiUrl = process.env.API_URL;
  const formData = await request.formData();
  const method = formData.get("_method");

  if (method === "POST") {
    const userid = formData.get("userid");
    const task = formData.get("task");
    if (task === "") {
      return json({ message: "Bad Request" }, { status: 400 });
    }
    const response = await fetch(`${apiUrl}/api/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userid: userid, task: task, completed: 0 }),
    });

    if (response.ok) {
      console.log("タスク追加に成功しました");
    }
  } else if (method === "PUT") {
    const taskId = formData.get("id");
    const checkbox = formData.get("checkbox");
    const completed = checkbox === "on" ? 1 : 0;
    const response = await fetch(`${apiUrl}/api/edit/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: completed }),
    });

    if (response.ok) {
      console.log("タスクの編集に成功しました。");
    }
  } else if (method === "DELETE") {
    const taskId = formData.get("id");
    const response = await fetch(`${apiUrl}/api/delete/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return json({ message: "Internal Server Error." }, { status: 500 });
    }
  }
  return null;
};

function Todos() {
  const tasks = useLoaderData<typeof loader>();
  const actionData = useActionData();

  if (tasks.data.message === "Internal Server Error.") {
    return <h1>404 Not Found</h1>;
  }
  const [taskInput, setTaskInput] = useState("");
  const [copyTask, setCopyTask] = useState("");
  const userid = tasks.data.id !== 0 ? tasks.data[0].userid : tasks.data.userid;

  const username = useLocation().pathname.replace(/^\/+/, "");

  useEffect(() => {
    setCopyTask(taskInput);
  }, [taskInput]);

  return (
    <div style={{ padding: "20px" }}>
      <div>
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
        >
          {username}さんのTODOリスト
        </h2>
      </div>
      <Form
        method="POST"
        style={{ marginBottom: "20px", display: "flex", width: "100%" }}
      >
        <input type="hidden" name="_method" value="POST" />
        <input type="hidden" name="userid" value={userid} />
        <input type="hidden" name="task" value={copyTask} />
        <label
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          タスクを追加:
          <input
            type="text"
            name="task"
            style={{
              width: "200px",
              padding: "8px",
              marginTop: "5px",
              marginBottom: "10px",
              marginLeft: "10px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
            }}
            placeholder="新しいタスクを入力"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
        </label>
        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            height: "40px",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
          onClick={() => setTaskInput("")}
        >
          追加
        </button>
        {actionData?.message === "Bad Request" && (
          <label
            style={{
              color: "red",
              marginLeft: "10px",
              display: "block",
              marginTop: "10px",
            }}
          >
            タスクを入力してください
          </label>
        )}
      </Form>
      <ul style={{ padding: 0 }}>
        {tasks.data.id !== 0 &&
          tasks.data.map((task) => (
            <li
              key={task.id}
              style={{
                display: "flex",
                width: "600p",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: "#fff",
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Form
                method="POST"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input type="hidden" name="_method" value="PUT" />
                <input type="hidden" name="id" value={task.id} />
                <input
                  type="checkbox"
                  name="checkbox"
                  checked={task.completed}
                  onClick={(e) => e.target.form?.submit()}
                  readOnly
                />
                <span
                  style={{ flexGrow: 1, marginRight: "10px", color: "#555" }}
                >
                  {task.task}
                </span>
              </Form>
              <Form method="POST">
                <input type="hidden" name="_method" value="DELETE" />
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  style={{
                    padding: "5px 10px",
                    border: "none",
                    backgroundColor: "#dc3545",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  削除
                </button>
              </Form>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Todos;
