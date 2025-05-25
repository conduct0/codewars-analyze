import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeToggle } from "@/components/ModeToggle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CodewarsSearch from "@/components/CodewarsSearch";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-background">
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>
          <CodewarsSearch />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
