import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '../firebase/firebase.config';

const auth = getAuth(app);

export function withAuth<P>(WrappedComponent: React.ComponentType<P & { user: User }>) {
  return function AuthComponent(props: P) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) {
          router.replace('/vendor/login');
        } else {
          setUser(firebaseUser);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!user) return null;

    return <WrappedComponent {...props} user={user} />;
  };
}
