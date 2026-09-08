import React from "react";

const Avatar = ({ src, className = "" }) => (
  <div className={`overflow-hidden bg-gray-300 ${className}`}>
    {src ? (
      <img src={src} alt="" className="w-full h-full object-cover" />
    ) : (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <rect width="100" height="100" fill="#bdbdbd" />
        <circle cx="50" cy="36" r="18" fill="#e0e0e0" />
        <path d="M50 58c-24 0-42 16-42 46h84c0-30-18-46-42-46z" fill="#e0e0e0" />
      </svg>
    )}
  </div>
);

export default Avatar;
