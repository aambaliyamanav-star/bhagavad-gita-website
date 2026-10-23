import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, Plus } from "lucide-react";
import { searchLocationItems } from "../utils/indiaLocations";
import "./SearchableLocationSelect.css";

/**
 * SearchableLocationSelect
 * Provides multi-lingual autocomplete searchable dropdown.
 * Users can type in English, Hindi, or Gujarati to filter options in real-time,
 * while options are displayed cleanly in the active language without brackets.
 * Top option is always "OTHER" / "અન્ય" / "अन्य".
 */
export default function SearchableLocationSelect({
  id,
  name,
  value,
  onChange,
  onCustomEnter,
  items = [],
  placeholder = "",
  disabled = false,
  language = "gu",
  emptyText = "કોઈ પરિણામ મળ્યું નથી",
  addCustomText = "+ આ દાખલ કરો:",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Find currently selected item to show localized name
  const selectedItem = items.find(
    (it) => it.id === value || it.name === value
  );

  const displayValue = selectedItem
    ? selectedItem.name
    : value === "OTHER"
    ? (language === "en" ? "Other" : language === "hi" ? "अन्य" : "અન્ય")
    : value || "";

  // Filter items using multi-lingual matching
  const filteredItems = searchLocationItems(items, searchQuery, language);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight index when filtered items change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector(".searchable-option.highlighted");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (item) => {
    if (!item) return;
    onChange(item.id === "OTHER" ? "OTHER" : item.id, item);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[highlightedIndex]) {
        handleSelect(filteredItems[highlightedIndex]);
      } else if (searchQuery.trim() && onCustomEnter) {
        onCustomEnter(searchQuery.trim());
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("", null);
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-location-wrap ${isOpen ? "is-open" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
      onKeyDown={handleKeyDown}
    >
      <div
        className="searchable-location-control"
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            if (!isOpen && inputRef.current) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
      >
        <div className="searchable-location-input-box">
          {isOpen ? (
            <input
              ref={inputRef}
              id={id}
              name={name}
              type="text"
              className="searchable-location-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={displayValue || placeholder}
              autoComplete="off"
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={`searchable-location-value ${
                !displayValue ? "is-placeholder" : ""
              }`}
            >
              {displayValue || placeholder}
            </span>
          )}
        </div>

        <div className="searchable-location-actions">
          {value && !disabled && (
            <button
              type="button"
              className="searchable-clear-btn"
              onClick={handleClear}
              title="Clear"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`searchable-arrow-icon ${isOpen ? "rotated" : ""}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="searchable-location-dropdown" role="listbox">
          {/* Top search icon hint when searching */}
          <div className="searchable-dropdown-searchbar">
            <Search size={14} className="searchable-search-icon" />
            <input
              type="text"
              className="searchable-inner-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "en"
                  ? "Type in English / Hindi / Gujarati..."
                  : language === "hi"
                  ? "अंग्रेजी / हिंदी / गुजराती में टाइप करें..."
                  : "અંગ્રેજી / હિન્દી / ગુજરાતીમાં ટાઈપ કરો..."
              }
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                className="searchable-inner-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <ul ref={listRef} className="searchable-options-list">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const isSelected =
                  item.id === value ||
                  item.name === value ||
                  (item.id === "OTHER" && value === "OTHER");
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={item.id}
                    className={`searchable-option ${
                      isSelected ? "is-selected" : ""
                    } ${isHighlighted ? "highlighted" : ""} ${
                      item.id === "OTHER" ? "is-other-option" : ""
                    }`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="searchable-option-text">
                      {item.id === "OTHER" && "✦ "}
                      {item.name}
                    </span>
                    {isSelected && (
                      <Check size={16} className="searchable-check-icon" />
                    )}
                  </li>
                );
              })
            ) : (
              <li className="searchable-no-options">
                <span>{emptyText}</span>
                {searchQuery.trim() && onCustomEnter && (
                  <button
                    type="button"
                    className="searchable-custom-add-btn"
                    onClick={() => {
                      onCustomEnter(searchQuery.trim());
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <Plus size={14} /> {addCustomText} "{searchQuery.trim()}"
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
