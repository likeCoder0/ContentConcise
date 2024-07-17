import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const DashboardLayout = async ({ children }) => {
  return (
    <div className="h-full relative">
      <Navbar />
      {children}
    </div>
  );
};

export default DashboardLayout;
