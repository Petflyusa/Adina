/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Minus, ExternalLink } from 'lucide-react';

export const SectionHeading = ({ 
  subtitle, 
  title, 
  description, 
  centered = false,
  inverse = false 
}: { 
  subtitle?: string, 
  title: string, 
  description?: string, 
  centered?: boolean,
  inverse?: boolean 
}) => (
  <div className={`mb-12 ${centered ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'}`}>
    {subtitle && (
      <span className={`text-brand-accent font-bold uppercase tracking-widest text-sm mb-4 block`}>
        {subtitle}
      </span>
    )}
    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${inverse ? 'text-white' : 'text-brand-primary'}`}>
      {title}
    </h2>
    {description && (
      <p className={`text-lg leading-relaxed ${inverse ? 'text-white/70' : 'text-brand-primary/70'}`}>
        {description}
      </p>
    )}
  </div>
);

export const Button = ({ 
  variant = 'primary', 
  children, 
  className = '',
  onClick,
  disabled,
  type = 'button',
  href,
  ...rest
}: { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost', 
  children: React.ReactNode, 
  className?: string,
  onClick?: () => void,
  disabled?: boolean,
  type?: 'button' | 'submit' | 'reset',
  href?: string,
  [key: string]: any
}) => {
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90',
    secondary: 'bg-brand-accent text-brand-primary hover:bg-brand-accent/90',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white',
    ghost: 'text-brand-primary hover:bg-brand-primary/5'
  };

  const classes = `px-8 py-3 rounded-lg font-semibold transition-all active:scale-95 duration-150 inline-flex items-center justify-center gap-2 text-center ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a 
        href={href} 
        onClick={onClick}
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
};

export const FaqAccordion = ({ items }: { items: { question: string, answer: string }[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border border-brand-primary/10 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-brand-surface transition-colors"
          >
            <span className="font-bold text-lg">{item.question}</span>
            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 pt-0 text-brand-primary/70 leading-relaxed border-t border-brand-primary/5">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export const ExternalButton = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center gap-1 text-brand-primary font-bold hover:underline"
  >
    {children}
    <ExternalLink className="w-4 h-4" />
  </a>
);
