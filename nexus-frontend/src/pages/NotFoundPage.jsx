import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
      <div className="text-center animate-fade-in">
        <div className="text-[120px] font-black gradient-text leading-none mb-4">404</div>
        <h1 className="text-2xl font-bold text-dark-800 dark:text-dark-200 mb-2">Page not found</h1>
        <p className="text-dark-500 mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary rounded-xl px-8 py-3">
          Go Home
        </Link>
      </div>
    </div>
  );
}
