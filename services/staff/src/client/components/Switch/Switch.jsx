import React from 'react';

export function Switch ({ by, children }) {
    for (const child of children) {
        if (child.props.value === by) {
            return child;
        }
    }

    throw new Error('no such case');
}
