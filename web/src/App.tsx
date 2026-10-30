import { Outlet, Route, Routes } from "react-router";
import { ChatWidget } from "./components/chat/ChatWidget";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ArticlePage } from "./pages/ArticlePage";
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
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="essentials/:slug" element={<ArticlePage section="essentials" />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  );
}
