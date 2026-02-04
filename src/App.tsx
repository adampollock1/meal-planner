import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MealPlanProvider } from './context/MealPlanContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { MealPlan } from './pages/MealPlan';
import { GroceryList } from './pages/GroceryList';
import { Import } from './pages/Import';
import { Chat } from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <MealPlanProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="chat" element={<Chat />} />
              <Route path="meals" element={<MealPlan />} />
              <Route path="grocery" element={<GroceryList />} />
              <Route path="import" element={<Import />} />
            </Route>
          </Routes>
        </MealPlanProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
