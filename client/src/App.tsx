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
import AddPropertyPage from "./views/AddPropertyPage";
import PropertyListPage from "./views/PropertyListPage";
import FrontDeskPage from "./views/FrontDeskPage";
import RoomsPage from "./views/RoomsPage";
import RentersPage from "./views/RentersPage";
import AddRenterPage from "./views/AddRenterPage";
import PropertiesPage from "./views/PropertiesPage";
import AddGeneralRoomPage from "./views/AddGeneralRoomPage";

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
            path="/frontdesk"
            element={<FrontDeskPage />}
          />

          <Route
            path="/property"
            element={<PropertyListPage />}
          />
          <Route
            path="/property/add"
            element={<AddPropertyPage />}
          />
          <Route
            path="/property/:id"
            element={<PropertyDetail />}
          />
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

          <Route
            path="/expenses/maintenance"
            element={<MaintenancePage />}
          />
          <Route
            path="/expenses/add"
            element={<AddRenterExpenses />}
          />

          <Route
            path="/properties"
            element={<PropertiesPage />}
          />
          <Route
            path="/properties/add"
            element={<AddPropertyPage />}
          />

          <Route
            path="/rooms"
            element={<RoomsPage />}
          />
          <Route
            path="/rooms/add"
            element={<AddGeneralRoomPage />}
          />

          <Route
            path="/renters"
            element={<RentersPage />}
          />
          <Route
            path="/renters/add"
            element={<AddRenterPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
