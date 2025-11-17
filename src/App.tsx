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
import SprintIndex from "./pages/sprint/SprintIndex";
import WorkspaceLayout from "./layouts/WorkspaceLayout";

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
          <Route path="/workspaces/:slug" element={<WorkspaceLayout />}>
            <Route index element={<SprintIndex />} />
            {/* <Route path="tasks" element={<TaskBoardPage />} />
            <Route path="backlog" element={<BacklogPage />} />
            <Route path="history" element={<SprintHistoryPage />} />
            <Route
              path="settings"
              element={
                <OwnerOnly>
                  <WorkspaceSettingsPage />
                </OwnerOnly>
              }
            /> */}
          </Route>
        </Route>
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
