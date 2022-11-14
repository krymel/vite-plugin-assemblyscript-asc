import { createEffect, createSignal, Show } from 'solid-js';
import { render } from 'solid-js/web';
import { add } from './as/build/assembly'

import './index.css';

const rootEl = document.getElementById('root') as HTMLElement

const App = () => {
    const [result, setResult] = createSignal<number>();

    createEffect(() => {
      setResult(add(2, 3))
    })

    return <>
        <Show when={!result()}>Loading...</Show>
        <Show when={result()}>WebAssembly result: {result()}</Show>
    </>;
}

// render the app
render(() => <App />, rootEl);
