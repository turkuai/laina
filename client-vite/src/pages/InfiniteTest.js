import React from "react";
import DataSetView from "../components/DataSetView";

export default function InfiniteTest() {
  return (
    <>
      <div>InfiniteTest</div>
      <DataSetView data={getData(1, 27)} render={null} loadNextPage={null} />
    </>
  );
}

function getData(page, count) {
  const results = [];
  for (let i = 1; i <= count; i++) {
    const item = {
      id: count * (page - 1) + i,
      name: randomNameGenerator(10),
    };
    results.push(item)
  }
  return results;
}


const randomNameGenerator = num => {
   let res = '';
   for(let i = 0; i < num; i++){
      const random = Math.floor(Math.random() * 27);
      res += String.fromCharCode(97 + random);
   };
   return res;
};