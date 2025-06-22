import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import useDarkMode from '@/hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';
import { auth, signOut as firebaseSignOut } from '@/lib/firebase'; 

function ThemeToggle() {
    const [theme, toggleTheme] = useDarkMode();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
            {theme === 'dark' ? (
                <>
                    <Sun className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-gray-800 dark:text-white">Light Mode</span>
                </>
            ) : (
                <>
                    <Moon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-800 dark:text-white">Dark Mode</span>
                </>
            )}
        </button>
    );
}

export default function Navbar({ role }) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await firebaseSignOut(auth);
            Cookies.remove("auth");
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <nav className="bg-red dark:bg-gray-950 shadow-md px-4 sm:px-6 py-4 sticky top-0 z-50 border-b-2 border-yellow-400">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    💰 NewsDash Pro
                </h1>

                <ThemeToggle />
                
                <div className="flex items-center gap-4">
                    {/* Only show role when NOT on the root path */}
                    {router.pathname !== '/' && (
                        <>
                        <span className="text-sm font-semibold text-green-700 dark:text-gray-200">
                            Role: <span className="capitalize">{role}</span>
                        </span>
                         <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    >
                        Logout
                    </button>
                    </>
                    )}
                   
                </div>
            </div>
        </nav>
    );
}