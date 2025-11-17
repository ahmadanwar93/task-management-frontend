import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { GuestRoute } from "./components/auth/GuestRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import WorkspaceIndex from "./pages/workspace/WorkspaceIndex";
import RootRedirect from "./pages/RootRedirect";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginForm />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterForm />
            </GuestRoute>
          }
        />
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <AuthenticatedLayout />
              </WorkspaceProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkspaceIndex />} />
        </Route>
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
