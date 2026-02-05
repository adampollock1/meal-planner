import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MealPlanProvider } from './context/MealPlanContext';
import { ToastProvider } from './context/ToastContext';
import { AccountProvider } from './context/AccountContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { MealPlan } from './pages/MealPlan';
import { MealList } from './pages/MealList';
import { GroceryList } from './pages/GroceryList';
import { Import } from './pages/Import';
import { Chat } from './pages/Chat';
import { Account } from './pages/Account';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AccountProvider>
          <ThemeProvider>
            <MealPlanProvider>
              <ChatProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="meals" element={<MealPlan />} />
                    <Route path="meal-list" element={<MealList />} />
                    <Route path="grocery" element={<GroceryList />} />
                    <Route path="import" element={<Import />} />
                    <Route path="account" element={<Account />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Routes>
              </ChatProvider>
            </MealPlanProvider>
          </ThemeProvider>
        </AccountProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
