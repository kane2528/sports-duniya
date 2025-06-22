import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { signInWithPopup, provider, auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

export default function Home() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const role = user.email === 'kanwar2523@gmail.com' ? 'admin' : 'user';
      Cookies.set('auth', JSON.stringify({ role, email: user.email }));
      router.push('/dashboard');
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  return (
    <>
    <Navbar/>
   <div className="min-h-screen flex flex-col justify-center items-center ">
    
  <div className="text-center px-6">
    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 mb-6 drop-shadow-lg">
      News Payout Dashboard
    </h1>
    <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 font-medium">
      Track articles. Earn more. Rule the news game.
    </p>
    <button
      onClick={handleGoogleLogin}
      className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      🚀 Login with Google
    </button>
  </div>
</div>
</>
  );
}