import React, { forwardRef } from "react";

const SuggestionDropdown = forwardRef(({ data, handleClickDropdown }, ref) => {
  return (
    <ul
      ref={ref}
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg absolute mt-1 w-full z-10"
    >
      {data?.length > 0
        ? data.map((exercise, index) => (
            <li
              key={exercise.exercise_id || index}
              onClick={() => handleClickDropdown(exercise.name)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
            >
              {exercise.name} {/* Extract only the name */}
            </li>
          ))
        : null}
    </ul>
  );
});

export default SuggestionDropdown;
