import { createContext, useContext, useState } from 'react';

const TitleContext = createContext({
  documentTitle: 'Story Editor',
  setDocumentTitle: () => {}
});

export function TitleProvider({ children }) {
  const [documentTitle, setDocumentTitle] = useState('Story Editor');

  return (
    <TitleContext.Provider value={{ documentTitle, setDocumentTitle }}>
      {children}
    </TitleContext.Provider>
  );
}

export function useTitle() {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error('useTitle must be used within a TitleProvider');
  }
  return context;
} 