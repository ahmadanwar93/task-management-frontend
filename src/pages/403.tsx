import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">403</h1>
        <p className="text-xl text-gray-600 mt-4">Access Forbidden</p>
        <p className="text-gray-500 mt-2">
          You don't have permission to access this page.
        </p>
        <div className="mt-6 space-x-4">
          <Button asChild>
            <Link to="/" className="inline-block">
              Go Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/login" className="inline-block">
              Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// TODO: link this in each page if dont have permission
