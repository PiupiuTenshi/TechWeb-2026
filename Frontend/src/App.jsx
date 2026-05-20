import { Routes, Route } from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage'
import PhonePage from './pages/PhonePage'
import LaptopPage from './pages/LaptopPage'
import AccessoryPage from './pages/AccessoryPage'

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dien-thoai" element={<PhonePage />} />
          <Route path="/laptop" element={<LaptopPage />} />
          <Route path="/phu-kien" element={<AccessoryPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
