import React from "react";
import DataSetView from "../components/DataSetView";

export default function InfiniteTest() {
  return (
    <>
      <div>InfiniteTest</div>

      <div style={{ height: "35rem" }}>
        <DataSetView
          data={getData(1, 127)}
          render={Renderer}
          loadPage={async (page) => getData(page, 127)}
        />
      </div>
    </>
  );
}

function Renderer({ data }) {
  return (
    <>
      <div>
        ID: {data.id} NAME: {data.name}
      </div>
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
    results.push(item);
  }
  return results;
}

const randomNameGenerator = (num) => {
  let res = "";
  for (let i = 0; i < num; i++) {
    const random = Math.floor(Math.random() * 27);
    res += String.fromCharCode(97 + random);
  }
  return res;
};
