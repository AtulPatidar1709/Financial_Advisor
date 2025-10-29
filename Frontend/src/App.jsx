import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import FinancialForm from './Pages/FinancialForm/FinancialForm.jsx';
import AdviceResult from './Pages/AdviceResult/AdviceResult.jsx';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FinancialForm />} />
          <Route path="/result" element={<AdviceResult />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
