import BrandHeader from "../components/BrandHeader";
import DashboardClient from "./DashboardClient";

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell report-page-shell">
        <BrandHeader />
        <DashboardClient />
      </div>
    </div>
  );
}
