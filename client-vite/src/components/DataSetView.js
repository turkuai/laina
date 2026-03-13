import React, { useEffect, useState } from "react";

export default function DataSetView({ render: Render, loadPage }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);

  // Load data for the current page.
  useEffect(() => {
    let cancelled = false;

    loadPage(page).then((pageItems) => {
      if (cancelled) return;
      if (!Array.isArray(pageItems) || pageItems.length === 0) {
        return;
      }
      setItems((prev) => [...prev, ...pageItems]);
    });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // Use window scroll to advance pages (avoids nested scrollbars).
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {items.map((item, index) => (
        <Render key={item.id ?? index} data={item} />
      ))}
    </div>
  );
}

