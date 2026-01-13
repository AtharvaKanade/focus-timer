import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center pointer-events-auto border";

    const variants = {
        primary: "bg-moss-500/30 border-moss-400/20 hover:bg-moss-400/40 hover:border-moss-300 text-sage-50 shadow-[0_0_15px_rgba(62,132,102,0.2)]",
        secondary: "bg-sage-600/10 border-sage-500/10 hover:bg-sage-500/20 hover:border-sage-400/30 text-sage-200",
        danger: "bg-terra-500/20 border-terra-400/20 hover:bg-terra-500/30 hover:border-terra-300 text-terra-300",
        ghost: "bg-transparent border-transparent hover:bg-white/5 text-sage-400 hover:text-sage-100",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
