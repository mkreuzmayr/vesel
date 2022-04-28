import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="header">
        <h1>Vesel App 🖖</h1>
        <p>Hello Electron, Vite & React!</p>
        <p>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            Count is: {count}
          </button>
        </p>
        <p>
          Edit <code>renderer/App.tsx</code> or <code>main/index.ts</code> to
          test hot reloading.
        </p>
      </header>
    </div>
  );
}

export default App;
