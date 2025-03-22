import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import { SavingsProvider } from '../contexts/SavingsContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ExpenseProvider>
          <SavingsProvider>
            {children}
          </SavingsProvider>
        </ExpenseProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};
