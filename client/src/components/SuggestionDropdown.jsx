import React, { forwardRef } from "react";

const SuggestionDropdown = forwardRef(
  ({ data, handleClickDropdown, highlightedIndex }, ref) => {
    return (
      <ul
        ref={ref}
        className="absolute left-0 top-full z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-700 rounded-md"
      >
        {data?.length > 0
          ? data.map((exercise, index) => (
              <li
                key={exercise.exercise_id || index}
                onClick={() => handleClickDropdown(exercise.name)}
                className={`p-2 cursor-pointer text-gray-900 dark:text-white ${
                  index === highlightedIndex
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {exercise.name} {/* Extract only the name */}
              </li>
            ))
          : null}
      </ul>
    );
  }
);

export default SuggestionDropdown;
