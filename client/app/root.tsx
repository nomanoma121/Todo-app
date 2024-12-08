import {
  Links,
  Meta,
  Scripts,
  Outlet,
  redirect,
  json,
  useLoaderData,
} from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import Header from "./Header";

//Header.tsxからPOST
export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const registername = formData.get("register");
  const searchname = formData.get("search");
  const apiUrl = context.cloudflare.env.API_URL;

  if (actionType == "register") {
    // ユーザー登録
    if (registername === "") {
      return json({ message: "登録するユーザー名を入力してください" }, 400);
    }

    if (registername.match(/[^a-zA-Z0-9]/)) {
      return json({ message: "使用できるのは英数字のみです" }, 400);
    }
    console.log("registername", registername);

    const response = await fetch(`${apiUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registername: registername }),
    });

    if (response.ok) {
      console.log("ユーザー登録に成功しました。");
      return redirect(`/${registername}`);
    } else {
      const data = await response.json();
      console.log(data);
      return json({ message: data.message }, response.status);
    }
    // ユーザー検索
  } else if (actionType == "search") {
    const response = await fetch(`${apiUrl}/api/search`, {
      method: "POST",
      body: JSON.stringify({ searchname: searchname }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (response.ok) {
      return redirect(`/${data.name}`);
    } else {
      return json({ message: data.message }, response.status);
    }
  }
  return null;
};

export const loader = async ({ context }) => {
  const apiUrl = context.cloudflare.env.API_URL;
  console.log("apiUrl", apiUrl);
  try {
    const response = await fetch(`https://todo-app-server.takeuchi180121.workers.dev/`);
    const data = await response.json();
    return json({ data });
  } catch (err) {
    return json({ message: err }, 500);
  }
};

export default function App() {
  const loaderData = useLoaderData();
  console.log(loaderData);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body
        style={{ margin: 0, backgroundColor: "#f8f9fa", padding: "0 100px" }}
      >
        <Header />
        <main>
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}
