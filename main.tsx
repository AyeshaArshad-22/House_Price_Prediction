     1	import { StrictMode } from 'react'
     2	import { createRoot } from 'react-dom/client'
     3	import './index.css'
     4	import App from './App.tsx'
     5	
     6	createRoot(document.getElementById('root')!).render(
     7	  <StrictMode>
     8	    <App />
     9	  </StrictMode>,
    10	)
    11	