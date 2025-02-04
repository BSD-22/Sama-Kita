import { BrowserRouter, Routes, Route } from "react-router";
import LoginPage from "./views/LoginPage";
import OTPLoginPage from "./views/OTPLoginPage";
import BaseLayout from "./views/BaseLayout";
import DashboardPage from "./views/DashboardPage";
import GraphPerformancePage from "./views/GraphPerformancePage";
import PropertyDetail from "./views/PropertyDetail";
import RentersDetail from "./views/RentersDetail";
import AddRoomPage from "./views/AddRoomPage";
import MaintenancePage from "./views/MaintenancePage";
import AddRenterExpenses from "./views/AddRenterExpenses";
import EditRoomPage from "./views/EditRoomPage";
import LandingPage from "./views/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/landing"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/login/otp"
          element={<OTPLoginPage />}
        />
        <Route element={<BaseLayout />}>
          <Route
            path="/"
            element={<DashboardPage />}
          />
          <Route
            path="/graph"
            element={<GraphPerformancePage />}
          />
          <Route
            path="/expenses/maintenance"
            element={<MaintenancePage />}
          />
          <Route
            path="/expenses/add"
            element={<AddRenterExpenses />}
          />
          <Route
            path="/property/:id"
            element={<PropertyDetail />}
          />
          <Route />
          <Route
            path="/property/:id/renters"
            element={<RentersDetail />}
          />
          <Route
            path="/property/:propertyId/add"
            element={<AddRoomPage />}
          />
          <Route
            path="/property/:propertyId/edit/:roomId"
            element={<EditRoomPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
