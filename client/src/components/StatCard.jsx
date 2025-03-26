/* eslint-disable react/prop-types */
import { useState } from "react";

const StatCard = ({ title, value, icon, color, icons }) => {
  const [hoveredIcon, setHoveredIcon] = useState(null);

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between relative">
        {/* Title & Value */}
        <div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p
            className={`text-3xl font-bold ${color.replace(
              "border-",
              "text-"
            )}`}
          >
            {value ?? 0}
          </p>
        </div>

        {/* Main Icon */}
        <div className={`text-4xl ${color.replace("border-", "text-")}`}>
          {icon}
        </div>

        {/* Conditional Icons Section */}
        {icons.length > 0 && (
          <div className="mt-2 absolute flex bottom-0 right-0 space-x-1">
            {icons.map((item) => (
              <div
                key={item.id}
                className="relative text-sm cursor-pointer "
                onMouseEnter={(e) =>
                  setHoveredIcon({ text: item.text, position: e.target })
                }
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <div className={`text-lg ${color.replace("border-", "text-")}`}>
                  {item.icon}
                </div>

                {/* Tooltip - Visible only when hovered */}
                {hoveredIcon?.text === item.text && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-100 transition-opacity duration-200">
                    {hoveredIcon.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
