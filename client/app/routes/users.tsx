import { json, useLoaderData } from "@remix-run/react";

// `loader` 関数でデータを取得する
export const loader = async ({ context }) => {
  const apiUrl = context.cloudflare.env.API_URL;
  const response = await fetch(`${apiUrl}/api/get?table='users'`);
  const data = await response.json();
  console.log("loader function running!!");
  return json({data});
};

// コンポーネントで useLoaderData を使用
export default function Tasks() {
  const items: any = useLoaderData();
  
  const itemsArray = items.data.results;

  return (
    <div>
      {itemsArray.map((e:any) => (
        <li key={e.id}>{e.name}</li>
      ))}
    </div>
  );
}
