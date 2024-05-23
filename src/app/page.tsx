'use client'
import { useEffect } from "react";
// import { useGlobalContext } from "@/app/context/page";

export default function Home() {
//   const {userId, setUserId, data, setData} = useGlobalContext();

//   useEffect(() => {
//     setUserId('2');
//     setData([
//       {firstName: 'Tim'},
//       {firstName: 'Tim2'},
//       {firstName: 'Tim3'},
//     ])
//   }, []);
  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Home page</h1>
      </div>
      <div className="flex flex-col gap-2">
        {/* <p>UserId: {userId}</p>
        <p>First Names: </p>
        {data.map((e,i) => <p key={i}>{e.firstName}</p>)} */}
      </div>
    </div>
  );
}
