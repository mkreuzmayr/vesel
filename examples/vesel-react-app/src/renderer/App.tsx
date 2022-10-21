import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const versions = window.versions;

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
        <div>
          <h3>Versions</h3>
          <ul className="versionList">
            {Object.entries(versions).map(([name, version]) => (
              <li key={name}>
                {name}: {version}
              </li>
            ))}
          </ul>
        </div>
        <p>
          Edit <code>renderer/App.tsx</code> or <code>main/index.ts</code> to
          test hot reloading.
        </p>
      </header>
    </div>
  );
}

export default App;
