import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DocumentList from './components/documents/DocumentList/DocumentList';
import DocumentEditor from './components/DocumentEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DocumentList />} />
          <Route path="documents/:id" element={<DocumentEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;