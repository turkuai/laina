import React, { useEffect } from "react";
import {useState} from "react";

export default function DataSetView({ render: Render, loadPage }) {

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  useEffect(() => {

    console.log("Loading page", page);

    loadPage(page).then((pageItems) => {
      setItems((prev) => [...prev, ...pageItems]);
    });
  }, [page]);
  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      console.log("Reached bottom of div");
      setPage((prev) => prev + 1);
    }
  };
  return (
    <div style={{ height: "100%", overflowY: "auto" }} onScroll={handleScroll}>
      <div>
        {items.map((item) => (
          <Render data={item} />
        ))}
      </div>
    </div>
  );
}
