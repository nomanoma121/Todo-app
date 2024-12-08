import { Form, useActionData } from "@remix-run/react";

function Header() {
  const actionData = useActionData();
  const errorMessage = actionData?.message;
  return (
    <div style={{ padding: "20px", backgroundColor: "#f8f9fa" }}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Todoリスト
      </h1>
      <Form method="POST" style={{ display: "flex" }}>
        <input type="hidden" name="actionType" value="register" />
        <label
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          ユーザ登録
          <input
            type="text"
            name="register"
            style={{
              width: "200px",
              padding: "8px",
              marginTop: "5px",
              marginBottom: "10px",
              marginLeft: "10px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
            }}
          />
        </label>
        <input
          type="submit"
          value="登録"
          style={{
            backgroundColor: "#007bff",
            height: "40px",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        />
        {errorMessage && errorMessage !== "ユーザーが見つかりません" && (
          <label
            style={{
              color: "red",
              marginLeft: "10px",
              display: "block",
              marginTop: "10px",
            }}
          >
            {errorMessage}
          </label>
        )}
      </Form>
      <Form method="POST" style={{ marginBottom: "20px", display: "flex" }}>
        <input type="hidden" name="actionType" value="search" />
        <label
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          ユーザー検索
          <input
            type="text"
            name="search"
            style={{
              width: "200px",
              padding: "8px",
              marginTop: "5px",
              marginLeft: "10px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
            }}
          />
        </label>
        <input
          type="submit"
          value="さがす"
          style={{
            backgroundColor: "#007bff",
            height: "40px",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        />
        {errorMessage === "ユーザーが見つかりません" && (
          <label
            style={{
              color: "red",
              marginLeft: "10px",
              display: "block",
              marginTop: "10px",
            }}
          >
            {errorMessage}
          </label>
        )}
      </Form>
    </div>
  );
}

export default Header;
