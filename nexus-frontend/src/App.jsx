import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

// New Pages
import ExplorePage from './pages/ExplorePage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import StudentConnectPage from './pages/StudentConnectPage';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-white dark:!bg-dark-800 !text-dark-900 dark:!text-dark-100 !shadow-lg',
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<ChatPage />} />
          <Route path="/students" element={<StudentConnectPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
