import React from "react";

export default function DataSetView({ data, render, loadNextPage }) {
  return (
    <div>
      {data.map(({ id, name }) => (
        <div>
          id: {id} name: {name}
        </div>
      ))}
    </div>
  );
}
