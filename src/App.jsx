import "./index.css";

import DataTable from "./components/DataTable/DataTable";
import TshirtCustomizer from "./components/TshirtCustomizer/TshirtCustomizer";

function App() {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-[60px] font-bold mb-8 text-[#303B58]">
          React Task For Print Manzil:
        </h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Custom Data Table:</h2>
          <DataTable />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">T-shirt Customizer :</h2>
          <TshirtCustomizer />
        </div>
      </div>
    </>
  );
}

export default App;
