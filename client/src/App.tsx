import { Switch, Route, useLocation } from "wouter";
import { Home } from "@/pages/Home";
import { Search } from "@/pages/Search";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";

function App() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;