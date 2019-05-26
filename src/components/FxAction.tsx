import * as React from 'react';

interface IFxActionProps {
    text: string;
}

export const FxAction = (props: IFxActionProps) => {
    return <div>
        <button style={{ background: 'green' }}>{props.text}</button>
    </div>
}