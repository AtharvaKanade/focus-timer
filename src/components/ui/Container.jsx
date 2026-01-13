import React from 'react';

const Container = ({ children, className = '' }) => {
    return (
        <div className={`glass-panel rounded-2xl p-6 ${className}`}>
            {children}
        </div>
    );
};

export default Container;
