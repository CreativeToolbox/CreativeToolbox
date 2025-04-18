import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route 
} from 'react-router-dom';
import Layout from './components/Layout';
import DocumentList from './components/documents/DocumentList/DocumentList';
import DocumentEditor from './components/documents/DocumentEditor/DocumentEditor';
import DocumentViewer from './components/documents/DocumentViewer/DocumentViewer';
// import SearchPage from './components/SearchPage';         
import AuthPage from './components/auth/AuthPage';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { TitleProvider } from './contexts/TitleContext';

// Create router with future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Auth Route */}
      <Route path="/login" element={<AuthPage />} />
      
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<DocumentList mode="public" />} />
        <Route path="documents/:id/view" element={<DocumentViewer />} />
        {/* <Route path="search" element={<SearchPage />} /> */}
      </Route>

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<DocumentList mode="private" />} />
        <Route path="documents/new" element={<DocumentEditor />} />
        <Route path="documents/:id/edit" element={<DocumentEditor />} />
      </Route>
    </>
  ), 
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

function App() {
  return (
    <TitleProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </TitleProvider>
  );
}

export default App;