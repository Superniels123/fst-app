import { Routes, Route } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import Layout from './components/Layout'
import Home from './routes/Home'
import Materials from './routes/Materials'
import MaterialDetail from './routes/MaterialDetail'
import Parameters from './routes/Parameters'
import Equivalents from './routes/Equivalents'
import Approvals from './routes/Approvals'
import Calculator from './routes/Calculator'
import Quote from './routes/Quote'

export default function App() {
  return (
    <AuthGate>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/materialen" element={<Materials />} />
          <Route path="/materiaal/:code" element={<MaterialDetail />} />
          <Route path="/parameters" element={<Parameters />} />
          <Route path="/equivalenten" element={<Equivalents />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/quote" element={<Quote />} />
        </Routes>
      </Layout>
    </AuthGate>
  )
}
