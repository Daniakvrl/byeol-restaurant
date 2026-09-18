
import {
    BrowserRouter as Router,
    Navigate,
    Outlet,
    Routes,
    Route
} from "react-router-dom";

import { ROUTES, LOCAL_STORAGE_KEYS } from "./constants";
import { isAdminToken } from "./utils/auth";

// Pages publiques
import LandingPage from "./pages/LandingPage";
import MenuView from "./pages/MenuView.jsx";
import ReservationPage from "./pages/ReservationPage";
import ReservationSuccessPage from "./pages/ReservationSuccessPage";
import ReservationCancellationPage from "./pages/ReservationCancellationPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ContactPage from "./pages/ContactPage";

// Pages connexion
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Pages staff
import HomePage from "./pages/HomePage";
import KitchenDashboard from "./pages/KitchenDashboard";
import TablesDashboard from "./pages/TablesDashboard.jsx";
import OrderView from "./pages/OrderView.jsx";
import ReceiptView from "./pages/ReceiptView.jsx";

// Pages admin
import AdminDashboard from "./pages/AdminDashboard";
import MenuAdminPage from "./pages/MenuAdminPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import StaffManagementPage from "./pages/StaffManagementPage.jsx";
import SessionSummaryPage from "./pages/SessionSummaryPage.jsx";


function RequireAuth() {
    const token = localStorage.getItem(
        LOCAL_STORAGE_KEYS.AUTH_TOKEN
    );

    if (!token) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                replace
            />
        );
    }

    return <Outlet />;
}


function RequireAdmin() {
    const token = localStorage.getItem(
        LOCAL_STORAGE_KEYS.AUTH_TOKEN
    );

    if (!token) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                replace
            />
        );
    }

    if (!isAdminToken(token)) {
        return (
            <Navigate
                to={ROUTES.STAFF_HOME}
                replace
            />
        );
    }

    return <Outlet />;
}


function App() {
    return (
        <Router>
            <Routes>

                {/* ================================
                    PAGES PUBLIQUES
                   ================================ */}

                <Route
                    path={ROUTES.LANDING}
                    element={<LandingPage />}
                />

                <Route
                    path={ROUTES.MENU}
                    element={<MenuView />}
                />

                <Route
                    path={ROUTES.RESERVATION}
                    element={<ReservationPage />}
                />

                <Route
                    path="/reservation/success"
                    element={<ReservationSuccessPage />}
                />

                <Route
                    path="/reservation/annuler/:token"
                    element={<ReservationCancellationPage />}
                />

                <Route
                    path="/suivi/:token"
                    element={<OrderTrackingPage />}
                />

                {/* Contact / Aide — public */}
                <Route
                    path="/contact"
                    element={<ContactPage />}
                />


                {/* ================================
                    CONNEXION
                   ================================ */}

                <Route
                    path={ROUTES.LOGIN}
                    element={<LoginPage />}
                />

                <Route
                    path={ROUTES.REGISTER}
                    element={<RegisterPage />}
                />


                {/* ================================
                    ESPACE STAFF
                   ================================ */}

                <Route element={<RequireAuth />}>

                    <Route
                        path={ROUTES.STAFF_HOME}
                        element={<HomePage />}
                    />

                    <Route
                        path={ROUTES.KITCHEN}
                        element={<KitchenDashboard />}
                    />

                    <Route
                        path={ROUTES.SERVER}
                        element={<TablesDashboard />}
                    />

                    <Route
                        path={ROUTES.ORDER_VIEW}
                        element={<OrderView />}
                    />

                    <Route
                        path={ROUTES.RECEIPT}
                        element={<ReceiptView />}
                    />

                </Route>


                {/* ================================
                    ESPACE ADMIN
                   ================================ */}

                <Route
                    path="/admin"
                    element={<RequireAdmin />}
                >

                    <Route
                        index
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="menu"
                        element={<MenuAdminPage />}
                    />

                    <Route
                        path="stats"
                        element={<StatsPage />}
                    />

                    <Route
                        path="staff"
                        element={<StaffManagementPage />}
                    />

                    <Route
                        path="sessions"
                        element={<SessionSummaryPage />}
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to={ROUTES.ADMIN}
                                replace
                            />
                        }
                    />

                </Route>

            </Routes>
        </Router>
    );
}

export default App;
