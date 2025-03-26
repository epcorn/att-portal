import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Layout,
  Dashboard,
  Quotes,
  Contracts,
  Cards,
  User,
  WorkLogDash,
  WorkLog,
  Login,
  PageNotFound,
  LandingPage,
} from "../src/pages/index.js";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Layout />}>
      <Route index element={<LandingPage />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="quotes" element={<Quotes />} />
      <Route path="contracts" element={<Contracts />} />
      <Route path="cards" element={<Cards />} />
      <Route path="user" element={<User />} />
      <Route path="workLog">
        <Route index element={<WorkLogDash />} />
        <Route path=":id" element={<WorkLog />} />
      </Route>
      {/* <Route path="reports" element={<Reports />} /> */}
      <Route path="404" element={<PageNotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <ToastContainer position="top-center" pauseOnFocusLoss={true} />
    <AppRoutes />
  </BrowserRouter>
);

export default App;
