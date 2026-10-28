import { Outlet, Route, Routes } from "react-router";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ChecklistPage } from "./pages/ChecklistPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { HomePage } from "./pages/HomePage";

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  );
}
