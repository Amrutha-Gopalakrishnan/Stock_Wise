import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold text-destructive mb-4">404</h1>
      <p className="text-xl mb-6">Oops! Page not found</p>
      <a href="/" className="px-4 py-2 bg-primary text-white rounded-md">Return to Home</a>
    </div>
  );
};

export default NotFound;
