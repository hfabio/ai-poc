import { useState } from 'react'
import Llm from './pages/Llm';
import Hands from './pages/Hands';
// import Face from './pages/Face';

import './App.css';

const selectedStyle = {
  fontWeight: 'bold',
  color: 'black',
  background: '#ccc',
}

function App() {
  const [page, setPage] = useState('hands');

  const render = () => {
    if(page === 'hands') return <Hands />;
    // if(page === 'face') return <Face />;
    return <Llm />;
  }

  return (
    <>
    <header>
      <ul>
        <li style={{...(page === 'llm' ? selectedStyle : {})}} onClick={() => setPage('llm')}>LLM - chatbot</li>
        <li style={{...(page === 'hands' ? selectedStyle : {})}} onClick={() => setPage('hands')}>vision - hands</li>
        <li style={{...(page === 'face' ? selectedStyle : {})}} onClick={() => setPage('face')}>vision - face</li>
      </ul>
    </header>
    <section>
      {render()}
    </section>
    </>
  )
}

export default App
