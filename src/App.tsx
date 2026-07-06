import { Routes, Route } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import Layout from './components/Layout'
import Home from './routes/Home'
import Materials from './routes/Materials'
import MaterialDetail from './routes/MaterialDetail'
import Parameters from './routes/Parameters'

export default function App() {
  return (
    <AuthGate>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/materialen" element={<Materials />} />
          <Route path="/materiaal/:code" element={<MaterialDetail />} />
          <Route path="/parameters" element={<Parameters />} />
        </Routes>
      </Layout>
    </AuthGate>
  )
}
