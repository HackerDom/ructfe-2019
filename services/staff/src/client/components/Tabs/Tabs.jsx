import React from 'react';
import s from './Tabs.css';
import cn from 'classnames';

export function Tabs ({ tabs, onChange, selectedTab }) {
    const renderTab = (text) => {
        const handleClick = () => onChange(text);
        return (
            <button
                onClick={handleClick}
                className={cn(s.tab, { [s.selectedTab]: selectedTab === text })}
                key={text}
            >
                {text}
            </button>
        );
    };

    return (
        <div className={s.tabs}>
            {tabs.map(t => renderTab(t))}
        </div>
    );
}
