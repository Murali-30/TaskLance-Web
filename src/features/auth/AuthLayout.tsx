import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-secondary/15 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
