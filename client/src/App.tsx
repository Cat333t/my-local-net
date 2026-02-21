import { useState, useEffect } from 'react'
import './styles/App.css'

import { ThemeProvider } from './providers/ThemeProvider'

function App() {
  const [text, setText] = useState('')

  useEffect(() => {
    fetch('/api')
      .then(res => res.json().then(data => data.message))
      .then(setText)
  }, [text])

  return (
    <>
      <ThemeProvider>
        <h1>{text}</h1>
      </ThemeProvider>
    </>
  )
}

export default App
