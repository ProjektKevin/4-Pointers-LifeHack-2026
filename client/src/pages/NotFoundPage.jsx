import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <Button
        onClick={() => navigate("/")}
        className="bg-black text-white hover:bg-grey-800"
      >
        Go Back Home
      </Button>
    </div>
  );
}

export default NotFoundPage;
