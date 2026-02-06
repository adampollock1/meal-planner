import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MealPlanProvider } from './context/MealPlanContext';
import { ToastProvider } from './context/ToastContext';
import { AccountProvider } from './context/AccountContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
                    {/* Public route - just shows welcome/overview */}
                    <Route index element={<Home />} />
                    
                    {/* Account page - handles both login and profile */}
                    <Route path="account" element={<Account />} />
                    
                    {/* Protected routes - require authentication */}
                    <Route path="chat" element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } />
                    <Route path="meals" element={
                      <ProtectedRoute>
                        <MealPlan />
                      </ProtectedRoute>
                    } />
                    <Route path="meal-list" element={
                      <ProtectedRoute>
                        <MealList />
                      </ProtectedRoute>
                    } />
                    <Route path="grocery" element={
                      <ProtectedRoute>
                        <GroceryList />
                      </ProtectedRoute>
                    } />
                    <Route path="import" element={
                      <ProtectedRoute>
                        <Import />
                      </ProtectedRoute>
                    } />
                    <Route path="settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
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
