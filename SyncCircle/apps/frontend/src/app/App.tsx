import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}
