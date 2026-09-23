import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CustomDesign from './pages/CustomDesign'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/custom-design" element={<CustomDesign />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
