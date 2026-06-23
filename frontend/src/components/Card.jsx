import React from 'react';

const Card = ({ children, className = '', title, action, hover = true }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 transition-all duration-300 ${hover ? 'hover-scale' : ''} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
