import React from 'react';
import s from './SelectItemList.css';
import cn from 'classnames';

export function SelectListItem ({ items, selectedId, onChange }) {
    const renderItem = ({ id, item }) => {
        const changeHandler = () => onChange(id);

        return (
            <button
                className={cn(s.item, { [s.selected]: id === selectedId })}
                onClick={changeHandler}
                key={id}
            >
                <div className={s.itemCircle} />
                <span>{item}</span>
            </button>
        );
    };

    return items.map(renderItem);
}
