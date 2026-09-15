import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Sources } from "./pages/Sources";
import { Logs } from "./pages/Logs";
import { AIMapping } from "./pages/AIMapping";
import { AuditLogs } from "./pages/AuditLogs";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import { DrawerProvider } from "./context/DrawerContext";
import { ToastProvider } from "./context/ToastContext";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DrawerProvider>
          <Routes>
            {/* Standalone Login Screen */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Command Center Shell */}
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Dashboard />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/ai-mapping" element={<AIMapping />} />
              <Route path="/audit" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} />

              {/* Backwards-compatible aliases */}
              <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
              <Route path="/raw-logs" element={<Navigate to="/logs" replace />} />
              <Route path="/normalized-logs" element={<Navigate to="/logs" replace />} />
              <Route path="/source-profiles" element={<Navigate to="/ai-mapping" replace />} />
              <Route path="/audit-logs" element={<Navigate to="/audit" replace />} />

              {/* Wildcard */}
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Route>
          </Routes>
        </DrawerProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
