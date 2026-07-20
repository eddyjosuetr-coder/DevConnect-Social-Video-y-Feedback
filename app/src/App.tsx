import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import PostDetailPage from './pages/PostDetailPage';
import TagFeedPage from './pages/TagFeedPage';
import NotFound from './pages/NotFound';
import CustomCursor from './components/CustomCursor';

export default function App() {
  return (
    <>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/u/:userId" element={<UserProfile />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
        <Route path="/tag/:tag" element={<TagFeedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
