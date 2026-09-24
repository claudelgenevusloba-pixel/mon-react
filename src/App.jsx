import "./App.css"

import { BrowserRouter, Routes, Route } from "react-router-dom"

import Header from "./components/Header"
import Sidebar from "./components/Sidebar"

import Dashboard from "./pages/Dashboard"
import Employes from "./pages/Employes"
import Taches from "./pages/Taches"
import Demandes from "./pages/Demandes"
import Notifications from "./pages/Notifications"
import Parametres from "./pages/Parametres"

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        <Header />

        <div className="app-body">

          <Sidebar />

          <main className="main-content">

            <Routes>

              <Route path="/" element={<Dashboard />} />

              <Route path="/employes" element={<Employes />} />

              <Route path="/taches" element={<Taches />} />

              <Route path="/demandes" element={<Demandes />} />

              <Route
                path="/notifications"
                element={<Notifications />}
              />

              <Route
                path="/parametres"
                element={<Parametres />}
              />

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  )
}

export default App