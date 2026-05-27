// ==============================
// App Entry Component
// ------------------------------
// Wraps the application routes
// with all global providers
// ==============================

import Root from "./config/routes";
import ProvidersWrapper from "./config/provider/ProvidersWrapper";

function App() {
  return (
    // Global Providers Wrapper
    <ProvidersWrapper>
      {/* Application Routes */}
      <Root />
    </ProvidersWrapper>
  );
}

export default App;
