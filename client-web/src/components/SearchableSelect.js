import React, { useEffect, useMemo, useRef, useState } from "react";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  getOptionLabel = (opt) => opt?.label ?? "",
  getOptionValue = (opt) => opt?.value ?? "",
  placeholder = "Start typing…",
  inputClassName = "form-input",
  dropdownClassName = "searchable-select__dropdown",
  itemClassName = "searchable-select__item",
  emptyClassName = "searchable-select__empty",
  wrapperClassName = "searchable-select",
  disabled = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === "") return null;
    return (
      options.find((opt) => String(getOptionValue(opt)) === String(value)) ||
      null
    );
  }, [options, value, getOptionValue]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) =>
      String(getOptionLabel(opt)).toLowerCase().includes(q),
    );
  }, [options, query, getOptionLabel]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const displayValue = open ? query : selectedOption ? getOptionLabel(selectedOption) : "";

  return (
    <div className={wrapperClassName} ref={wrapperRef}>
      <input
        type="text"
        className={inputClassName}
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          if (disabled) return;
          setOpen(true);
          setQuery(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
          }
        }}
        aria-expanded={open}
        aria-autocomplete="list"
      />

      {open && !disabled && (
        <div className={dropdownClassName} role="listbox">
          {filtered.length === 0 ? (
            <div className={emptyClassName}>No matches</div>
          ) : (
            filtered.map((opt) => {
              const optValue = getOptionValue(opt);
              return (
                <button
                  key={String(optValue)}
                  type="button"
                  className={itemClassName}
                  onClick={() => {
                    if (typeof onChange === "function") {
                      onChange(optValue, opt);
                    }
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {getOptionLabel(opt)}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

